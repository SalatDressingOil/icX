

export const vars: { count: number; aliases: { [id: string]: string }; RDs: { [id: string]: string }; getRD: (a: string) => string | undefined; getAlias: (a: string) => string; setAlias: (r: string, a: string) => void; setRDs: (r: string, a: string) => void; reset: () => void; get: () => string } = {
	count: 1,
	aliases: {},
	RDs: {},
	setAlias: function (r, a) {
		this.aliases[a] = r
		this.aliases[r] = a
		this.setRDs(r, a)
	},
	setRDs: function (r, a) {
		this.RDs[a] = r
	},
	getRD: function (a) {
		return this.RDs[a]
	},
	getAlias: function (a) {
		if (use.has("ignore_aliases")) return this.getRD(a) ?? a
		return a
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
export const whiles: { count: number; reset: () => void; get: () => string } = {
	count: 0,
	reset: function () {
		this.count = 0
	},
	get: function () {
		return 'while' + this.count++
	}
}

export const ifs: { count: number; reset: () => void; get: () => string } = {
	count: 0,
	reset: function () {
		this.count = 0
	},
	get: function () {
		return 'if' + this.count++
	}
}

export const functions: { fn: string[]; add: (str: string) => void; get: () => string } = {
	fn: [],
	add: function (str) {
		this.fn.push(str)
	},
	get: function () {
		return this.fn.join('\n')
	}
}
export const use: { arg: string[]; add: (...str: string[]) => void; has: (str: string) => boolean } = {
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
