import {icX} from "./dist";
import fs from 'fs';

var text = fs.readFileSync('./tests/.icX', 'utf8');
var a = new icX(text)
var b = a.getCompiled()
fs.writeFileSync('./tests/.ic10', b);
console.info(b)
