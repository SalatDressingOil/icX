import {functions, ifs, use, vars, whiles, variable} from "./lists"

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
		txt: string[],
		vars: variable[],
		convert: (r: any, result:string | null, iter?: number) => {} 
		get: () => { txt: string, var: string } | false
	} = {
		txt: [],
		vars: [],
		convert: function (r, result, iter = 0) {
			if (r.type == 'operator') {
				var a0 = this.convert(r.args[0], null, iter+1)
				var a1 = this.convert(r.args[1], null, iter+1)
				var temp:string|variable = ""
				if (iter == 0){
					temp = result ?? ""
				} else {
					temp = vars.getTemp()
					this.vars.push(temp)
					temp = temp.to
				}
				if (!isNaN(+a0) && !isNaN(+a1)){
					switch (r.name) {
						case '-':
							return +a0 - +a1
						case '+':
							return +a0 + +a1
						case '*':
							return +a0 * +a1
						case '/':
							return +a0 / +a1
						// case '^':
						// 	return Math.pow(+a0, +a1)
						case '%':
							return +a0 % +a1
					}
					return 0
				} else {
					switch (r.name) {
						case '-':
							this.txt.push(`sub ${temp} ${a0} ${a1}`)
							break;
						case '+':
							this.txt.push(`add ${temp} ${a0} ${a1}`)
							break;
						case '*':
							this.txt.push(`mul ${temp} ${a0} ${a1}`)
							break;
						case '/':
							this.txt.push(`div ${temp} ${a0} ${a1}`)
							break;
						case '%':
							this.txt.push(`mod ${temp} ${a0} ${a1}`)
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
					this.txt.unshift(`abs ${r.args[0].name} ${vars.get(r.args[0].name)}`)
					return r.args[0].name
				}
				return r.name
			}
		},
		get: function () {
			// var txt = ''
			// this.v.forEach((e)=>{
			// 	txt += `move r${e} 0\n`
			// })
			var txt = this.txt.join("\n") ?? ''
			this.txt = [];
			this.vars.forEach(v => {
				v.release()
			})
			this.vars = []
			if (txt) {
				return {txt: txt, var: 'r0'}
			} else {
				return false
			}
		}
	};
	
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		this.scope = scope
		this.originalPosition = pos
		this.originalText = text
		// this.parseMath()
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
		var byDots = this.originalText.split('.')
		if (byDots.length > 1) {
			if (byDots[0].trim() in vars.aliases) {
				re = /\b([\w\d]+)\.([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\b/i
				if (re.test(this.originalText)) {
					var a = re.exec(this.originalText)
					if (a == null) return null
					return `s ${a[1]} ${a[2]} ${a[4]}`
				}
				
			}
			re = /\b([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\.([\w\d]+)\s{0,}$/i
			if (re.test(this.originalText)) {
				var a = re.exec(this.originalText)
				if (a == null) return null
				return `l ${a[1]} ${a[3]} ${a[4]}`
			}
			re = /\b([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\.slot\(([\w\d]+)\).([\w\d]+)\b/i
			if (re.test(this.originalText)) {
				var a = re.exec(this.originalText)
				if (a == null) return null
				return `ls ${a[1]} ${a[3]} ${a[4]} ${a[5]}`
			}
			re = /\b([\w\d]+)\s{0,}(=)\s{0,}d\(([\w\d]+)\).([\w\d]+)\(([\w\d]+)\b/i
			if (re.test(this.originalText)) {
				var a = re.exec(this.originalText)
				if (a == null) return null
				return `lb ${a[1]} ${a[3]} ${a[4]} ${a[5]}`
			}
		}
		
		re = /([\.\d\w]+)\s{0,}(=)\s{0,}(.+)/i
		if (re.test(this.originalText)) {
			var a = re.exec(this.originalText)
			if (a == null) return null
			var math = this.parseMath(a[3], vars.get(a[1]))
			var txt = ''
			if (math !== false) {
				txt += math.txt
				// txt += `\nmove ${vars.get(a[1])} ${vars.get(math.var)}\n`
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
	
	parseRules() {
		var re = /\b([\.\d\w]+)\s{0,}(<|==|>|<=|>=|\||!=|\&|\~\=)\s{0,}([\s\.\d\w]+?\b)(\,[\s\.\d\w]+){0,}/i
		if (re.test(this.args)) {
			this.rule = re.exec(this.args)
			if (this.rule == null) return null
			switch (this.rule[2]) {
				case '<':
					if (parseInt(this.rule[3]) === 0) {
						return `sltz r0 ${vars.get(this.rule[1])}`
					} else {
						return `slt r0 ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
				case '==':
					if (parseInt(this.rule[3]) === 0) {
						return `seqz r0 ${vars.get(this.rule[1])}`
					} else {
						return `seq r0 ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
				case '>':
					if (parseInt(this.rule[3]) === 0) {
						return `sgtz r0 ${this.rule[1]}`
					} else {
						return `sgt r0 ${this.rule[1]} ${this.rule[3]}`
					}
				case '<=':
					if (parseInt(this.rule[3]) === 0) {
						return `slez r0 ${vars.get(this.rule[1])}`
					} else {
						return `sle r0 ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
				case '>=':
					if (parseInt(this.rule[3]) === 0) {
						return `sgez r0 ${vars.get(this.rule[1])}`
					} else {
						return `sge r0 ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
				case '|':
				case '||':
					return `or r0 ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
				case '&':
				case '&&':
					return `and r0 ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
				case '~=':
					if (parseInt(this.rule[3]) === 0) {
						return `sapz r0 ${vars.get(this.rule[1])} ${vars.get(this.rule[4])}`
					} else {
						return `sap r0 ${vars.get(this.rule[1])} ${vars.get(this.rule[3])} ${vars.get(this.rule[4])}`
					}
				case '!=':
					if (parseInt(this.rule[3]) === 0) {
						return `snez r0 ${vars.get(this.rule[1])}`
					} else {
						return `sne r0 ${vars.get(this.rule[1])} ${vars.get(this.rule[3])}`
					}
			}
		}
		
	}
	
	parseMath(text: string, r:string): { txt: string, var: string } | false {
		
		text = text.replace(/\s+/g, "")
		const regex = /^\((.+)\)$/
		if (regex.test(text)) {
			text = (regex.exec(text) ?? "")[1] ?? ""
			var pre
			try {
				pre = eval(text)
			} catch (e) {
				pre = false
			}
			if (pre !== false && !isNaN(pre)) {
				return {txt: '', var: String(pre)}
			} else {
				var math = mathParser.parse(text)
				this.out.convert(math, r)
				return this.out.get()
			}
		}
		return false;
	}
	
}

export class icXBlock extends icXElem { //блок инструкций
	public end: number | undefined
	public start: number | undefined
	public content: { [id: number]: icXElem } = {};
	public endKeys: RegExp = /\bend\b/i
	
	addElem(e: icXElem) {
		this.content[e.originalPosition] = e
	}
	
	setStart(line: number) {
		this.start = line
		return this
	}
	
	setEnd(line: number) {
		this.end = line
		return this.scope
	}
	
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		
	}
	
	compile() {
		const txt: string[] = []
		for (const contentKey in this.content) {
			const text = this.content[contentKey].compile()
			if (text !== null)
				txt.push(text)
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
			txt.push(`beqz r0 ${l}exit`)
			txt.push(`beq r0 1 ${l}`)
		} else {
			txt.push(`beqz r0 ${l}else`)
			txt.push(`beq r0 1 ${l}`)
		}
		txt.push(`${l}:`)
		txt.push(_txt.join('\n'))
		txt.push(`${l}exit:`)
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
		txt.push(`beqz r0 ${l}exit`)
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
		var r = vars.set(a).to
		if (use.has("aliases")) {
			txt += `alias ${a} ${r}\n`
		}
		var b = this.originalText.split('=')
		if (1 in b) {
			var math = this.parseMath(b[1], vars.get(r))
			if (math !== false) {
				txt += math.txt
				// txt += `\nmove ${r} ${math.var}\n`
			} else {
				txt += `move ${r} ${b[1].trim()}\n`
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
			// vars.setAlias(b[0], b[0])
			txt += `define ${b[0]} ${b[1]}\n`
		}
		return txt
	}
}

// export class icXAlias extends icXElem {
// 	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
// 		super(scope, pos, text)
// 		this.re.push(/\balias\b/i)
// 	}
	
// 	compile() {
// 		vars.setCustom(this.command.args[0], this.command.args[1])
// 		return super.compile()
// 	}
// }

export class icXLog extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\blog\b/i)
	}
	
	// compile() {
	// 	if (!use.has("aliases") && vars.getRD(this.args) !== undefined) return `#log ${vars.getRD(this.args)}`
	// 	return `#log ${this.args}`
	// }
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
