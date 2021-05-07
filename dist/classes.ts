import {icX} from "./index";

export var vars = {
	count: 0,
	aliases: {},
	setAlias: function (v, a) {
		this.aliases[a] = v
		this.aliases[v] = a
		
	},
	get: function () {
		if (this.count == 16) {
			this.count++
		}
		if (this.count > 15) {
			throw 'not enough vars :('
		}
		return 'r' + this.count++
	},
	reset: function () {
		this.count = 0
		this.aliases = {}
	}
}
export var whiles = {
	count: 0,
	get: function () {
		return 'while' + this.count++
	},
	reset: function () {
		this.count = 0
	}
}

export class icXElem { //инструкция
	public originalPosition: number;
	public originalText: string;
	public scope: icXElem | icX;
	public command: { command: string, args: string[], empty: boolean } = {command: '', args: [], empty: true};
	private args: string;
	
	constructor(scope: icXElem | icX, pos = 0, text = '') {
		this.scope = scope;
		this.originalPosition = pos
		this.originalText = text
		
	}
	
	setCommand(e: { command: string, args: string[], empty: boolean }) {
		this.command = e
		if (!this.originalText) {
			this.originalText = this.command.command + this.command.args.join(' ');
		}
		this.args = this.command.args.join(' ');
	}
	
	compile() {
		return this.originalText
	}
	
	parseRules() {
	
	}
}

export class icXBlock extends icXElem { //блок инструкций
	public end: number | undefined;
	public start: number | undefined;
	// @ts-ignore
	public content: Object = {};
	public endKeys: RegExp = /\bend\b/i
	
	addElem(e: icXElem) {
		this.content[e.originalPosition] = e
	}
	
	setStart(line: number) {
		this.start = line
		return this;
	}
	
	setEnd(line: number) {
		this.end = line
		return this.scope;
	}
	
	constructor(scope: icXElem | icX, pos: number, text: string) {
		super(scope, pos = 0, text = '');
		
	}
	
	compile() {
		var txt = ''
		for (const contentKey in this.content) {
			txt += this.content[contentKey].compile() + "\n";
		}
		return txt
	}
}

export class icXFunction extends icXBlock {
	public name: any;
	
	constructor(scope: icXElem, pos: number, text: string) {
		super(scope, pos = 0, text = '');
		
	}
	
	setCommand(e) {
		super.setCommand(e)
		this.name = e.args[0]
	}
	
	compile() {
		var txt = `${this.name}:\n`;
		txt += super.compile()
		txt += 'j ra\n'
		return txt
	}
}

export class icXIf extends icXBlock {
	constructor(scope: icXElem, pos: number, text: string) {
		super(scope, pos = 0, text = '');
		
	}
}

export class icXWhile extends icXBlock {
	constructor(scope: icXElem, pos: number, text: string) {
		super(scope, pos = 0, text = '');
		
	}
	
	compile() {
		
		var l = whiles.get();
		var txt = `${l}:\n`;
		txt += super.compile()
		txt += `j ${l}\n`
		txt += `${l}exit:\n`
		return txt
	}
}

export class icXVar extends icXElem {
	constructor(scope: icXElem, pos: number, text: string) {
		super(scope, pos = 0, text = '');
		
	}
	
	compile() {
		var txt = ''
		var v = vars.get()
		if (0 in this.command.args) {
			var a = this.command.args[0]
			vars.setAlias(v, a)
			txt += `alias ${a} ${v} \n`
		}
		var b = this.originalText.split('=')
		if (1 in b) {
			txt += `move ${v} ${b[1].trim()}  \n`
		}
		return txt
	}
}

export class icXConst extends icXElem {
	constructor(scope: icXElem, pos: number, text: string) {
		super(scope, pos = 0, text = '');
	}
	
	compile() {
		var txt = ''
		if (this.command.args.length >= 2) {
			var a = this.command.args.join('')
			var b = a.split('=')
			b[0] = b[0].trim()
			vars.setAlias(b[0], b[0])
			txt += `define ${b[0]} ${b[1]} \n`
		}
		return txt
	}
}

export class icXIncrement extends icXElem {
	constructor(scope: icXElem, pos: number, text: string) {
		super(scope, pos = 0, text = '');
	}
	
	compile() {
		var a = /\b(\S+\b)\+\+/i.exec(this.originalText)
		console.log(this.originalText)
		var txt = `add ${a[1]} ${a[1]} 1  \n`
		return txt
	}
}
