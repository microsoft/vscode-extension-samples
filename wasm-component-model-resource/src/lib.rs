// Use a procedural macro to generate bindings for the world we specified in
// `host.wit`
// wit_bindgen::generate!({
// 	// the name of the world in the `*.wit` input file
// 	world: "calculator",
// });

mod bindings;

use std::cell::RefCell;
use crate::bindings::exports::vscode::example::types::{ Guest, GuestEngine, Operation };


enum StackElement {
	Operand(u32),
	Operation(Operation),
}

struct Stack {
	values: Vec<StackElement>
}

impl Stack {
	fn new() -> Self {
		Stack {
			values: Vec::new()
		}
	}

	fn push_operand(&mut self, operand: u32) {
		self.values.push(StackElement::Operand(operand));
	}

	fn push_operation(&mut self, operation: Operation) {
		self.values.push(StackElement::Operation(operation));
	}

	fn execute(&mut self) -> u32 {
		let mut result = 0;
		let mut left = 0;
		let mut right = 0;
		let mut operation: &Operation = &Operation::Add;
		self.values.reverse();
		let iter = self.values.iter();
		for element in iter {
			match element {
				StackElement::Operand(operand) => {
					if left == 0 {
						left = *operand;
					} else {
						right = *operand;
					}
				},
				StackElement::Operation(op) => {
					match operation {
						Operation::Add => {
							result = left + right;
						},
						Operation::Sub => {
							result = left - right;
						},
						Operation::Mul => {
							result = left * right;
						},
						Operation::Div => {
							result = left / right;
						},
					}
					operation = op;
				}
			}
		}
		self.values.clear();
		return result;
	}
}

struct CalcEngine {
	stack: RefCell<Stack>,
}

impl GuestEngine for CalcEngine {

	fn new() -> Self {
		CalcEngine {
			stack: RefCell::new(Stack::new())
		}
	}

	fn push_operand(&self, operand: u32) {
		self.stack.borrow_mut().push_operand(operand);
	}

	fn push_operation(&self,operation:Operation,) {
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

bindings::export!(Implementation with_types_in bindings);