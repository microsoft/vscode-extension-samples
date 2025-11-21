/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { QuizData, QuizQuestion } from './runQuiz';

interface QuizTaskDefinition extends vscode.TaskDefinition {
	type: 'quiz';
	action: 'make' | 'load';
}

export class QuizTaskProvider implements vscode.TaskProvider {
	static quizType = 'quiz' as const;
	private workspaceRoot: string;

	constructor(workspaceRoot: string) {
		this.workspaceRoot = workspaceRoot;
	}

	public async provideTasks(): Promise<vscode.Task[]> {
		return this.getTasks();
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		const action = _task.definition.action;
		if (action) {
			const definition = _task.definition as QuizTaskDefinition;
			return this.getTask(definition.action);
		}
		return undefined;
	}

	private getTasks(): vscode.Task[] {
		const makeTask = this.getTask('make');
		const loadTask = this.getTask('load');
		return [makeTask, loadTask];
	}

	private getTask(action: 'make' | 'load'): vscode.Task {
		const definition: QuizTaskDefinition = {
			type: QuizTaskProvider.quizType,
			action: action
		};

		const task = new vscode.Task(
			definition,
			vscode.TaskScope.Workspace,
			action === 'make' ? 'Make Quiz' : 'Load Quiz',
			QuizTaskProvider.quizType,
			new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
				return new QuizTaskTerminal(this.workspaceRoot, action);
			})
		);

		return task;
	}
}

class QuizTaskTerminal implements vscode.Pseudoterminal {
	private writeEmitter = new vscode.EventEmitter<string>();
	onDidWrite: vscode.Event<string> = this.writeEmitter.event;
	private closeEmitter = new vscode.EventEmitter<number>();
	onDidClose?: vscode.Event<number> = this.closeEmitter.event;

	private workspaceRoot: string;
	private action: 'make' | 'load';

	constructor(workspaceRoot: string, action: 'make' | 'load') {
		this.workspaceRoot = workspaceRoot;
		this.action = action;
	}

	open(_initialDimensions: vscode.TerminalDimensions | undefined): void {
		this.executeTask();
	}

	close(): void {}

	private writeLine(message: string): void {
		this.writeEmitter.fire(message + '\r\n');
	}

	private async executeTask(): Promise<void> {
		try {
			if (this.action === 'make') {
				await this.makeQuiz();
			} else {
				await this.loadQuiz();
			}
			this.closeEmitter.fire(0);
		} catch (error) {
			this.writeLine(`\r\nError: ${error}`);
			this.closeEmitter.fire(1);
		}
	}

	private async makeQuiz(): Promise<void> {
		this.writeLine('=== Make Quiz ===\r\n');

		// Step 1 & 2: Save current quiz
		await this.saveCurrentQuiz();

		// Step 3: Prompt for new quiz title
		const newTitle = await vscode.window.showInputBox({
			prompt: 'Enter the title for the new quiz',
			placeHolder: 'e.g., javascript-basics'
		});

		if (!newTitle) {
			this.writeLine('Quiz creation cancelled.');
			return;
		}

		const sanitizedTitle = this.sanitizeFileName(newTitle);
		this.writeLine(`Creating new quiz: ${sanitizedTitle}\r\n`);

		const questions: QuizQuestion[] = [];
		let questionNumber = 1;

		// Step 4-7: Collect questions
		while (true) {
			const question = await vscode.window.showInputBox({
				prompt: `Enter question ${questionNumber} (input "done" to finish):`,
				placeHolder: 'Type your question here'
			});

			if (!question || question.toLowerCase() === 'done') {
				break;
			}

			// Ask if multiple choice
			const isMultipleChoice = await vscode.window.showQuickPick(['No', 'Yes'], {
				placeHolder: 'Is this multiple choice? (Default: No)'
			});

			const multipleChoice = isMultipleChoice === 'Yes';
			let answers: string[] = [];

			if (multipleChoice) {
				// Multiple choice
				const correctAnswer = await vscode.window.showInputBox({
					prompt: 'Enter correct answer:',
					placeHolder: 'Correct answer'
				});

				if (!correctAnswer) {
					this.writeLine('Skipping question - no correct answer provided.');
					continue;
				}

				answers.push(correctAnswer);

				// Collect wrong answers
				while (answers.length < 5) {
					const wrongAnswer = await vscode.window.showInputBox({
						prompt: `Enter additional wrong answer for selection (${5 - answers.length} more needed, or "done" to finish):`,
						placeHolder: 'Wrong answer option'
					});

					if (!wrongAnswer || wrongAnswer.toLowerCase() === 'done') {
						if (answers.length < 2) {
							this.writeLine('Multiple choice requires at least 2 answers. Adding placeholder...');
							answers.push('Option ' + (answers.length + 1));
						} else {
							break;
						}
					} else {
						answers.push(wrongAnswer);
					}
				}
			} else {
				// Text input - multiple correct answers
				const answersInput = await vscode.window.showInputBox({
					prompt: 'Enter correct answer(s) as array:',
					placeHolder: 'EXAMPLE: "one two", "two one", "one and two"'
				});

				if (!answersInput) {
					this.writeLine('Skipping question - no answers provided.');
					continue;
				}

				// Parse comma-separated answers with quotes
				answers = answersInput.split(',').map(a => a.trim().replace(/^"|"$/g, ''));
			}

			// Prompt for category
			const category = await vscode.window.showInputBox({
				prompt: 'Input category (input "all" or press ENTER to use for all categories):',
				placeHolder: 'Category name'
			});

			const finalCategory = !category || category.toLowerCase() === 'all' ? 'all' : category;

			// Prompt for hints
			const hintsInput = await vscode.window.showInputBox({
				prompt: 'Input hint(s) as array:',
				placeHolder: 'EXAMPLE: "string version of 1 and 2", "Adding number of both equals 3"'
			});

			const hints = hintsInput
				? hintsInput.split(',').map(h => h.trim().replace(/^"|"$/g, ''))
				: [];

			// Add question
			questions.push({
				id: questionNumber,
				question: question,
				answer: answers,
				hints: hints,
				category: finalCategory,
				multipleChoice: multipleChoice
			});

			this.writeLine(`Question ${questionNumber} added successfully.\r\n`);
			questionNumber++;
		}

		if (questions.length === 0) {
			this.writeLine('No questions were added. Quiz creation cancelled.');
			return;
		}

		// Step 8: Generate new data.json
		const newQuizData: QuizData = {
			title: sanitizedTitle,
			quiz: questions
		};

		const dataPath = path.join(this.workspaceRoot, 'src', 'data.json');
		fs.writeFileSync(dataPath, JSON.stringify(newQuizData, null, 2), 'utf8');

		this.writeLine(`\r\n✓ New quiz "${sanitizedTitle}" created successfully with ${questions.length} questions!`);
		this.writeLine(`✓ Saved to: ${dataPath}`);
	}

