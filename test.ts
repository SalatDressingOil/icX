
import fs from 'fs';
import {Err, Errors} from "./src/err";
import {icX} from "./index";

try {
	var text = fs.readFileSync('./tests/_.icX', 'utf8');
	var a = new icX(text)
	var r = {}
	for (const key in a?.structure?.content) {
		if (Object.prototype.hasOwnProperty.call(a?.structure?.content, key)) {
			// @ts-ignore
			const element = a?.structure?.content[key];
			// @ts-ignore
			r[key] = element.constructor.name
		}
	}
	console.log(r)
	var b: string | boolean = a.getCompiled()
	if (b) {
		fs.writeFileSync('./tests/_.ic10', String(b));
	}
	console.info(b)
} catch (e: Err | Errors | any) {
	if (e instanceof Err || e instanceof Errors) {
		console.log(e.getUserMessage())
	} else {
		console.log(e)
	}
}

