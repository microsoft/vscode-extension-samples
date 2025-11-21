/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, workspace } from 'vscode';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export interface QuizQuestion {
	id: number;
	question: string;
	answer: string[];
	hints: string[];
	category: string;
	multipleChoice: boolean;
}

export interface QuizData {
	title?: string;
	quiz: QuizQuestion[];
}

// Local global variables.
const exitMessage = `Type "hint" for a hint`;

/**
 * Parse the range setting and return start and end indices
 * @param rangeStr The range string from settings (e.g., "0", "5", "3-6")
 * @param totalQuestions Total number of questions available
 * @returns Object with start and end indices
 */
function parseRange(rangeStr: string, totalQuestions: number): { start: number; end: number } {
	const trimmed = rangeStr.trim();
	
	// "0" means all questions
	if (trimmed === "0" || trimmed === "") {
		return { start: 0, end: totalQuestions };
	}
	
	// Check if it's a range like "3-6"
	if (trimmed.includes("-")) {
		const parts = trimmed.split("-");
		if (parts.length === 2) {
			const start = Math.max(1, parseInt(parts[0], 10)) - 1; // Convert to 0-based
			const end = Math.min(totalQuestions, parseInt(parts[1], 10));
			return { start, end };
		}
	}
	
	// Single number like "5" means first 5 questions
	const count = parseInt(trimmed, 10);
	if (!isNaN(count) && count > 0) {
		return { start: 0, end: Math.min(count, totalQuestions) };
	}
	
	// Default to all questions if parsing fails
	return { start: 0, end: totalQuestions };
}

