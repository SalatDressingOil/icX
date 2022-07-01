import * as classes                                   from "./src/classes"
import {icXElem}                                      from "./src/classes"
import {functions, ifs, use, vars, varsClass, whiles} from "./src/lists"
import modules                                        from "./src/modules"

export const regexes = {
	'rr1'     : new RegExp("[rd]+(r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a))$"),
	'dr1'     : new RegExp("dr*(10|11|12|13|14|15|16|17|0|1|2|3|4|5|6|7|8|9|a)$"),
	'r1'      : new RegExp("^r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$"),
	'd1'      : new RegExp("^d([012345b])$"),
	'rr'      : new RegExp("^d([012345b])$"),
	'strStart': new RegExp("^\".+$"),
	'strEnd'  : new RegExp(".+\"$"),
}

export class icX {
	public text: string
	public keyFirstWord: { class: string, re: RegExp }[]                                    = []
	public lines: string[] | undefined
	public position: number                                                                 = 0;
	public commands: { command: string, args: string[], empty: boolean, comment: string }[] = [];
	public structure: classes.icXBlock | null                                               = null
	public currentBlock: classes.icXBlock | null                                            = null
	public operators: { [id: string]: icXElem }                                             = {}
	public icxOptions: { [p: string]: boolean } | null;

	constructor(text: string, icxOptions: { [key: string]: boolean } | null = null) {
		this.icxOptions = icxOptions
		for (const key in classes) {
			try {
				if (Object.prototype.hasOwnProperty.call(classes, key)) {
					// @ts-ignore
					const element: classes.icXElem = classes[key]
					try {
						// @ts-ignore
						const x = new element
						if (x instanceof classes.icXElem) {
							x.re.forEach(re => {
								this.keyFirstWord.push({class: key, re})
								// @ts-ignore
								this.operators[key] = classes[key]
							})
						}
					} catch {
					}
				}
			} catch {
			}
		}
		for (const key in modules) {
			try {
				if (Object.prototype.hasOwnProperty.call(modules, key)) {
					// @ts-ignore
					const element: classes.icXElem = modules[key]
					try {
						// @ts-ignore
						const x = new element
						if (x instanceof classes.icXElem) {
							x.re.forEach(re => {
								this.keyFirstWord.push({class: key, re})
								// @ts-ignore
								this.operators[key] = modules[key]
							})
						}
					} catch {
					}
				}
			} catch {
			}
		}
		vars.reset()
		this.position = 0
		this.text     = text
		// this.text = 'var _r0 = 0\n' + text
		this.init(this.text)
	}

	init(text: string) {
		this.lines = text.split(/\r?\n/)
		const commands: { command: string, args: string[], empty: boolean, comment: string }[]
				   = this.lines.map((line) => {
			let comment = ''
			if (!line.trim().startsWith("#")) {
				const sp = line.split('#')
				line     = sp[0]
				comment  = sp[1] ? sp[1].trim() : '';
			}
			const args: Array<string> = line.trim().split(/\s+/)
			const command             = args.shift() ?? ""
			if (command.startsWith("use")) {
				for (const usesKey in args) {
					use.add(args[usesKey]);
				}
			}
			let empty: boolean
			if (!use.has("comments")) {
				empty = (!command || command.startsWith("#"))
			} else {
				empty = !command
			}
			return {command, args, empty, comment}
		});
		commands.forEach(command => {
			const newArgs: any    = {};
			let mode              = 0;
			let argNumber: number = 0;
			command.args.forEach(arg => {
				if (mode === 0) {
					argNumber++
				}
				if (regexes.strStart.test(arg)) {
					mode = 1
				}
				if (argNumber in newArgs) {
					newArgs[argNumber] += ' ' + arg
				} else {
					newArgs[argNumber] = arg
				}
				if (regexes.strEnd.test(arg)) {
					mode = 0
				}
				command.args = Object.values(newArgs)
			})
		})
		this.commands     = commands
		this.position     = 0
		this.structure    = new classes.icXBlock(null, 0, this.text)
		this.currentBlock = this.structure
		for (let position: number = 0; position < this.lines.length; position++) {
			if (this.commands.hasOwnProperty(position) && !this.commands[position].empty) {
				const line = this.lines[position]
				const c    = this.commands[position]
				let r      = ''
				for (const keyFirstWordKey in this.keyFirstWord) {
					const key = this.keyFirstWord[keyFirstWordKey]
					if (key.re.test(line)) {
						r = key.class
						break;
					}
				}
				if (r) {
					try {
						//@ts-ignore
						const a = new this.operators[r](this.currentBlock, position, line);
						a.setCommand(c)
						a.originalPosition = position
						this.currentBlock.addElem(a)
						if (a instanceof classes.icXBlock) {
							this.currentBlock = a.setStart(a.originalPosition + 1)
						}
					} catch {
					}
				} else {
					if (this.currentBlock.endKeys.test(line)) {
						const block = this.currentBlock.setEnd(position - 1)
						if (block instanceof classes.icXBlock) {
							this.currentBlock = block
						}
					} else {
						const elem = new classes.icXElem(this.currentBlock, position, line)
						elem.setCommand(c)
						this.currentBlock.addElem(elem)
					}
				}
			}
		}
	}

