import fs              from 'fs';
import {Err, Errors}   from "./src/err";
import {icX}           from "./index";
import InterpreterIc10 from "ic10/src/main";
import {ic10Error}     from "ic10/src/ic10Error";
import chalk           from "chalk";

try {
	const text = fs.readFileSync('./tests/_.icX', 'utf8');
	const a    = new icX(text);
	const r    = {};
	for (const key in a?.structure?.content) {
		if (Object.prototype.hasOwnProperty.call(a?.structure?.content, key)) {
			// @ts-ignore
			const element = a?.structure?.content[key];
			// @ts-ignore
			r[key]        = element.constructor.name
		}
	}
	const b: string | boolean = a.getCompiled();
	console.log(b)
	if (b) {
		const code = String(b)
		fs.writeFileSync('./tests/_.ic10', code);
		const settings          = {
			debug: true,
			debugCallback: function () {
				// console.log(...arguments)
			},
			logCallback: function () {
				console.log(chalk.blue(arguments[0]),...arguments)
			},
			executionCallback: function (e: ic10Error) {
				console.error(chalk.red(e.getMessage()),e.obj)
			},
		}
		const interpreterIc10 = new InterpreterIc10(code, settings);
		interpreterIc10.run()
	}
	// console.info(a.analyze())
	// console.log(vars)
} catch (e: Err | Errors | any) {
	if (e instanceof Err || e instanceof Errors) {
		console.log(e.getUserMessage())
	} else {
		console.log(e)
	}
}

