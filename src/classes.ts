import {functions, ifs, use, variable, vars, whiles} from "./lists"
import {Err, Errors}                                 from "./err"
import {regexes}                                     from "../index";

const functionList: string[] = require('./ic10.functions.json');

const mathParser = require('@scicave/math-parser')


export class icXElem { //инструкция
	public originalPosition: number
	public comment: string;
	public originalText: string
	public scope: icXElem | null
	public command: { command: string, args: string[], empty: boolean, comment: string } = {command: '', args: [], empty: true, comment: ''};
	public args: string = ""
	public rule: RegExpExecArray | null = null
	public re: RegExp[] = []
	public out: {
		txt: any[][],
		vars: variable[],
		temps: number,
		result: string,
		convert: (r: any, result: string | null, originalPosition?: number, settings?: { noVars: boolean, define: boolean }) => {}
		get: () => string
	} = {
		txt: [],
		vars: [],
		temps: 0,
		result: "",
		convert: function (r, result, originalPosition = 0, settings = {noVars: false, define: false}) {
			if (r.type == 'operator') {
				const a0 = this.convert(r.args[0], null, originalPosition, settings);
				const a1 = this.convert(r.args[1], null, originalPosition, settings);
				if (a0 == Infinity || a0 == -Infinity || a1 == Infinity || a1 == -Infinity) {
					throw new Err(401, originalPosition)
				}
				let temp: string | variable;
				if (result !== null) {
					temp        = result
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
							if (+a1 === 0) throw new Err(402, originalPosition)
							return +a0 / +a1
						case '^':
							return Math.pow(+a0, +a1)
						case '%':
							if (+a1 === 0) throw new Err(403, originalPosition)
							return +a0 % +a1
					}
					return 0
				} else {
					switch (r.name) {
						case '-':
							this.txt.push(["sub", temp, a0, a1])
							break
						case '+':
							this.txt.push(["add", temp, a0, a1])
							break
						case '*':
							this.txt.push(["mul", temp, a0, a1])
							break
						case '/':
							if (+a1 === 0) throw new Err(402, originalPosition)
							this.txt.push(["div", temp, a0, a1])
							break
						case '%':
							if (+a1 === 0) throw new Err(403, originalPosition)
							this.txt.push(["mod", temp, a0, a1])
							break
					}
					this.txt.push()
					return temp
				}
			} else if (r.type == 'number') {
				return r.value
			} else if (r.type == 'id') {
				if (settings.noVars) {
					if (isNaN(Number(vars.get(r.name))))
						throw new Err(901)
					else return vars.get(r.name)
				}
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
			const map: { [id: string]: [number, number, variable?] } = {};
			this.txt.forEach((v, i) => {
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
			this.txt.forEach((v, i) => {
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
			const txt = this.txt.map((v) => v.join(" ")).join("\n") ?? '';
			this.txt  = []
			this.vars = []
			if (txt) {
				return txt
			} else {
				return ""
			}
		}
	};

	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		const sp = text.split('#');
		text = sp[0]
		this.comment = sp[1] ? sp[1].trim() : ''
		if (this.comment.startsWith('!')) {
			this.comment = ''
		}
		this.scope = scope
		this.originalPosition = pos
		this.originalText = text

	}

	setCommand(e: { command: string, args: string[], empty: boolean, comment: string }) {
		this.command = e
		if (!this.originalText) {
			this.originalText = this.command.command + ' ' + this.command.args.join(' ')
			if (this.command.comment) {
				this.originalText += ' # ' + this.command.comment
			}
		}
		this.args = this.command.args.join(' ')
	}

	compile(parent?: icXElem): string | null {
		let txt;
		let a;
		let re: RegExp;
		const dots = this.parseDots(this.originalText);
		if (dots !== false) {
			return `${dots.fn} ${dots.op1} ${dots.op2} ${dots.op3} ${dots.op4 ?? ''}`
		}

		re = /([.\d\w]+)\s*(=)\s*(.+)/i
		if (re.test(this.originalText)) {
			a = re.exec(this.originalText);
			if (a == null) return null
			const reFn = /(\w+)\(([\w,]*)\)/;
			const b    = this.originalText.split('=');
			txt        = '';
			if (reFn.test(b[1])) {
				const m = reFn.exec(b[1])
				if (m) {
					const func = m[1]
					const args = m[2].split(",")
					switch (func) {
						case 'select':
						case 'move':
						case 'add':
						case 'sub':
						case 'mul':
						case 'div':
						case 'mod':
						case 'sqrt':
						case 'round':
						case 'trunc':
						case 'ceil':
						case 'floor':
						case 'max':
						case 'min':
						case 'abs':
						case 'log':
						case 'exp':
						case 'rand':
						case 'sin':
						case 'cos':
						case 'tan':
						case 'asin':
						case 'acos':
						case 'atan':
						case 'slt':
						case 'sltz':
						case 'sgt':
						case 'sgtz':
						case 'sle':
						case 'slez':
						case 'sge':
						case 'sgez':
						case 'seq':
						case 'seqz':
						case 'sne':
						case 'snez':
						case 'sap':
						case 'sapz':
						case 'sna':
						case 'snaz':
						case 'sdse':
						case 'sdns':
						case 'and':
						case 'or':
						case 'xor':
						case 'nor':
							txt += `${func} ${vars.get(a[1])}`
							for (const arg of args) {
								txt += ` ${vars.get(arg)}`
							}
							txt += "\n"
							break;
						default:
							throw new Err(504, this.originalPosition)
					}
				}
			} else {
				const math = this.parseMath(a[3], vars.get(a[1]));
				if (math !== false) {
					txt += math
				} else {
					txt += `move ${vars.get(a[1])} ${vars.get(a[3])}\n`
				}
			}
			return txt
		}
		re = /\b([\w-]+)?\(\)/i
		if (re.test(this.originalText)) {
			a = re.exec(this.originalText);
			if (a == null) return null
			txt = `jal ${a[1]}\n`;
			txt = this.addComment(txt)
			return txt
		}
		for (const functionListKey in functionList) {
			if (this.originalText.trim().startsWith(functionList[functionListKey])) {
				const args = this.originalText.trim().split(/\s+/);
				for (const argsKey in args) {
					if (parseInt(argsKey) > 0) {
						args[argsKey] = vars.get(args[argsKey])
					}
				}
				return args.join(' ')
			}
		}
		return this.originalText
	}

	parseDots(text: string): { fn: string, op1: string | number | null, op2: string | number | null, op3: string | number | null, op4?: string | number } | false {
		let a;
		let re: RegExp;
		const byEq = text.trim().split('=');
		if (byEq.length == 2) {
			if (parseFloat(byEq[1]) && (this instanceof icXVar || this instanceof icXConst)) {
				return false;
			}
		}
		const byDots = text.split('.');

		if (byDots.length >= 2) {
			if (/^\d+$/g.test(byDots[1])) {
				return false;
			}
			re = /\b([\w-\[\]]+)\.([\w-]+)\s*(=)\s*([\w-]+)\b/i
			if (re.test(text)) {
				a = re.exec(text);
				if (a == null) return false
				return {
					fn: 's',
					op1: vars.get(a[1]),
					op2: a[2],
					op3: vars.get(a[4]),
				}
			}
			re = /\b([\w-]+)\s*(=)\s*([\w-\[\]]+)\.slot\(([\w-]+)\).([\w-]+)\b/i
			if (re.test(text)) {
				a = re.exec(text);
				if (a == null) return false
				return {
					fn: 'ls',
					op1: vars.get(a[1]),
					op2: vars.get(a[3]),
					op3: vars.get(a[4]),
					op4: a[5],
				}
			}
			re = /\b([\w-]+)\s*(=)\s*([\w-\[\]]+)\.([\w-]+)\s*\b/i
			if (re.test(text)) {
				a = re.exec(text);
				if (a == null) return false
				return {
					fn: 'l',
					op1: vars.get(a[1]),
					op2: vars.get(a[3]),
					op3: a[4],
				}
			}
			re = /\b([\w-]+)\s*(=)\s*d\(([\w-]+)\).([\w-]+)\(([\w-]+)\b/i
			if (re.test(text)) {
				a = re.exec(text);
				if (a == null) return false
				return {
					fn: 'lb',
					op1: vars.get(a[1]),
					op2: vars.get(a[3]),
					op3: vars.get(a[4]),
					op4: vars.get(a[5]),
				}
			}
			re = /\bd\(([\w-]+)\)\.([\w-\d]+)\s*(=)\s*([\w-]+)/i
			if (re.test(text)) {
				a = re.exec(text);
				if (a == null) return false
				return {
					fn: 'sb',
					op1: vars.get(a[1]),
					op2: vars.get(a[2]),
					op3: vars.get(a[4]),
				}
			}
		}
		return false
	}

	parseMath(text: string, r: string, settings: { noVars?: boolean, define?: boolean } = {}): string | false {
		let resultVar
		const sets: { noVars: boolean, define: boolean } = {
			noVars: settings.noVars ?? false,
			define: settings.define ?? false,
		}
		text                                             = text.replace(/\s+/g, "")
		const regex                                      = /^(.+)$/
		if (regex.test(text)) {
			text = (regex.exec(text) ?? "")[1] ?? ""
			if (vars.exists(text))
				return `move ${r} ${vars.get(text)}`
			const math = mathParser.parse(text, {singleCharName: false})
			try {
				resultVar = this.out.convert(math, r, this.originalPosition, sets)
				if (resultVar === Infinity || resultVar === -Infinity) {
					throw new Err(401, this.originalPosition)
				}
			} catch (e: any) {
				throw new Err(e.code, this.originalPosition)
			}
			if (!isNaN(+resultVar))
				if (sets.define) return String(resultVar)
				else return `move ${r} ${resultVar}`

			const result = this.out.get();
			if (result === "") throw new Err(201, this.originalPosition, text)
			return result
		}
		return false
	}

	addComment(txt: string): string {
		if (use.has("comments") && this.comment && !this.comment.startsWith('!')) {
			if (txt.endsWith("\n")) {
				txt = txt.replace("\n", '') + ' #' + this.comment + "\n"
			} else {
				txt += ' #' + this.comment
			}
		}
		return txt
	}
}

export class icXComment extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/^#!.*/i)
	}

	compile(parent?: icXElem) {
		return ''
	}
}

export class ic10Comment extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/^#.*/i)
	}

