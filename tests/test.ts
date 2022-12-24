import {icX}           from "../index";
import fs              from "fs";
import InterpreterIc10 from "ic10/src/main";
import {ic10Error}     from "ic10/src/ic10Error";

const settings = {
	debug            : true,
	debugCallback    : function () {
		console.log(...arguments)
	},
	logCallback      : function () {
		console.log(...arguments)
	},
	executionCallback: function (e: ic10Error) {
	},
};
describe('test', () => {
	test('vars', () => {
		const test = fs.readFileSync(__dirname + `/files/_.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/__.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('devices', () => {
		const test = fs.readFileSync(__dirname + `/files/devices.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_devices.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('example', () => {
		const test = fs.readFileSync(__dirname + `/files/example.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_example.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('float', () => {
		const test = fs.readFileSync(__dirname + `/files/float.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_float.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('foreach', () => {
		const test = fs.readFileSync(__dirname + `/files/foreach.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_foreach.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('if', () => {
		const test = fs.readFileSync(__dirname + `/files/if.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_if.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('stack', () => {
		const test = fs.readFileSync(__dirname + `/files/stack.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_stack.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('switch', () => {
		const test = fs.readFileSync(__dirname + `/files/switch.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_switch.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('useCommentsFalse', () => {
		const test = fs.readFileSync(__dirname + `/files/useCommentsFalse.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_useCommentsFalse.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('useCommentsTrue', () => {
		const test = fs.readFileSync(__dirname + `/files/useCommentsTrue.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_useCommentsTrue.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	test('vanillaFunctions', () => {
		const test = fs.readFileSync(__dirname + `/files/vanillaFunctions.icX`, 'utf8');
		const exp  = fs.readFileSync(__dirname + `/files/compile/_vanillaFunctions.ic10`, 'utf8');
		const ic   = new icX(test)
		const code = ic.getCompiled()
		expect(code).toBe(exp)
		const interpreterIc10 = new InterpreterIc10(code,settings)
		interpreterIc10.run()
	});

	// test('userFunctions', () => {
	// 	const test = fs.readFileSync(__dirname + `/files/userFunctions.icX`, 'utf8');
	// 	const exp  = fs.readFileSync(__dirname + `/files/compile/_userFunctions.ic10`, 'utf8');
	// 	const ic   = new icX(test)
	// 	const code = ic.getCompiled()
	// 	expect(code).toBe(exp)
	// 	const interpreterIc10 = new InterpreterIc10(code,settings)
	// 	interpreterIc10.run()
	// });
});