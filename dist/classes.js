"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.icXYield = exports.icXUse = exports.icXLog = exports.icXAlias = exports.icXConst = exports.icXVar = exports.icXWhile = exports.icXIf = exports.icXFunction = exports.icXBlock = exports.icXElem = void 0;
const lists_1 = require("./lists");
class icXElem {
    constructor(scope, pos = 0, text = "") {
        this.command = { command: '', args: [], empty: true };
        this.args = "";
        this.rule = null;
        this.re = [];
        this.scope = scope;
        this.originalPosition = pos;
        this.originalText = text;
    }
    setCommand(e) {
        this.command = e;
        if (!this.originalText) {
            this.originalText = this.command.command + ' ' + this.command.args.join(' ');
        }
        this.args = this.command.args.join(' ');
    }
    compile() {
        var re;
        var byDots = this.originalText.split('.');
        if (byDots.length > 1) {
            if (byDots[0].trim() in lists_1.vars.aliases) {
                re = /\b([\w\d]+)\.([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\b/i;
                if (re.test(this.originalText)) {
                    var a = re.exec(this.originalText);
                    if (a == null)
                        return null;
                    return `s ${a[1]} ${a[2]} ${a[4]}`;
                }
            }
            re = /\b([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\.([\w\d]+)\s{0,}$/i;
            if (re.test(this.originalText)) {
                var a = re.exec(this.originalText);
                if (a == null)
                    return null;
                return `l ${a[1]} ${a[3]} ${a[4]}`;
            }
            re = /\b([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\.slot\(([\w\d]+)\).([\w\d]+)\b/i;
            if (re.test(this.originalText)) {
                var a = re.exec(this.originalText);
                if (a == null)
                    return null;
                return `ls ${a[1]} ${a[3]} ${a[4]} ${a[5]}`;
            }
            re = /\b([\w\d]+)\s{0,}(=)\s{0,}d\(([\w\d]+)\).([\w\d]+)\(([\w\d]+)\b/i;
            if (re.test(this.originalText)) {
                var a = re.exec(this.originalText);
                if (a == null)
                    return null;
                return `lb ${a[1]} ${a[3]} ${a[4]} ${a[5]}`;
            }
        }
        re = /\b([\.\d\w]+)\s{0,}(=)\s{0,}([\s\.\d\w]+?\b)/i;
        if (re.test(this.originalText)) {
            var a = re.exec(this.originalText);
            if (a == null)
                return null;
            return `move ${a[1]} ${a[3]}\n`;
        }
        re = /\b([\w\d]+)?\(\)/i;
        if (re.test(this.originalText)) {
            var a = re.exec(this.originalText);
            if (a == null)
                return null;
            return `jal ${a[1]}\n`;
        }
        return this.originalText;
    }
    parseRules() {
        var re = /\b([\.\d\w]+)\s{0,}(<|==|>|<=|>=|\||!=|\&|\~\=)\s{0,}([\s\.\d\w]+?\b)(\,[\s\.\d\w]+){0,}/i;
        if (re.test(this.args)) {
            this.rule = re.exec(this.args);
            if (this.rule == null)
                return null;
            switch (this.rule[2]) {
                case '<':
                    if (parseInt(this.rule[3]) === 0) {
                        return `sltz r0 ${this.rule[1]}`;
                    }
                    else {
                        return `slt r0 ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '==':
                    if (parseInt(this.rule[3]) === 0) {
                        return `seqz r0 ${this.rule[1]}`;
                    }
                    else {
                        return `seq r0 ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '>':
                    if (parseInt(this.rule[3]) === 0) {
                        return `sgtz r0 ${this.rule[1]}`;
                    }
                    else {
                        return `sgt r0 ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '<=':
                    if (parseInt(this.rule[3]) === 0) {
                        return `slez r0 ${this.rule[1]}`;
                    }
                    else {
                        return `sle r0 ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '>=':
                    if (parseInt(this.rule[3]) === 0) {
                        return `sgez r0 ${this.rule[1]}`;
                    }
                    else {
                        return `sge r0 ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '|':
                    return `or r0 ${this.rule[1]} ${this.rule[3]}`;
                case '&':
                    return `and r0 ${this.rule[1]} ${this.rule[3]}`;
                case '~=':
                    if (parseInt(this.rule[3]) === 0) {
                        return `sapz r0 ${this.rule[1]} ${this.rule[4]}`;
                    }
                    else {
                        return `sap r0 ${this.rule[1]} ${this.rule[3]} ${this.rule[4]}`;
                    }
                case '!=':
                    if (parseInt(this.rule[3]) === 0) {
                        return `snez r0 ${this.rule[1]}`;
                    }
                    else {
                        return `sne r0 ${this.rule[1]} ${this.rule[3]}`;
                    }
            }
        }
    }
}
exports.icXElem = icXElem;
class icXBlock extends icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.content = {};
        this.endKeys = /\bend\b/i;
    }
    addElem(e) {
        this.content[e.originalPosition] = e;
    }
    setStart(line) {
        this.start = line;
        return this;
    }
    setEnd(line) {
        this.end = line;
        return this.scope;
    }
    compile() {
        const txt = [];
        for (const contentKey in this.content) {
            const text = this.content[contentKey].compile();
            if (text !== null)
                txt.push(text);
        }
        return txt.join("\n") + "\n";
    }
}
exports.icXBlock = icXBlock;
class icXFunction extends icXBlock {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.name = null;
        this.re.push(/\bfunction\b/i);
        this.re.push(/\bdef\b/i);
    }
    setCommand(e) {
        super.setCommand(e);
        this.name = e.args[0];
    }
    compile() {
        var txt = `${this.name}:\n`;
        txt += super.compile();
        txt += 'j ra\n';
        lists_1.functions.add(txt);
        return '';
    }
}
exports.icXFunction = icXFunction;
class icXIf extends icXBlock {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\bif\b/i);
    }
    compile() {
        var isElse = false;
        var r = this.parseRules();
        var l = lists_1.ifs.get();
        var txt = [];
        var _txt = [];
        for (const contentKey in this.content) {
            if (this.content[contentKey].originalText.trim().toLowerCase() == 'else') {
                _txt.push(`j ${l}exit`);
                _txt.push(`${l}else:`);
                isElse = true;
            }
            else {
                _txt.push(this.content[contentKey].compile());
            }
        }
        txt.push(r);
        if (!isElse) {
            txt.push(`beqz r0 ${l}exit`);
            txt.push(`beq r0 1 ${l}`);
        }
        else {
            txt.push(`beqz r0 ${l}else`);
            txt.push(`beq r0 1 ${l}`);
        }
        txt.push(`${l}:`);
        txt.push(_txt.join('\n'));
        txt.push(`${l}exit:`);
        return txt.join('\n') + '\n';
    }
}
exports.icXIf = icXIf;
class icXWhile extends icXBlock {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\bfor\b/i);
        this.re.push(/\bwhile\b/i);
    }
    compile() {
        var r = this.parseRules();
        var l = lists_1.whiles.get();
        var txt = [];
        txt.push(`${l}:`);
        txt.push(r);
        txt.push(`beqz r0 ${l}exit`);
        txt.push(super.compile());
        txt.push(`j ${l}`);
        txt.push(`${l}exit:`);
        return txt.join('\n') + '\n';
    }
}
exports.icXWhile = icXWhile;
class icXVar extends icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\bvar\b/i);
    }
    compile() {
        var txt = '';
        var r = lists_1.vars.get();
        if (0 in this.command.args) {
            var a = this.command.args[0];
            lists_1.vars.setAlias(r, a);
            if (!lists_1.use.has("ignore_aliases")) {
                txt += `alias ${a} ${r}\n`;
            }
            console.log(lists_1.vars);
        }
        var b = this.originalText.split('=');
        if (1 in b) {
            txt += `move ${r} ${b[1].trim()}\n`;
        }
        return txt;
    }
}
exports.icXVar = icXVar;
class icXConst extends icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\bconst\b/i);
    }
    compile() {
        var txt = '';
        if (this.command.args.length >= 2) {
            var a = this.command.args.join('');
            var b = a.split('=');
            b[0] = b[0].trim();
            lists_1.vars.setAlias(b[0], b[0]);
            txt += `define ${b[0]} ${b[1]}\n`;
        }
        return txt;
    }
}
exports.icXConst = icXConst;
class icXAlias extends icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\balias\b/i);
    }
    compile() {
        lists_1.vars.setAlias(this.command.args[0], this.command.args[1]);
        return super.compile();
    }
}
exports.icXAlias = icXAlias;
class icXLog extends icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\blog\b/i);
    }
    compile() {
        if (lists_1.use.has("ignore_aliases") && lists_1.vars.getRD(this.args) !== undefined)
            return `#log ${lists_1.vars.getRD(this.args)}`;
        return `#log ${this.args}`;
    }
}
exports.icXLog = icXLog;
class icXUse extends icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\buse\b/i);
    }
    compile() {
        lists_1.use.add(...this.command.args);
        return "";
    }
}
exports.icXUse = icXUse;
class icXYield extends icXElem {
    constructor(scope, pos = 0, text = "") {
        super(scope, pos, text);
        this.re.push(/\byield\b/i);
    }
    compile() {
        return "yield";
    }
}
exports.icXYield = icXYield;
//# sourceMappingURL=classes.js.map