	compile(parent?: icXElem) {
		if (use.has("comments")) {
			return this.originalText
		}
		return ''
	}
}

export class icXBlock extends icXElem { //блок инструкций
	public end: number | undefined
	public start: number | undefined
	public content: { [id: number]: icXElem } = {};
	public endKeys: RegExp = /\bend\b/i
	public tempVar?: variable
	public tempVars: variable[] = []

	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text);
	}

	addElem(e: icXElem) {
		this.content[e.originalPosition] = e
	}

	parseRules() {
		this.tempVars                        = [];
		const re                             = /\b([.\d\w]+)\s*(<|==|>|<=|>=|\||!=|&|~=|=>|dse)\s*([\s.\d\w]+?\b)(,[\s.\d\w]+)*/i;
		const args                           = this.args.replace(/\s*/g, '')
		const rules                          = args.split(/&&|\|\|/)
		const returns                        = []
		const ifs: { [key: number]: string } = {}
		for (const rulesKey in rules) {

			if (re.test(rules[rulesKey])) {
				this.rule = re.exec(rules[rulesKey])
				if (this.rule == null) return null
				const v = vars.getTemp();
				this.tempVars.push(v)
				const o                       = args.indexOf(rules[rulesKey]);
				ifs[this.tempVars.length - 1] = args[o - 1] + args[o - 2];
				switch (this.rule[2]) {
					case '<':
						if (parseInt(this.rule[3]) === 0) {
							returns.push(`sltz ${v} ${vars.get(this.rule[1])}`)
						} else {
							returns.push(`slt ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`)
						}
						break;
					case '==':
						if (parseInt(this.rule[3]) === 0) {
							returns.push(`seqz ${v} ${vars.get(this.rule[1])}`)
						} else {
							returns.push(`seq ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`)
						}
						break;
					case '>':
						if (parseInt(this.rule[3]) === 0) {
							returns.push(`sgtz ${v} ${vars.get(this.rule[1])}`)
						} else {
							returns.push(`sgt ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`)
						}
						break;
					case '<=':
						if (parseInt(this.rule[3]) === 0) {
							returns.push(`slez ${v} ${vars.get(this.rule[1])}`)
						} else {
							returns.push(`sle ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`)
						}
						break;
					case '>=':
						if (parseInt(this.rule[3]) === 0) {
							returns.push(`sgez ${v} ${vars.get(this.rule[1])}`)
						} else {
							returns.push(`sge ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`)
						}
						break;
					case '|':
					case '||':
						returns.push(`or ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`)
						break;
					case '&':
					case '&&':
						returns.push(`and ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`)
						break;
					case '~=':
						if (parseInt(this.rule[3]) === 0) {
							returns.push(`sapz ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[4])}`)
						} else {
							returns.push(`sap ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])} ${vars.get(this.rule[4])}`)
						}
						break;
					case '!=':
						if (parseInt(this.rule[3]) === 0) {
							returns.push(`snez ${v} ${vars.get(this.rule[1])}`)
						} else {
							returns.push(`sne ${v} ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`)
						}
						break;
					case '=>':
					case 'isConnected':
						const dn = vars.get(this.rule[1])
						if (!regexes.d1.test(dn)) {
							throw new Err(502, this.originalPosition)
						}
						const _dn = parseInt(dn.replace("d", ""))
						if (parseInt(this.rule[3]) === 0) {
							returns.push(`sdse ${v} ${_dn}`)
						} else {
							returns.push(`sdns ${v} ${_dn}`)
						}
						break;
				}
			}
		}
		if (this.tempVars.length > 1) {
			this.tempVar = vars.getTemp()
			for (var i in this.tempVars) {
				var _i = parseInt(i)
				if (_i == 1) {
					continue;
				}
				if (_i == 0) {
					if (ifs[_i + 1] == '&&') {
						returns.push(`and ${this.tempVar} ${this.tempVars[i]} ${this.tempVars[_i + 1]}`)
					} else {
						returns.push(`or ${this.tempVar} ${this.tempVars[i]} ${this.tempVars[_i + 1]}`)
					}
				} else {
					if (ifs[_i] == '&&') {
						returns.push(`and ${this.tempVar} ${this.tempVar} ${this.tempVars[_i]}`)
					} else {
						returns.push(`or ${this.tempVar} ${this.tempVar} ${this.tempVars[_i]}`)
					}
				}
			}
		} else if (this.tempVars.length == 1) {
			this.tempVar = this.tempVars[0]
		}
		return returns.join('\n');
	}

	setStart(line: number) {
		this.start = line
		return this
	}

	setEnd(line: number) {
		this.end = line
		return this.scope
	}

	compile(parent?: icXElem) {
		const txt: string[] = []
		var err = new Errors
		for (const contentKey in this.content) {
			try {
				const text = this.content[contentKey].compile(parent)
				if (text !== null)
					txt.push(text)
			} catch (e: any) {
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

	setCommand(e: { command: string, args: string[], empty: boolean, comment: string }) {
		super.setCommand(e)
		this.name = e.args[0]
	}

	compile(parent?: icXElem) {
		var txt = `${this.name}:\n`
		if (use.has("comments") && this.comment) {
			txt = txt.replace("\n", '') + ' # ' + this.comment + "\n"
		}
		txt += super.compile(this)
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

	compile(parent?: icXElem): string {
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
				_txt.push(this.content[contentKey].compile(parent))
			}
		}
		txt.push(r)
		if (!isElse) {
			txt.push(`beqz ${this.tempVar} ${l}exit`)
		} else {
			txt.push(`beqz ${this.tempVar} ${l}else`)
		}
		txt.push(_txt.join('\n'))
		txt.push(`${l}exit:`)
		this.tempVar?.release()
		for (const tv in this.tempVars) {
			var t = parseInt(tv);
			this.tempVars[t].release()
		}
		return txt.join('\n') + '\n'
	}
}

export class icXWhile extends icXBlock {
	public l: string | undefined;

	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bfor\b/i)
		this.re.push(/\bwhile\b/i)
	}

	compile(parent?: icXElem): string {
		var r = this.parseRules()
		this.l = whiles.get()
		var txt = []
		txt.push(`${this.l}:`)
		txt.push(r)
		txt.push(`beqz ${this.tempVar} ${this.l}exit`)
		txt.push(super.compile(this))
		txt.push(`j ${this.l}`)
		txt.push(`${this.l}exit:`)
		for (const tv in this.tempVars) {
			var t = parseInt(tv);
			this.tempVars[t].release()
		}
		return txt.join('\n') + '\n'
	}
}