	getCompiled(): string {
		vars.reset()
		ifs.reset()
		whiles.reset()
		functions.reset()
		use.reset()
		if (this.icxOptions) {
			for (const key in this.icxOptions) {
				if (this.icxOptions.hasOwnProperty(key) && this.icxOptions[key]) {
					use.add(key)
				}
			}
		}
		try {
			const code = (this.structure?.compile() ?? "") + "\n"
			let txt    = "";
			if (use.has("aliases")) {
				txt += vars.getAliases()
			}
			txt += code
			txt += ""
			if (functions.fn.length != 0) {
				if (!use.has("loop")) {
					const a = functions.get();
					const t = a.split("\n").length - (functions.fn.length) + 1;
					txt += `jr ${t}\n`
					txt += a
				} else {
					txt += "j 0\n"
					txt += functions.get()
				}
			} else {
				if (use.has("loop")) {
					txt += "j 0\n"
				}
			}
			txt = txt
				.split("\n")
				.map((str) => {
					return str.trim()
				}).filter((str) => {
					if (!use.has("comments") && str.startsWith("#")) return false
					else return str !== ""
				}).join('\n')
			return txt
		} catch (e) {
			throw e
		}

	}

	analyze(): { result: any; functions: { fn: string[]; add: (str: string) => void; get: () => string; reset: () => void }; use: { arg: Set<string>; add: (...str: string[]) => void; has: (str: string) => boolean; reset: () => void }; ifs: { count: number; reset: () => void; get: () => string }; whiles: { count: number; reset: () => void; get: () => string }; vars: varsClass; error: any } {
		vars.reset()
		ifs.reset()
		whiles.reset()
		functions.reset()
		use.reset()
		if (this.icxOptions) {
			for (const key in this.icxOptions) {
				if (this.icxOptions.hasOwnProperty(key) && this.icxOptions[key]) {
					use.add(key)
				}
			}
		}
		let error  = null;
		let result = null;
		try {
			const code = (this.structure?.compile() ?? "") + "\n"
			let txt    = "# ---icX User code start---\n";
			txt += code
			txt += "# ---icX User code end---\n"
			if (functions.fn.length != 0) {
				if (!use.has("loop")) {
					const a = functions.get();
					const t = a.split("\n").length;
					txt += `jr ${t}\n`
					txt += a
				} else {
					txt += "j 0\n"
					txt += functions.get()
				}
			} else {
				if (use.has("loop")) {
					txt += "j 0\n"
				}
			}
			txt    = txt
				.split("\n")
				.map((str) => {
					return str.trim()
				}).filter((str) => {
					if (!use.has("comments") && str.startsWith("#")) return false
					else return str !== ""
				}).join('\n')
			result = txt
		} catch (e) {
			error = e
		}

		return {
			vars     : vars,
			ifs      : ifs,
			whiles   : whiles,
			functions: functions,
			use      : use,
			error    : error,
			result   : result,
		}
	}

}