// import {icX} from "./dist";
// import fs from 'fs';

// var text = fs.readFileSync('./tests/000.icX', 'utf8');
// var a = new icX(text)
// var b = a.getCompiled()
// fs.writeFileSync('./tests/t2.ic10', b);

class mathBlock {
	scope: mathBlock | null
	text: string
	content: mathBlock[] = []

	constructor(scope: mathBlock | null, text: string = "") {
		this.scope = scope
		this.text = text
		// const regex = /\((.+)\)/
		// this.text = (regex.exec(text) ?? "")[1] ?? ""
		// for (let i = 0; i < this.text.length; i++) {
		// 	const key = this.text[i]
		// 	if (key === "(") {
		// 		this.brakets.open.push(i)
		// 	} else if (key === ")") {
		// 		var removed = this.brakets.open.pop() ?? -1
		// 		this.brakets.total.push({ start: removed, end: i })
		// 	}
		// }
	}
	// start():string{
	// 	console.log(1, this.brakets.total)
	// 	if (this.brakets.total.length>0)
	// 		return new mathBlock(this, this.text.slice(this.brakets.total[0].start,this.brakets.total[0].end+1)).start()
	// 	else return ""
	// }
	addElem(e: mathBlock) {
		this.content.push(e)
	}

	compile(){
		for (const contentKey in this.content) {
			const text = this.content[contentKey].compile()
			if (text !== null){}
				// txt.push(text)
		}
	}
}
class mathOp extends mathBlock {
	constructor(scope: mathBlock | null, text: string = "") {
		super(scope,text)
	}
}
function parseMath() {
	var text = `(2+3*4/5-5)`
	text = text.replace(/\s+/g, "")
	const regex = /^\((.+)\)$/
	text = (regex.exec(text) ?? "")[1] ?? ""
	var blocks = text.split(/([+\-*\/%])/g)
	console.log(blocks)
	var result = ""
	var index = -1
	while (++index < blocks.length) {
		var element = blocks[index]
		if (element == "%"){
			result += `mod r0 ${blocks[index-1]} ${blocks[index+1]}\n`
			blocks[index] = "r0"
			blocks = blocks.filter((block,i) => i !== index-1 && i !== index+1)
			index = -1
		}
	}
	index = -1
	while (++index < blocks.length) {
		var element = blocks[index]
		if (element == "*" || element == "/"){
			if (element == "*"){
				result += `mul r0 ${blocks[index-1]} ${blocks[index+1]}\n`
			} else if (element == "/") {
				result += `div r0 ${blocks[index-1]} ${blocks[index+1]}\n`
			}
			blocks[index] = "r0"
			blocks = blocks.filter((block,i) => i !== index-1 && i !== index+1)
			index = -1
			
		}
		
	}
	index = -1
	while (++index < blocks.length) {
		var element = blocks[index]
		if (element == "+" || element == "-"){
			if (element == "+"){
				result += `add r0 ${blocks[index-1]} ${blocks[index+1]}\n`
			} else if (element == "-") {
				result += `sub r0 ${blocks[index-1]} ${blocks[index+1]}\n`
			}
			blocks[index] = "r0"
			blocks = blocks.filter((block,i) => i !== index-1 && i !== index+1)
			index = -1
		}
	}
	console.log(blocks)
	return result
	// var structure = new mathBlock(null, text)
	// var currentBlock = structure
	// blocks.forEach((elem) => {
	// 	console.log(elem)
	// 	if (/([+\-*\/%])/.test(elem)) {
	// 		var a = new mathOp(currentBlock, elem)
	// 	} else {
	// 		var a = new mathBlock(currentBlock, elem)
	// 	}
	// 	currentBlock.addElem(a)
	// })
	// console.log(structure)
	// structure.compile()
	// return new mathBlock(null, text).start()
}
// function parseMath() {
// 	//12345678901234567890123456789012345678901234567890
// 	var text = "(1 + (2 + 3) + (4 + 5 / (6 / 7) ) * (8 + 9) )"
// 	const regex = /\((.+)\)/
// 	text = text.replace(/\s+/g, "")
// 	console.log(text)
// 	if (regex.test(text)) {
// 		var txt = (regex.exec(text) ?? "")[1] ?? ""

// 		const brakets: { open: number[]; total: { start: number; end: number; in?: any }[] } = { open: [], total: [] }

// 		for (let i = 0; i < txt.length; i++) {
// 			const key = txt[i]
// 			if (key === "(") {
// 				brakets.open.push(i)
// 			} else if (key === ")") {
// 				var removed = brakets.open.pop() ?? -1
// 				brakets.total.push({ start: removed, end: i })
// 			}
// 		}
// 		const groups = brakets.total
// 		var a:string[] = [];
// 		groups.forEach((group) => {
// 			a.push(text.slice(group.start+2,group.end+1))
// 		})
// 		console.log(a)
// 	}
// }
console.log(parseMath())
