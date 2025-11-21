#!/usr/bin/env node

/**
 * Script to sync quiz categories from data.json to package.json
 * This ensures the category dropdown in settings stays in sync with available categories
 */

/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */

const fs = require('fs');
const path = require('path');

// Paths
const dataJsonPath = path.join(__dirname, '..', 'src', 'data.json');
const packageJsonPath = path.join(__dirname, '..', 'package.json');

// Read data.json
const dataJson = JSON.parse(fs.readFileSync(dataJsonPath, 'utf8'));

// Extract unique categories
const categories = [...new Set(dataJson.quiz.map(q => q.category))].sort();

// Add "All Categories" at the beginning
const enumValues = ['All Categories', ...categories];

// Create enum descriptions
const enumDescriptions = [
	'Include questions from all categories',
	...categories.map(cat => {
		// Generate descriptions based on category names
		const descriptions = {
			'Extension Anatomy': 'Questions about extension structure and entry points',
			'Extension Manifest': 'Questions about package.json and extension configuration',
			'Contribution Points': 'Questions about contribution points in VS Code extensions',
			'VS Code API': 'Questions about the VS Code Extension API',
			'Extension Concepts': 'Questions about core extension development concepts',
			'Activation Events': 'Questions about extension activation',
			'Development Setup': 'Questions about development tools and setup',
			'VS Code Basics': 'Questions about basic VS Code usage',
			'Publishing': 'Questions about publishing extensions to the marketplace',
			'Debugging': 'Questions about debugging extensions'
		};
		return descriptions[cat] || `Questions about ${cat}`;
	})
];

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Update the category configuration
if (packageJson.contributes && 
    packageJson.contributes.configuration && 
    packageJson.contributes.configuration.properties &&
    packageJson.contributes.configuration.properties['prompt-quiz-sample.category']) {
	
	packageJson.contributes.configuration.properties['prompt-quiz-sample.category'].enum = enumValues;
	packageJson.contributes.configuration.properties['prompt-quiz-sample.category'].enumDescriptions = enumDescriptions;
	
	// Write back to package.json with proper formatting
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, '\t') + '\n', 'utf8');
	
	console.log('✓ Successfully synced categories to package.json');
	console.log(`  Found ${categories.length} categories: ${categories.join(', ')}`);
} else {
	console.error('✗ Could not find category configuration in package.json');
	process.exit(1);
}
