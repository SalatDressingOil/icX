import {icXElem} from "../classes";

const modules: { [smile: string]: icXElem } = {}
//-------------------------------------------------
import mathop from "./mathop"
push(mathop)

//-------------------------------------------------
function push(mod: { [id: string]: any }) {
	for (const key in mod) {
		if (Object.prototype.hasOwnProperty.call(mod, key)) {
			const element = mod[key]
			modules[key] = element
		}
	}
}
export default modules