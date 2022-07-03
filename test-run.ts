import {Err, Errors}                          from "./src/err";
import {CompileExpectedTest, ResultContainer} from "./tests/tests";

const testCases = [
	{icX: '_', ic10: '_', skip: false},
	{icX: 'useCommentsTrue', ic10: 'useCommentsTrue', skip: false},
	{icX: 'useCommentsFalse', ic10: 'useCommentsFalse', skip: false},
	{icX: 'example', ic10: 'example', skip: false},
	{icX: 'aliasForD0', ic10: 'aliasForD0', skip: false},
	{icX: 'switch', ic10: 'switch', skip: false},
	{icX: 'float', ic10: 'float', skip: false},
	{icX: 'devices', ic10: 'devices', skip: false},
	{icX: 'foreach', ic10: 'foreach', skip: false},
	{icX: 'vanillaFunctions', ic10: 'vanillaFunctions', skip: false},
	{icX: 'stack', ic10: 'stack', skip: false},
	{icX: 'if', ic10: 'if', skip: false},
]

let getLog = (result: boolean, name: string, current?: string, expected?: string) => {
	let text: string = result ? `Test passed: [${name}]` : `Test failed: [${name}]`;
	if (current) {
		text += `\nCurrent result:\n${current}`
			.split("\n")
			.map((str) => {
				return `\t${str}`
			}).join("\n")
	}
	if (expected) {
		text += `\n\nExpected result:\n${expected}`
			.split("\n")
			.map((str) => {
				return `\t${str}`
			}).join("\n")
	}
	return text
}

const testsErrors = new Errors;

try {
	testCases.forEach(function (testCase) {
		let tr: ResultContainer = new CompileExpectedTest(testCase.icX, testCase.ic10, testCase.skip).test();
		let text                = tr.result
								  ? {color: '\x1b[32m', text: getLog(tr.result, tr.name)}
								  : {color: '\x1b[31m', text: getLog(tr.result, tr.name, tr.current, tr.expected)}
		if (testCase.skip !== undefined && !testCase.skip) {
			if (!tr.result) {
				const e   = new Err(600);
				e.message = text.text
				testsErrors.push(e)
			}
			console.log(text.color, text.text);
		}
	});
} catch (e: Err | Errors | any) {
	let a: Err;
	if (e instanceof Err || e instanceof Errors) {
		if (e instanceof Err) {
			testsErrors.push(e)
		} else {
			a         = new Err(600)
			// @ts-ignore
			a.message = e.getUserMessage()
			testsErrors.push(a)
		}
		console.error(e.getUserMessage())
	} else {
		a         = new Err(600)
		a.message = e
		testsErrors.push(a)
		console.error(e)
	}
}
if (testsErrors.isError()) {
	throw testsErrors.getUserMessage()
}

