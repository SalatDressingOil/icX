import {icX} from "./dist/index";
import fs from 'fs';

var text = fs.readFileSync('./tests/000.icX', 'utf8');
var a = new icX(text)
var b = a.getCompiled()
fs.writeFileSync('./tests/t2.ic10', b);
