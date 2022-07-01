import fs            from 'fs';
import {Err, Errors} from "./src/err";
import {icX}         from "./index";
try {
	const text = fs.readFileSync('./tests/_.icX', 'utf8');
	const a = new icX(text);
	const r = {};
	for (const key in a?.structure?.content) {
		if (Object.prototype.hasOwnProperty.call(a?.structure?.content, key)) {
			// @ts-ignore
			const element = a?.structure?.content[key];
			// @ts-ignore
			r[key] = element.constructor.name
		}
	}
	const b: string | boolean = a.getCompiled();
	console.log(b)
	if (b) {
		fs.writeFileSync('./tests/_.ic10', String(b));
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