export async function runQuiz():Promise<void> {
 // Load quiz data
 // __dirname points to 'out' folder, so we need to go up and into 'src'
 const dataPath = join(__dirname, '..', 'src', 'data.json');
 
 if (!existsSync(dataPath)) {
  window.showErrorMessage(`Quiz data file not found at: ${dataPath}`);
  return;
 }

 const quizData: QuizData = JSON.parse(readFileSync(dataPath, 'utf8'));
 
 // Get configuration settings
 const config = workspace.getConfiguration('prompt-quiz-sample');
 const randomize = config.get<boolean>('randomize', false);
 const order = config.get<string>('order', 'order');
 const rangeStr = config.get<string>('range', '0');
 const categoryFilter = config.get<string>('category', 'All Categories');
 const startPrompt = config.get<boolean>('startPrompt', true);
 
 // Show start prompt if enabled
 if (startPrompt) {
  const start = await window.showQuickPick(['Yes', 'No'], {
   placeHolder: 'Start the quiz?',
   ignoreFocusOut: true
  });
  
  if (start !== 'Yes') {
   return;
  }
 }
 
 // Start with all questions
 let questions = [...quizData.quiz];
 
 // Apply category filtering first (skip if "All Categories" is selected)
 if (categoryFilter && categoryFilter !== 'All Categories') {
  questions = questions.filter(q => q.category === categoryFilter);
  
  if (questions.length === 0) {
   window.showErrorMessage(
    `No questions found for category "${categoryFilter}". Please check your settings or choose a different category.`
   );
   return;
  }
 }
 
 // Apply ordering (before range)
 if (!randomize) {
  if (order === 'reverse') {
   questions.reverse();
  }
  // 'order' keeps original order, no action needed
 }
 
 // Apply range filtering
 const { start, end } = parseRange(rangeStr, questions.length);
 console.log(`Range settings: rangeStr="${rangeStr}", total questions after category filter=${questions.length}, start=${start}, end=${end}`);
 questions = questions.slice(start, end);
 console.log(`Questions after range filter: ${questions.length}`);
 
 // Apply randomization last (if enabled)
 if (randomize) {
  questions.sort(() => Math.random() - 0.5);
 }
 
 let currentQuestionIndex = 0;
 let correctAnswers = 0;
 const totalQuestions = questions.length;
 
 if (totalQuestions === 0) {
  window.showWarningMessage('No questions available with the current range settings.');
  return;
 }

 // Function to ask the next question
 const askQuestion = async () => {
  if (currentQuestionIndex >= totalQuestions) {
   // Quiz completed
   const percentage = Math.round((correctAnswers / totalQuestions) * 100);
   window.showInformationMessage(
    `Quiz completed! You got ${correctAnswers} out of ${totalQuestions} correct (${percentage}%).`
   );
   return;
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  // Handle multiple choice questions
  if (currentQuestion.multipleChoice) {
   // Create quick pick items from answers, shuffling them
   const shuffledAnswers = [...currentQuestion.answer].sort(() => Math.random() - 0.5);
   const correctAnswer = currentQuestion.answer[0];
   
   const pickedAnswer = await window.showQuickPick(shuffledAnswers, {
    placeHolder: `Question ${currentQuestionIndex + 1} of ${totalQuestions} [${currentQuestion.category}]`,
    ignoreFocusOut: true,
    title: currentQuestion.question
   });

   // Handle user input
   if (pickedAnswer === undefined) {
    window.showInformationMessage(
     `Quiz ended. You got ${correctAnswers} out of ${currentQuestionIndex} correct so far.`
    );
    return;
   }

   // Check if the picked answer is correct
   if (pickedAnswer === correctAnswer) {
    correctAnswers++;
    window.showInformationMessage('✓ Correct!');
   } else {
    window.showWarningMessage(`✗ Incorrect. The correct answer is: ${correctAnswer}`);
   }

   currentQuestionIndex++;
   setTimeout(() => askQuestion(), 500);
   return;
  }
  
  // Handle text input questions
  const currentQuestionPrompt = `${currentQuestion.question} ${exitMessage}`;
  const userAnswer = await window.showInputBox({
   prompt: currentQuestionPrompt,
   placeHolder: `Question ${currentQuestionIndex + 1} of ${totalQuestions} [${currentQuestion.category}]`,
   ignoreFocusOut: true,
   validateInput: (text) => {
    if (!text || text.trim() === '') {
     return currentQuestionPrompt;
    }
    return null;
   }
  });

  // Handle user input
  if (userAnswer === undefined || userAnswer.toLowerCase() === 'exit') {
   window.showInformationMessage(
    `Quiz ended. You got ${correctAnswers} out of ${currentQuestionIndex} correct so far.`
   );
   return;
  }

  if (userAnswer.toLowerCase() === 'hint') {
   // Show hint
   const hintIndex = Math.min(currentQuestion.hints.length - 1, Math.floor(Math.random() * currentQuestion.hints.length));
   window.showInformationMessage(`Hint: ${currentQuestion.hints[hintIndex]}`);
   // Ask the same question again
   await askQuestion();
   return;
  }

	// Check answer (case-insensitive, trim whitespace)
	const normalizedUserAnswer = userAnswer.toLowerCase().trim();
		const correctAnswerArray = currentQuestion.answer;

		// Check each answer
		let correctAnswer = false;
		correctAnswerArray.forEach(ans => {
			const normalizedCorrectAnswer = ans.toLowerCase().trim();
			if (normalizedUserAnswer === normalizedCorrectAnswer || 
							normalizedUserAnswer.includes(normalizedCorrectAnswer) ||
							normalizedCorrectAnswer.includes(normalizedUserAnswer)) {
				correctAnswer = true;
			}
		});

  if (correctAnswer) {
			correctAnswers++;
			window.showInformationMessage('✓ Correct!');
		} else {
			window.showWarningMessage(`✗ Incorrect. The correct answer is: ${currentQuestion.answer[0]}`);
		}  currentQuestionIndex++;
  
  // Ask next question after a brief moment
  setTimeout(() => askQuestion(), 500);
 };

 // Start the quiz
 askQuestion();
}