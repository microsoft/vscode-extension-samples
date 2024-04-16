// Use a procedural macro to generate bindings for the world we specified in
// `host.wit`
wit_bindgen::generate!({
	// the name of the world in the `*.wit` input file
	world: "calculator",
});

struct MyType;

impl Guest for MyType {

    fn calc(op: Operation) -> u32 {
		log(&format!("Starting calculation: {:?}", op));
		let result = match op {
			Operation::Add(operands) => operands.left + operands.right,
			Operation::Sub(operands) => operands.left - operands.right,
			Operation::Mul(operands) => operands.left * operands.right,
			Operation::Div(operands) => operands.left / operands.right,
		};
		log(&format!("Finished calculation: {:?}", op));
		return result;
	}
}

export!(MyType);