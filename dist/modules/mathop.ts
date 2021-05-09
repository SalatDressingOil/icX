import { icXElem, icXBlock } from "../classes"
import { functions, ifs, vars, whiles, use } from "../lists"


class icXIncrement extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\b(\S+\b)\+\+/i)
	}

	compile() {
		var a = /\b(\S+\b)\+\+/i.exec(this.originalText)
		if (a !== null)
			var txt = `add ${a[1]} ${a[1]} 1\n`
		else return null
		return txt
	}
}
class icXDecrement extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\b(\S+\b)\-\-/i)
	}

	compile() {
		var a = /\b(\S+\b)\-\-/i.exec(this.originalText)
		if (a !== null)
			var txt = `sub ${a[1]} ${a[1]} 1\n`
		else return null
		return txt
	}
}

export default {icXIncrement, icXDecrement}