export class icXVar extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bvar\b/i)

	}

	compile(parent?: icXElem) {
		let txt           = '';
		const a           = this.command.args[0];
		const r           = vars.set(a);
		const b           = this.originalText.split('=');
		if (1 in b) {
			const reFn = /(\w+)\(([\w,]*)\)/;
			if (reFn.test(b[1])) {
				const m = reFn.exec(b[1])
				if (m) {
					const func = m[1]
					const args = m[2].split(",")
					switch (func) {
						case 'select':
						case 'move':
						case 'add':
						case 'sub':
						case 'mul':
						case 'div':
						case 'mod':
						case 'sqrt':
						case 'round':
						case 'trunc':
						case 'ceil':
						case 'floor':
						case 'max':
						case 'min':
						case 'abs':
						case 'log':
						case 'exp':
						case 'rand':
						case 'sin':
						case 'cos':
						case 'tan':
						case 'asin':
						case 'acos':
						case 'atan':
						case 'slt':
						case 'sltz':
						case 'sgt':
						case 'sgtz':
						case 'sle':
						case 'slez':
						case 'sge':
						case 'sgez':
						case 'seq':
						case 'seqz':
						case 'sne':
						case 'snez':
						case 'sap':
						case 'sapz':
						case 'sna':
						case 'snaz':
						case 'sdse':
						case 'sdns':
						case 'and':
						case 'or':
						case 'xor':
						case 'nor':
							txt += `${func} ${r}`
							for (const arg of args) {
								txt += ` ${vars.get(arg)}`
							}
							txt += "\n"
							break;
						default:
							throw new Err(504, this.originalPosition)
					}
				}
			} else {
				const rightString = this.command.args.join('')
				const dots        = this.parseDots(rightString);
				if (dots) {
					txt += `${dots.fn} ${r} ${dots.op2} ${dots.op3} ${dots.op4 ?? ''}\n`
				} else {
					const math = this.parseMath(b[1], vars.get(r));
					if (math !== false) {
						txt += math
					} else {
						txt += `move ${r} ${b[1].trim()}\n`
					}
				}
			}
		}
		txt = this.addComment(txt)
		return txt
	}
}

