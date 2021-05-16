export class Err {
	
	//  сторона ошибки      lvl        номер
	//      0                0           00
	static parse = 100 // ошибка в парсере
	static syntax = 200 // ошибка в коде пользователя
	static ic10 = 300 // ошибка в скомпилированном 1с10
	static math = 400 // ошибка в математике
	static other = 500 //
	public message: string = ''
	public code: number = 0
	public line: number = 0
	public lvl: string = ''
	public group: string = ''
	
	constructor(code: number, message: string, line: number) {
		this.code = code
		this.message = message
		this.line = line
		this.analyze()
	}
	
	analyze() {
		var c = 0
		if (this.code >= Err.other) {
			c = this.code - Err.other
			this.group = 'other'
		} else if (this.code >= Err.math) {
			c = this.code - Err.math
			this.group = 'math'
		} else if (this.code >= Err.ic10) {
			c = this.code - Err.ic10
			this.group = 'ic10'
		} else if (this.code >= Err.syntax) {
			c = this.code - Err.syntax
			this.group = 'syntax'
		} else if (this.code >= Err.parse) {
			c = this.code - Err.parse
			this.group = 'parse'
		} else {
			this.group = 'мудак'
		}
		switch (String(c)[0]) {
			case '0':
			case '1':
			case '2':
			case '3':
				this.lvl = 'fatal'
				break;
			case '4':
			case '5':
			case '6':
				this.lvl = 'warn'
				break;
			case '7':
			case '8':
			case '9':
				this.lvl = 'info'
				break;
			default:
				this.lvl = 'блядь'
				break
		}
		
	}
	
	getUserMessage() {
		var group = this.firstUpper(this.group)
		var lvl = this.firstUpper(this.lvl)
		
		return `[${group}${lvl}]:${this.line+1} ${this.message} `;
	}
	
	firstUpper(string: string): string {
		string = string.toLowerCase();
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
}

export class Errors{
	public e: Err[] = []
	
	isError() {
		if (this.e.length > 0) {
			return true
		}
		return false
	}
	
	push(e: Err) {
		this.e.push(e)
	}
	
	getUserMessage() {
		var msg = ''
		for (const eKey in this.e) {
			if (this.e[eKey] instanceof Err) {
				msg += this.e[eKey].getUserMessage() + "\n"
			}else{
				return this.e[eKey]
			}
		}
		return msg;
	}
}
