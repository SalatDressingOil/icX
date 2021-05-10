// import {icX} from "./dist";
// import fs from 'fs';

// var text = fs.readFileSync('./tests/000.icX', 'utf8');
// var a = new icX(text)
// var b = a.getCompiled()
// fs.writeFileSync('./tests/t2.ic10', b);



function parseMath() {
	const text = "(5 + (5 +5) * (5 + 5 / (7 / 8)))"
	const regex = /\((.+)\)/
	if(regex.test(text)){
		// @ts-ignore
		var txt = regex.exec(text)[1]
		// @ts-ignore

		const brakets:{open:number[],total:{start:any, end:any, in:any}[]} = {open:[],total:[]}
		
		for (let i = 0; i < txt.length; i++) {
			const key = txt[i];
			console.log(key, i)
			if (key === "("){
				brakets.open.push(i)
			} else if (key === ")") {
				var removed = brakets.open.pop() ?? -1
				// @ts-ignore
				brakets.total.push({start:removed, end:i})

			}
		}
		console.log(brakets)
	}
}
parseMath()
