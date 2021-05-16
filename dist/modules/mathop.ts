import { icXElem, icXBlock } from "../classes"
import { functions, ifs, vars, whiles, use } from "../lists"


class icXIncrement extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\b(\S+\b)\+\+/i)
	}

	compile() {
		var a = /\b(\S+\b)\+\+/i.exec(this.originalText)
		if (a === null) return null
		return `add ${vars.get(a[1])} ${vars.get(a[1])} 1\n`
	}
}
class icXDecrement extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/\b(\S+\b)\-\-/i)
	}

	compile() {
		var a = /\b(\S+\b)\-\-/i.exec(this.originalText)
		if (a === null) return null
		return `sub ${vars.get(a[1])} ${vars.get(a[1])} 1\n`
	}
}
class icXElementaryMath extends icXElem {
	constructor(scope: icXElem | null, pos: number = 0, text: string = "") {
		super(scope, pos, text)
		this.re.push(/^([\.\d\w]+)[\t\f\v ]*=[\t\f\v ]*([\.\d\w]+)[\t\f\v ]*([+\-*\/%])[\t\f\v ]*([\.\d\w]+)[\t\f\v ]*$/)
	}

	compile() {
		var a = this.re[0].exec(this.originalText)
		if (a === null) return null
		var txt = ""
		switch (a[3]) {
			case "+":
				txt += "add"
				break
			case "-":
				txt += "sub"
				break
			case "*":
				txt += "mul"
				break
			case "/":
				txt += "div"
				break
			case "%":
				txt += "mod"
				break
			default:
				txt += "#log"
				break
		}
		return txt + ` ${vars.get(a[1])} ${vars.get(a[2])} ${vars.get(a[4])}\n`
	}
}


export default { icXIncrement, icXDecrement, icXElementaryMath}
