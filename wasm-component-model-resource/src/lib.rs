/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
mod calculator;

use std::cell::RefCell;
use crate::calculator::exports::vscode::example::types::{ Guest, GuestEngine, Operation };

struct EngineImpl {
	left: Option<u32>,
	right: Option<u32>,
}

impl EngineImpl {
	fn new() -> Self {
		EngineImpl {
			left: None,
			right: None,
		}
	}

	fn push_operand(&mut self, operand: u32) {
		if self.left == None {
			self.left = Some(operand);
		} else {
			self.right = Some(operand);
		}
	}

	fn push_operation(&mut self, operation: Operation) {
		match operation {
			Operation::Add => {
				let result = self.left.unwrap() + self.right.unwrap();
				self.left = Some(result);
			},
			Operation::Sub => {
				let result = self.left.unwrap() - self.right.unwrap();
				self.left = Some(result);
			},
			Operation::Mul => {
				let result = self.left.unwrap() * self.right.unwrap();
				self.left = Some(result);
			},
			Operation::Div => {
				let result = self.left.unwrap() / self.right.unwrap();
				self.left = Some(result);
			},
		}
	}

	fn execute(&mut self) -> u32 {
		return self.left.unwrap();
	}
}

struct CalcEngine {
	stack: RefCell<EngineImpl>,
}

impl GuestEngine for CalcEngine {

	fn new() -> Self {
		CalcEngine {
			stack: RefCell::new(EngineImpl::new())
		}
	}

	fn push_operand(&self, operand: u32) {
		self.stack.borrow_mut().push_operand(operand);
	}

	fn push_operation(&self,operation:Operation) {
		self.stack.borrow_mut().push_operation(operation);
	}

	fn execute(&self) -> u32 {
		return self.stack.borrow_mut().execute();
	}
}

struct Implementation;
impl Guest for Implementation {
	type Engine = CalcEngine;
}

calculator::export!(Implementation with_types_in calculator);