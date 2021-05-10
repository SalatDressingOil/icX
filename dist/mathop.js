"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.icXDecrement = exports.icXIncrement = void 0;
const classes_1 = require("./classes");
class icXIncrement extends classes_1.icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\b(\S+\b)\+\+/i);
    }
    compile() {
        var a = /\b(\S+\b)\+\+/i.exec(this.originalText);
        if (a !== null)
            var txt = `add ${a[1]} ${a[1]} 1\n`;
        else
            return null;
        return txt;
    }
}
exports.icXIncrement = icXIncrement;
class icXDecrement extends classes_1.icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\b(\S+\b)\-\-/i);
    }
    compile() {
        var a = /\b(\S+\b)\-\-/i.exec(this.originalText);
        if (a !== null)
            var txt = `sub ${a[1]} ${a[1]} 1\n`;
        else
            return null;
        return txt;
    }
}
exports.icXDecrement = icXDecrement;
//# sourceMappingURL=mathop.js.map