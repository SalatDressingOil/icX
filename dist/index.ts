import * as classes from "./classes"
import { functions, ifs, vars, whiles } from "./classes"


export const regexes = {
	'rr1': new RegExp("[rd]{1,}(r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a))$"),
	'r1': new RegExp("^r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$"),
	'd1': new RegExp("^d(0|1|2|3|4|5|b)$"),
	'rr': new RegExp("^d(0|1|2|3|4|5|b)$"),
	'strStart': new RegExp("^\".+$"),
	'strEnd': new RegExp(".+\"$"),
}

export class icX {
	public text: string
	private keyFirstWord: { class: string, re: RegExp }[] = []
	private lines: string[] | undefined
	public position: number = 0;
	private commands: { command:string, args:string[], empty:boolean }[] = [];
	private structure: classes.icXBlock | null = null
	private currentBlock: classes.icXBlock | null = null

	constructor(text: string) {
		for (const key in classes) {
			try {
				if (Object.prototype.hasOwnProperty.call(classes, key)) {
					// @ts-ignore
					const element: classes.icXElem = classes[key]
					try {
						// @ts-ignore
						var x = new element
						if (x instanceof classes.icXElem) {
							x.re.forEach(re => {
								this.keyFirstWord.push({ class: key, re })
							})
						}
					} catch {}
				}
			} catch {}
		}
		this.position = 0
		this.text = 'var icxTempVar = 0\n' + text
		this.init(this.text)
	}

	init(text: string) {
		this.lines = text.split(/\r?\n/)
		var commands: { command:string, args:string[], empty:boolean }[] = this.lines
			.map((line) => {
				const args: Array<string> = line.trim().split(/\s+/)
				const command = args.shift() ?? ""
				const empty = (!command || command.startsWith("#")) ? true : false
				return { command, args, empty }
			})
		commands.forEach(command => {
			console.log(command)
			var newArgs: any = {}
			var mode = 0
			var argNumber: number = 0
			command.args.forEach(arg => {
				if (arg.startsWith("#")) {
					return
				}
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
		this.commands = commands
		this.position = 0
		// console.log(this.commands)
		var blockLvl = 0
		var startBlock = {}
		this.structure = new classes.icXBlock(null, 0, this.text)
		this.currentBlock = this.structure
		for (let position: number = 0; position < this.lines.length; position++) {
			if (this.commands.hasOwnProperty(position) && this.commands[position].empty == false) {
				var line = this.lines[position]
				var c = this.commands[position]
				var r = ''
				console.log(line)

				for (const keyFirstWordKey in this.keyFirstWord) {
					var key = this.keyFirstWord[keyFirstWordKey]
					if (key.re.test(line)) {
						r = key.class
					}
				}
				if (r) {
					try {
						//@ts-ignore
						var a = new classes[r](this.currentBlock, position, line)
						a.setCommand(c)
						a.originalPosition = position
						this.currentBlock.addElem(a)
						if (a instanceof classes.icXBlock) {
							this.currentBlock = a.setStart(a.originalPosition + 1)
						}
					} catch {}
				} else {
					if (this.currentBlock.endKeys.test(line)) {
						var block = this.currentBlock.setEnd(position - 1)
						if (block instanceof classes.icXBlock) {
							this.currentBlock = block
						}
					} else {
						var elem = new classes.icXElem(this.currentBlock, position, line)
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
		console.log(this.structure)
		var txt = this.structure?.compile() ?? ""
		txt += "j 0\n"
		txt += "# ---functions---\n"
		txt += functions.get()
		return txt
	}
}
