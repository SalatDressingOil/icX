// @ts-ignore
import mathParser from '@scicave/math-parser';
import {vars} from "./dist/lists";
// import {icX} from "./dist";
// import fs from 'fs';

// var text = fs.readFileSync('./tests/000.icX', 'utf8');
// var a = new icX(text)
// var b = a.getCompiled()
// fs.writeFileSync('./tests/t2.ic10', b);

function parseMath() {
	var text = `( |r8| * -1)`
	
	var out: {
		txt: string[],
		max: number,
		v: number,
		convert: (r: any) => {}
	} = {
		txt: [],
		max: 1,
		v: -1,
		convert: function (r) {
			if (this.v >= 2) {
				this.v = 0
				this.max = 2
			}
			
			if (r.type == 'operator') {
				var a0 = this.convert(r.args[0])
				var a1 = this.convert(r.args[1])
				this.max = (++this.v <= 0) ? 1 : this.v;
				switch (r.name) {
					case '-':
						this.txt.push(`sub r${this.v} ${a0} ${a1}`)
						break;
					case '+':
						this.txt.push(`add r${this.v} ${a0} ${a1}`)
						break;
					case '*':
						this.txt.push(`mul r${this.v} ${a0} ${a1}`)
						break;
					case '/':
						this.txt.push(`div r${this.v} ${a0} ${a1}`)
						break;
					case '%':
						this.txt.push(`mod r${this.v} ${a0} ${a1}`)
						break;
				}
				this.txt.push()
				return `r${this.v}`
			} else if (r.type == 'number') {
				return r.value
			} else if (r.type == 'id') {
				return r.name
			}
			if (r.type == 'abs') {
				if (r.args[0].type == 'number') {
					return Math.abs(r.args[0].value)
				} else if (r.args[0].type == 'id') {
					this.txt.unshift(`abs ${r.args[0].name} ${r.args[0].name}`)
					return r.args[0].name
				}
				return r.name
			}
		}
	};
	text = text.replace(/\s+/g, "")
	const regex = /^\((.+)\)$/
	if (regex.test(text)) {
		text = (regex.exec(text) ?? "")[1] ?? ""
		var math = mathParser.parse(text)
		out.convert(math)
		if (out.v > 0) {
			out.txt.push(`move r0 r${out.v}`)
		}
		vars.count = out.max
		return out.txt.join("\n")
	}
	
}

console.log(parseMath())
console.log(vars.count)
