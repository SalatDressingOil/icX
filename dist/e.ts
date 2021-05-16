class e {
	
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
		
	}
	
	analize() {
		var c = 0
		if (this.code >= e.other) {
			c = this.code - e.other
			this.group = 'other'
		} else if (this.code >= e.math) {
			c = this.code - e.math
			this.group = 'math'
		} else if (this.code >= e.ic10) {
			c = this.code - e.ic10
			this.group = 'ic10'
		} else if (this.code >= e.syntax) {
			c = this.code - e.syntax
			this.group = 'syntax'
		} else if (this.code >= e.parse) {
			c = this.code - e.parse
			this.group = 'parse'
		} else {
			this.group = 'мудак'
		}
		switch (String(c)[0]) {
			case '1':
			case '2':
			case '3':
				break;
				this.lvl = 'fatal'
			case '4':
			case '5':
			case '6':
				break;
				this.lvl = 'warn'
			case '7':
			case '8':
			case '9':
				break;
				this.lvl = 'info'
			default:
				this.lvl = 'блядь'
				break
		}
		
	}
	
	getUserMessage() {
		return `[${this.group.charAt(0).toUpperCase()}${this.lvl.charAt(0).toUpperCase()}] ${this.message}`;
	}
	
}