export class icXConst extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bconst\b/i)
	}

	compile(parent?: icXElem) {
		var txt = ''
		if (this.command.args.length >= 2) {
			var a = this.command.args.join('')
			var b = a.split('=')
			b[0] = b[0].trim()
			try {
				if (isNaN(Number(b[1]))) {
					b[1] = this.parseMath(b[1], vars.get(a), {noVars: true, define: true}) || "0"
				}
				// console.log(b[1])
			} catch (e: any) {
				if (e.code == 901) throw new Err(203, this.originalPosition)
				else throw new Err(501, this.originalPosition)
			}
			if (isNaN(Number(b[1]))) {
				throw new Err(202, this.originalPosition)
			}
			vars.setCustom(b[0], b[1], false, true)
			if (use.has('constants')) {
				txt += `define ${b[0]} ${b[1]}\n`
			}
		}
		txt = this.addComment(txt)
		return txt
	}
}

export class icXAlias extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\balias\b/i)
	}

	compile(parent?: icXElem) {
		const op2 = this.originalText.split(/ +/)[2];
		const op1 = this.originalText.split(/ +/)[1];
		let txt   = this.originalText;
		if (regexes.d1.test(op2)) {
			txt = this.addComment(txt)
			if (use.has("aliases")) {
				return txt
			} else {
				vars.setDevice(op1, op2)
				return ''
			}
		} else {
			throw new Err(101, this.originalPosition)
		}

	}
}

