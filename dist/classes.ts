import {functions, ifs, use, variable, vars, whiles} from "./lists"
import {Err, Errors} from "./err";

const mathParser = require('@scicave/math-parser');

export class icXElem { //инструкция
	public originalPosition: number
	public originalText: string
	public scope: icXElem | null
	public command: { command: string, args: string[], empty: boolean } = {command: '', args: [], empty: true};
	public args: string = ""
	public rule: RegExpExecArray | null = null
	public re: RegExp[] = []
	public out: {
		txt: any[][],
		vars: variable[],
		temps: number,
		result: string,
		convert: (r: any, result: string | null, iter?: number, originalPosition?: number) => {}
		get: () => string
	} = {
		txt: [],
		vars: [],
		temps: 0,
		result: "",
		convert: function (r, result, originalPosition = 0) {
			if (r.type == 'operator') {
				var a0 = this.convert(r.args[0], null, originalPosition)
				var a1 = this.convert(r.args[1], null, originalPosition)
				if (a0 == Infinity || a0 == -Infinity || a1 == Infinity || a1 == -Infinity) {
					throw new Err(401, `Infinity is used`, originalPosition)
				}
				var temp: string | variable = ""
				if (result !== null) {
					temp = result
					this.result = result
				} else {
					temp = `__temp_${++this.temps}__`
				}
				if (!isNaN(+a0) && !isNaN(+a1)) {
					switch (r.name) {
						case '-':
							return +a0 - +a1
						case '+':
							return +a0 + +a1
						case '*':
							return +a0 * +a1
						case '/':
							if (+a1 === 0) throw new Err(402, "div by zero", originalPosition)
							return +a0 / +a1
						case '^':
							return Math.pow(+a0, +a1)
						case '%':
							return +a0 % +a1
					}
					return 0
				} else {
					switch (r.name) {
						case '-':
							this.txt.push(["sub", temp, a0, a1])
							break;
						case '+':
							this.txt.push(["add", temp, a0, a1])
							break;
						case '*':
							this.txt.push(["mul", temp, a0, a1])
							break;
						case '/':
							this.txt.push(["div", temp, a0, a1])
							break;
						case '%':
							this.txt.push(["mod", temp, a0, a1])
							break;
					}
					this.txt.push()
					return temp
				}
			} else if (r.type == 'number') {
				return r.value
			} else if (r.type == 'id') {
				return vars.get(r.name)
			}
			if (r.type == 'abs') {
				if (r.args[0].type == 'number') {
					return Math.abs(r.args[0].value)
				} else if (r.args[0].type == 'id') {
					this.txt.unshift(["abs", r.args[0].name, vars.get(r.args[0].name)])
					return r.args[0].name
				}
				return r.name
			}
		},
		get: function () {
			var used: { [id: string]: variable } = {}
			var map: { [id: string]: [number, number, variable?] } = {}
			this.txt.forEach((v, i, a) => {
				if (typeof v[1] !== "number" && v[1].startsWith("__temp_") && v[1].endsWith("__")) {
					if (!map[v[1]]) map[v[1]] = [i, i]
					else map[v[1]][0] = i
				}
				if (typeof v[2] !== "number" && v[2].startsWith("__temp_") && v[2].endsWith("__")) {
					if (!map[v[2]]) map[v[2]] = [0, i]
					else map[v[2]][1] = i
				}
				if (typeof v[3] !== "number" && v[3].startsWith("__temp_") && v[3].endsWith("__")) {
					if (!map[v[3]]) map[v[3]] = [0, i]
					else map[v[3]][1] = i
				}
			})
			this.txt.forEach((v, i, a) => {
				if (v[3] in map) {
					if (i == map[v[3]][1]) map[v[3]][2]?.release()
					v[3] = map[v[3]][2]?.to
				}
				if (v[2] in map) {
					if (i == map[v[2]][1]) map[v[2]][2]?.release()
					v[2] = map[v[2]][2]?.to
				}
				if (v[1] in map) {
					if (i == map[v[1]][0]) {
						map[v[1]][2] = vars.getTemp()
						v[1] = map[v[1]][2]?.to
					}
				}
			})
			var txt = this.txt.map((v) => v.join(" ")).join("\n") ?? ''
			this.txt = [];
			this.vars = []
			if (txt) {
				return txt
			} else {
				return ""
			}
		}
	};
	
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		this.scope = scope
		this.originalPosition = pos
		this.originalText = text
	}
	
	setCommand(e: { command: string, args: string[], empty: boolean }) {
		this.command = e
		if (!this.originalText) {
			this.originalText = this.command.command + ' ' + this.command.args.join(' ')
		}
		this.args = this.command.args.join(' ')
	}
	
	compile(): string | null {
		var re: RegExp
		var dots = this.parseDots(this.originalText)
		if (dots !== false) {
			return `${dots.fn} ${dots.op1} ${dots.op2} ${dots.op3} ${dots.op4 ?? ''}`
		}
		
		re = /([\.\d\w]+)\s{0,}(=)\s{0,}(.+)/i
		if (re.test(this.originalText)) {
			var a = re.exec(this.originalText)
			if (a == null) return null
			var math = this.parseMath(a[3], vars.get(a[1]))
			var txt = ''
			if (math !== false) {
				txt += math
			} else {
				txt += `move ${vars.get(a[1])} ${vars.get(a[3])}\n`
			}
			return txt
		}
		re = /\b([\w\d]+)?\(\)/i
		if (re.test(this.originalText)) {
			var a = re.exec(this.originalText)
			if (a == null) return null
			return `jal ${a[1]}\n`
		}
		
		return this.originalText
	}
	
	parseDots(text: string): { fn: string, op1: string | number | null, op2: string | number | null, op3: string | number | null, op4?: string | number } | false {
		var re: RegExp
		var byDots = text.split('.')
		if (byDots.length >= 2) {
				re = /\b([\w\d]+)\.([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\b/i
				if (re.test(text)) {
					var a = re.exec(text)
					if (a == null) return false
					return {
						fn: 's',
						op1: vars.get(a[1]),
						op2: vars.get(a[2]),
						op3: vars.get(a[4]),
					}
				}
			re = /\b([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\.([\w\d]+)\s{0,}$/i
			if (re.test(text)) {
				var a = re.exec(text)
				if (a == null) return false
				return {
					fn: 'l',
					op1: vars.get(a[1]),
					op2: vars.get(a[3]),
					op3: vars.get(a[4]),
				}
			}
			re = /\b([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\.slot\(([\w\d]+)\).([\w\d]+)\b/i
			if (re.test(text)) {
				var a = re.exec(text)
				if (a == null) return false
				return {
					fn: 'ls',
					op1: vars.get(a[1]),
					op2: vars.get(a[3]),
					op3: vars.get(a[4]),
					op4: vars.get(a[5]),
				}
			}
			re = /\b([\w\d]+)\s{0,}(=)\s{0,}d\(([\w\d]+)\).([\w\d]+)\(([\w\d]+)\b/i
			if (re.test(text)) {
				var a = re.exec(text)
				if (a == null) return false
				return {
					fn: 'lb',
					op1: vars.get(a[1]),
					op2: vars.get(a[3]),
					op3: vars.get(a[4]),
					op4: vars.get(a[5]),
				}
			}
		}
		return false
	}
	
	parseMath(text: string, r: string): string | false {
		
		text = text.replace(/\s+/g, "")
		const regex = /^(.+)$/
		if (regex.test(text)) {
			text = (regex.exec(text) ?? "")[1] ?? ""
			if (vars.exists(text))
				return `move ${r} ${vars.get(text)}`
			var math = mathParser.parse(text)
			try {
				var resultvar = this.out.convert(math, r, this.originalPosition)
				if (resultvar === Infinity || resultvar === -Infinity) throw new Err(403, `Infinity is used`, this.originalPosition)
			} catch (e) {
				throw new Err(403, e.message, this.originalPosition)
			}
			if (!isNaN(+resultvar))
				return `move ${r} ${resultvar}`
			
			var result = this.out.get()
			if (result === "") throw new Err(404, `${text} is not valid at line`, this.originalPosition)
			return result
		}
		return false;
	}
	
}

export class icXBlock extends icXElem { //блок инструкций
	public end: number | undefined
	public start: number | undefined
	public content: { [id: number]: icXElem } = {};
	public endKeys: RegExp = /\bend\b/i
	public tempVar?: variable
	
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		if (scope !== null)
			this.tempVar = vars.getTemp()
	}
	
	addElem(e: icXElem) {
		this.content[e.originalPosition] = e
	}
	
	parseRules() {
		var re = /\b([\.\d\w]+)\s{0,}(<|==|>|<=|>=|\||!=|\&|\~\=)\s{0,}([\s\.\d\w]+?\b)(\,[\s\.\d\w]+){0,}/i
		if (re.test(this.args)) {
			this.rule = re.exec(this.args)
			if (this.rule == null) return null
			switch (this.rule[2]) {
				case '<':
					if (parseInt(this.rule[3]) === 0) {
						return `sltz ${this.tempVar} ${vars.get(this.rule[1])}`
					} else {
						return `slt ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
				case '==':
					if (parseInt(this.rule[3]) === 0) {
						return `seqz ${this.tempVar} ${vars.get(this.rule[1])}`
					} else {
						return `seq ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
				case '>':
					if (parseInt(this.rule[3]) === 0) {
						return `sgtz ${this.tempVar} ${vars.get(this.rule[1])}`
					} else {
						return `sgt ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
				case '<=':
					if (parseInt(this.rule[3]) === 0) {
						return `slez ${this.tempVar} ${vars.get(this.rule[1])}`
					} else {
						return `sle ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
				case '>=':
					if (parseInt(this.rule[3]) === 0) {
						return `sgez ${this.tempVar} ${vars.get(this.rule[1])}`
					} else {
						return `sge ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
				case '|':
				case '||':
					return `or ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
				case '&':
				case '&&':
					return `and ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
				case '~=':
					if (parseInt(this.rule[3]) === 0) {
						return `sapz ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[4])}`
					} else {
						return `sap ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])} ${vars.get(this.rule[4])}`
					}
				case '!=':
					if (parseInt(this.rule[3]) === 0) {
						return `snez ${this.tempVar} ${vars.get(this.rule[1])}`
					} else {
						return `sne ${this.tempVar} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
			}
		}
		
	}
	
	setStart(line: number) {
		this.start = line
		return this
	}
	
	setEnd(line: number) {
		this.end = line
		return this.scope
	}
	
	compile() {
		const txt: string[] = []
		var err = new Errors
		for (const contentKey in this.content) {
			try {
				const text = this.content[contentKey].compile()
				if (text !== null)
					txt.push(text)
			} catch (e) {
				if (e.lvl == 'fatal') {
					throw e
				}
				err.push(e)
			}
		}
		if (err.isError()) {
			throw err
		}
		return txt.join("\n") + "\n"
	}
}

export class icXFunction extends icXBlock {
	public name: string | null = null
	
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bfunction\b/i)
		this.re.push(/\bdef\b/i)
	}
	
	setCommand(e: { command: string, args: string[], empty: boolean }) {
		super.setCommand(e)
		this.name = e.args[0]
	}
	
	compile() {
		var txt = `${this.name}:\n`
		txt += super.compile()
		txt += 'j ra\n'
		
		functions.add(txt)
		return ''
	}
}

export class icXIf extends icXBlock {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bif\b/i)
		
	}
	
	compile() {
		var isElse = false
		var r = this.parseRules()
		var l = ifs.get()
		var txt = []
		var _txt = []
		for (const contentKey in this.content) {
			if (this.content[contentKey].originalText.trim().toLowerCase() == 'else') {
				_txt.push(`j ${l}exit`)
				_txt.push(`${l}else:`)
				isElse = true
			} else {
				_txt.push(this.content[contentKey].compile())
			}
		}
		txt.push(r)
		if (!isElse) {
			txt.push(`beqz ${this.tempVar} ${l}exit`)
			txt.push(`beq ${this.tempVar} 1 ${l}`)
		} else {
			txt.push(`beqz ${this.tempVar} ${l}else`)
			txt.push(`beq ${this.tempVar} 1 ${l}`)
		}
		txt.push(`${l}:`)
		txt.push(_txt.join('\n'))
		txt.push(`${l}exit:`)
		this.tempVar?.release()
		return txt.join('\n') + '\n'
	}
}

