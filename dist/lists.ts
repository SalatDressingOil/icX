export class variable {
	temp: boolean
	to: string
	from: string
	ready: boolean = true
	constructor(from: string, to: string, temp = false) {
		this.temp = temp
		this.to = to
		this.from = from
	}
	release(){
		this.ready = true
		return this
	}
	get(){
		this.ready = false
		return this
	}
	toString(){
		if (use.has("aliases") && this.temp === false) return this.from
		else return this.to
	}
}

export class varsClass {
	aliases: variable[] = []
	temps: variable[] = []
	empty: string[] = []
	constructor() {
		this.reset()
		this.getTemp()
	}
	reset(){
		this.temps = []
		this.aliases = []
		this.empty = []
		for (let i = 0; i <= 15; i++) {
			this.empty.push("r" + i)
		}
	}
	set(from: string, temp = false) {
		var result
		if (!/^[a-zA-Z_]\w*/.test(from))
			throw new Error(`Variable ${from} is not valid`)
		if (this.exists(from))
			throw new Error(`Variable ${from} already exists`)
		else
			result = new variable(from, this.empty.shift()??"null", temp)
		this.aliases.push(result)
		return result
	}
	// setCustom(from: string, to: string, temp = false) {
	// 	var result
	// 	if (this.exists(from))
	// 		throw new Error(`Variable ${from} already exists`)
	// 	else
	// 		result = new variable(from, to, temp)
	// 	this.aliases.push(result)
	// 	return result
	// }
	exists(from: string) {
		var found = false
		this.aliases.forEach((variable) => {
			if (from === variable.from)
				found = true
		})
		return found
	}
	find(from: string): false | variable {
		var found: boolean | variable = false
		this.aliases.forEach((variable) => {
			if (from === variable.from)
				found = variable
		})
		return found
	}
	get(from: string|variable) {
		if (from instanceof variable) return from.toString()
		const find = this.find(from)
		if (find === false) return from
		return find.toString()
	}
	getTemp() {
		var found: undefined | variable
		this.temps.forEach(function(variable) {
			if (variable.ready){
				found = variable
			}
		})
		if (found === undefined) return this.newTemp().get()
		return found.get()

	}
	newTemp() {
		const newTemp = new variable("", this.empty.pop()??"null", true)
		this.temps.unshift(newTemp)
		return newTemp
	}
}
const vars = new varsClass
export {vars}
// export const vars: { count: number; aliases: { [id: string]: string }; RDs: { [id: string]: string }; getRD: (a: string) => string | undefined; getAlias: (a: string) => string; setAlias: (r: string, a: string) => void; setRDs: (r: string, a: string) => void; reset: () => void; get: () => string } = {
// 	count: 1,
// 	aliases: {},
// 	RDs: {},
// 	setAlias: function (r, a) {
// 		this.aliases[a] = r
// 		this.aliases[r] = a
// 		this.setRDs(r, a)
// 	},
// 	setRDs: function (r, a) {
// 		this.RDs[a] = r
// 	},
// 	getRD: function (a) {

// 		return this.RDs[a]
// 	},
// 	getAlias: function (a) {
// 		console.log(this.getRD(a) ?? a)
// 		if (!use.has("aliases")) return this.getRD(a) ?? a
// 		return a
// 	},
// 	get: function () {
// 		if (this.count == 16) {
// 			this.count++
// 		}
// 		if (this.count > 15) {
// 			throw 'not enough vars :('
// 		}
// 		return 'r' + this.count++
// 	},
// 	reset: function () {
// 		this.count = 1
// 		this.aliases = {}
// 	}
// }
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
		this.arg.push(...str)
	},
	has: function (str) {
		if (this.arg.indexOf(str) === -1)
			return false
		else
			return true
	}
}