	private async loadQuiz(): Promise<void> {
		this.writeLine('=== Load Quiz ===\r\n');

		// Step 1 & 2: Save current quiz
		await this.saveCurrentQuiz();

		// Step 3: List available quizzes
		const quizDir = path.join(this.workspaceRoot, 'src', 'quiz');
		
		if (!fs.existsSync(quizDir)) {
			this.writeLine('No saved quizzes found. Quiz directory does not exist.');
			return;
		}

		const files = fs.readdirSync(quizDir).filter(f => f.endsWith('.json'));

		if (files.length === 0) {
			this.writeLine('No saved quizzes found.');
			return;
		}

		this.writeLine('Available quizzes:\r\n');
		const quizOptions = files.map((file, index) => {
			const name = path.basename(file, '.json');
			return `${index + 1}  ${name}`;
		});

		// Show quick pick
		const selection = await vscode.window.showQuickPick(quizOptions, {
			placeHolder: 'Select the quiz to load'
		});

		if (!selection) {
			this.writeLine('Load quiz cancelled.');
			return;
		}

		// Extract index and file
		const selectedIndex = parseInt(selection.split(' ')[0]) - 1;
		const selectedFile = files[selectedIndex];
		const sourcePath = path.join(quizDir, selectedFile);
		const destPath = path.join(this.workspaceRoot, 'src', 'data.json');

		// Step 4: Copy selected quiz to data.json
		fs.copyFileSync(sourcePath, destPath);

		this.writeLine(`\r\n✓ Quiz "${path.basename(selectedFile, '.json')}" loaded successfully!`);
		this.writeLine(`✓ Loaded from: ${sourcePath}`);
		this.writeLine(`✓ Active quiz: ${destPath}`);
	}

	private async saveCurrentQuiz(): Promise<void> {
		const dataPath = path.join(this.workspaceRoot, 'src', 'data.json');
		
		if (!fs.existsSync(dataPath)) {
			this.writeLine('No current quiz to save (data.json not found).');
			return;
		}

		// Read current quiz
		const quizData: QuizData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
		let quizTitle = quizData.title;

		// Ensure quiz directory exists
		const quizDir = path.join(this.workspaceRoot, 'src', 'quiz');
		if (!fs.existsSync(quizDir)) {
			fs.mkdirSync(quizDir, { recursive: true });
			this.writeLine(`Created quiz directory: ${quizDir}\r\n`);
		}

		// Handle title
		if (!quizTitle) {
			const promptTitle = await vscode.window.showInputBox({
				prompt: 'Current quiz has no title. Enter a title to save it:',
				placeHolder: 'e.g., my-quiz'
			});

			if (!promptTitle) {
				quizTitle = this.generateSequentialName(quizDir);
			} else {
				quizTitle = this.sanitizeFileName(promptTitle);
			}

			// Update data.json with title
			quizData.title = quizTitle;
			fs.writeFileSync(dataPath, JSON.stringify(quizData, null, 2), 'utf8');
		} else {
			quizTitle = this.sanitizeFileName(quizTitle);
		}

		// Save quiz
		const savePath = path.join(quizDir, `${quizTitle}.json`);
		fs.writeFileSync(savePath, JSON.stringify(quizData, null, 2), 'utf8');

		this.writeLine(`Current quiz saved as: ${quizTitle}.json\r\n`);
	}

	private sanitizeFileName(name: string): string {
		// Replace spaces with hyphens
		let sanitized = name.replace(/\s+/g, '-');
		
		// Remove illegal filename characters
		sanitized = sanitized.replace(/[<>:"/\\|?*]/g, '');
		
		// Ensure it's not empty
		if (!sanitized || sanitized.length === 0) {
			return 'quiz';
		}
		
		return sanitized;
	}

	private generateSequentialName(quizDir: string): string {
		let counter = 1;
		let fileName = `quiz-${counter}.json`;
		
		while (fs.existsSync(path.join(quizDir, fileName))) {
			counter++;
			fileName = `quiz-${counter}.json`;
		}
		
		return `quiz-${counter}`;
	}
}
