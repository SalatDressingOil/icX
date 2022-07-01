import {icXElem} from "../classes";
//-------------------------------------------------
import mathop    from "./mathop"

const modules: { [smile: string]: icXElem } = {}

push(mathop)

//-------------------------------------------------
function push(mod: { [id: string]: any }) {
	for (const key in mod) {
		if (Object.prototype.hasOwnProperty.call(mod, key)) {
			const element = mod[key]
			modules[key]  = element
		}
	}
}

export default modules