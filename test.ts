import {icX} from "./dist";
import fs from 'fs';

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
var b = ""
try {
	b = a.getCompiled()
	fs.writeFileSync('./tests/_.ic10', b);
	console.info(b)
} catch(e) {
	console.log(e)
}