export class icXLog extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bdebug\b/i)
	}

	compile(parent?: icXElem) {
		return `#log ${vars.get(this.args)}`
	}
}

export class icXUse extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\buse\b/i)
	}

	compile(parent?: icXElem): "" {
		use.add(...this.command.args)
		return ""
	}
}

export class icXYield extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\byield\b/i)
	}

	compile(parent?: icXElem) {
		var txt = "yield"
		txt = this.addComment(txt)
		return txt
	}
}

export class icXBreak extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bbreak\b/i)
	}

	compile(parent?: icXElem) {
		if (parent instanceof icXWhile) {
			var txt = 'j ' + parent.l + 'exit\n';
			txt = this.addComment(txt)
			return txt
		}
		if (parent instanceof icXForeach) {
			var txt = 'j ' + parent.l + 'exit\n';
			txt = this.addComment(txt)
			return txt
		}
		return '';
	}
}

export class icXSwitch extends icXBlock {
	public l: string | undefined;

	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bswitch\b/i)
	}

	compile(parent?: icXElem): string {
		var txt = []
		txt.push(super.compile(this))
		return `# ${this.comment}\n` + txt.join('\n') + '\n'
	}
}

export class icXSwitchCase extends icXBlock {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bcase\b/i)

	}

	compile(parent?: icXSwitch) {
		var txt: string[] = []
		if (typeof parent == 'undefined' || !(parent instanceof icXSwitch)) {
			throw new Err(203, this.originalPosition).message = 'case must be in switch'
		}
		var count = Object.keys(this.content).length + 1
		txt.push(`brne ${vars.get(parent.args)} ${vars.get(this.args)} ${count}`)
		txt.push(super.compile(this))
		return txt.join('\n') + '\n'
	}
}

