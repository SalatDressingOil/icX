"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classes_1 = require("../classes");
const lists_1 = require("../lists");
class icXIncrement extends classes_1.icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\b(\S+\b)\+\+/i);
    }
    compile() {
        var a = /\b(\S+\b)\+\+/i.exec(this.originalText);
        if (a === null)
            return null;
        return `add ${lists_1.vars.getAlias(a[1])} ${lists_1.vars.getAlias(a[1])} 1\n`;
    }
}
class icXDecrement extends classes_1.icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\b(\S+\b)\-\-/i);
    }
    compile() {
        var a = /\b(\S+\b)\-\-/i.exec(this.originalText);
        if (a === null)
            return null;
        return `sub ${lists_1.vars.getAlias(a[1])} ${lists_1.vars.getAlias(a[1])} 1\n`;
    }
}
class icXElementaryMath extends classes_1.icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/(\S+)[\t\f\v ]*=[\t\f\v ]*(\S+)[\t\f\v ]*([+\-*\/%])[\t\f\v ]*(\S+)[\t\f\v ]*$/);
    }
    compile() {
        var a = this.re[0].exec(this.originalText);
        if (a === null)
            return null;
        var txt = "";
        switch (a[3]) {
            case "+":
                txt += "add";
                break;
            case "-":
                txt += "sub";
                break;
            case "*":
                txt += "mul";
                break;
            case "/":
                txt += "div";
                break;
            case "%":
                txt += "mod";
                break;
            default:
                txt += "#log";
                break;
        }
        return txt + ` ${lists_1.vars.getAlias(a[1])} ${lists_1.vars.getAlias(a[2])} ${lists_1.vars.getAlias(a[4])}\n`;
    }
}
exports.default = { icXIncrement, icXDecrement, icXElementaryMath };
//# sourceMappingURL=mathop.js.map