

export const vars: { count: number; aliases: { [id: string]: string} ; setAlias: (v: string, a: string) => void; reset: () => void; get: () => string}  = {
	count: 1,
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
		this.count = 1
		this.aliases = {}
	}
}
export const whiles: { count: number; reset: () => void; get: () => string}  = {
	count: 0,
	reset: function () {
		this.count = 0
	},
	get: function () {
		return 'while' + this.count++
	}
}

export const ifs: { count: number; reset: () => void; get: () => string}  = {
	count: 0,
	reset: function () {
		this.count = 0
	},
	get: function () {
		return 'if' + this.count++
	}
}

export const functions: { fn: string[]; add: (str: string) => void; get: () => string}  = {
	fn: [],
	add: function (str) {
		this.fn.push(str)
	},
	get: function () {
		return this.fn.join('\n')
	}
}
export const use: { arg: string[]; add: (...str: string[]) => void; has: (str: string) => boolean}  = {
	arg: [],
	add: function (...str) {
		// console.log(ar)
		this.arg.push(...str)
	},
	has: function (str) {
		if (this.arg.indexOf(str) === -1)
			return false
		else
			return true
	}
}