export class icXStack extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\bstack\b/i)
	}

	compile(parent?: icXElem) {
		var txt: Array<string> = []
		for (const argsKey in this.command.args) {
			if (this.command.args.hasOwnProperty(argsKey)) {
				txt.push(`push ${this.command.args[argsKey]}`)
			}

		}
		var _txt = txt.join('\n')
		if (use.has("comments") && this.comment) {
			_txt = _txt.replace("\n", '') + ' # ' + this.comment + "\n"
		}
		return _txt
	}
}

export class icXForeach extends icXBlock {
	public l: string | undefined;

	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\beach\b/i)
		this.re.push(/\bforeach\b/i)
	}

	compile(parent?: icXElem): string {
		var r = this.parseRules()
		this.l = whiles.get()
		var txt = []
		let offset
		try {
			offset =vars.get(this.command.args[1]) ?? 1
		}
		catch (e) {
			offset = 1
		}
		txt.push(`move sp ${offset}`)
		txt.push(`${this.l}:`)
		txt.push(`peek ${vars.get(this.command.args[0])}`)
		txt.push(super.compile(this))
		txt.push(`breqz ${vars.get(this.command.args[0])} 3`)
		txt.push(`add sp sp 1`)
		txt.push(`j ${this.l}`)
		txt.push(`${this.l}exit:`)
		for (const tv in this.tempVars) {
			var t = parseInt(tv);
			this.tempVars[t].release()
		}
		return txt.join('\n') + '\n'
	}
}