export class icXWhile extends icXBlock {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bfor\b/i)
		this.re.push(/\bwhile\b/i)
	}
	
	compile() {
		var r = this.parseRules()
		var l = whiles.get()
		var txt = []
		txt.push(`${l}:`)
		txt.push(r)
		txt.push(`beqz ${this.tempVar} ${l}exit`)
		txt.push(super.compile())
		txt.push(`j ${l}`)
		txt.push(`${l}exit:`)
		return txt.join('\n') + '\n'
	}
}

export class icXVar extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bvar\b/i)
		
	}
	
	compile() {
		var txt = ''
		var a = this.command.args[0]
		var r = vars.set(a)
		var b = this.originalText.split('=')
		if (use.has("aliases")) {
			txt += `alias ${a} ${r.to}\n`
		}
		if (1 in b) {
			var dots = this.parseDots(this.command.args.join(''))
			if (dots) {
				txt += `${dots.fn} ${r} ${dots.op2} ${dots.op3} ${dots.op4 ?? ''}\n`
			} else {
				var math = this.parseMath(b[1], vars.get(r))
				if (math !== false) {
					txt += math
				} else {
					txt += `move ${r} ${b[1].trim()}\n`
				}
			}
		}
		return txt
	}
}

export class icXConst extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bconst\b/i)
	}
	
	compile() {
		var txt = ''
		if (this.command.args.length >= 2) {
			var a = this.command.args.join('')
			var b = a.split('=')
			b[0] = b[0].trim()
			if(isNaN(Number(b[1]))){
				b[1] = eval(b[1])
			}
			if(isNaN(Number(b[1]))){
				throw new Err(201, 'invalid constant value', this.originalPosition)
			}
			// vars.setAlias(b[0], b[0])
			txt += `define ${b[0]} ${b[1]}\n`
		}
		return txt
	}
}

export class icXAlias extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\balias\b/i)
	}
	
	compile() {
		throw new Err(100, 'You can`t use "alias" in "icX"', this.originalPosition)
		return ''
	}
}

export class icXLog extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bdebug\b/i)
	}
	
	compile() {
		return `#log ${vars.get(this.args)}`
	}
}

export class icXUse extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\buse\b/i)
	}
	
	compile(): "" {
		use.add(...this.command.args)
		return ""
	}
}

export class icXYield extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\byield\b/i)
	}
	
	compile() {
		return "yield"
	}
}
