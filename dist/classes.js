"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.icXLog = exports.icXAlias = exports.icXIncrement = exports.icXConst = exports.icXVar = exports.icXWhile = exports.icXIf = exports.icXFunction = exports.icXBlock = exports.icXElem = exports.functions = exports.ifs = exports.whiles = exports.vars = void 0;
exports.vars = {
    count: 0,
    aliases: {},
    setAlias: function (v, a) {
        this.aliases[a] = v;
        this.aliases[v] = a;
    },
    get: function () {
        if (this.count == 16) {
            this.count++;
        }
        if (this.count > 15) {
            throw 'not enough vars :(';
        }
        return 'r' + this.count++;
    },
    reset: function () {
        this.count = 0;
        this.aliases = {};
    }
};
exports.whiles = {
    count: 0,
    get: function () {
        return 'while' + this.count++;
    },
    reset: function () {
        this.count = 0;
    }
};
exports.ifs = {
    count: 0,
    get: function () {
        return 'if' + this.count++;
    },
    reset: function () {
        this.count = 0;
    }
};
exports.functions = {
    fn: [],
    add: function (txt) {
        this.fn.push(txt);
    },
    get: function () {
        return this.fn.join('\n');
    }
};
class icXElem {
    constructor(scope, pos = 0, text = '') {
        this.command = { command: '', args: [], empty: true };
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
            if (byDots[0].trim() in exports.vars.aliases) {
                re = /\b([\w\d]+)\.([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\b/i;
                if (re.test(this.originalText)) {
                    var a = re.exec(this.originalText);
                    return `s ${a[1]} ${a[2]} ${a[4]}`;
                }
            }
            re = /\b([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\.([\w\d]+)\s{0,}$/i;
            if (re.test(this.originalText)) {
                var a = re.exec(this.originalText);
                return `l ${a[1]} ${a[3]} ${a[4]}`;
            }
            re = /\b([\w\d]+)\s{0,}(=)\s{0,}([\w\d]+)\.slot\(([\w\d]+)\).([\w\d]+)\b/i;
            if (re.test(this.originalText)) {
                var a = re.exec(this.originalText);
                return `ls ${a[1]} ${a[3]} ${a[4]} ${a[5]}`;
            }
            re = /\b([\w\d]+)\s{0,}(=)\s{0,}d\(([\w\d]+)\).([\w\d]+)\(([\w\d]+)\b/i;
            if (re.test(this.originalText)) {
                var a = re.exec(this.originalText);
                return `lb ${a[1]} ${a[3]} ${a[4]} ${a[5]}`;
            }
        }
        re = /\b([\.\d\w]+)\s{0,}(=)\s{0,}([\s\.\d\w]+?\b)/i;
        if (re.test(this.originalText)) {
            var a = re.exec(this.originalText);
            return `move ${a[1]} ${a[3]} \n`;
        }
        re = /\b([\w\d]+)?\(\)/i;
        if (re.test(this.originalText)) {
            var a = re.exec(this.originalText);
            return `jal ${a[1]} \n`;
        }
        return this.originalText;
    }
    parseRules() {
        var re = /\b([\.\d\w]+)\s{0,}(<|==|>|<=|>=|\||!=|\&|\~\=)\s{0,}([\s\.\d\w]+?\b)(\,[\s\.\d\w]+){0,}/i;
        if (re.test(this.args)) {
            this.rule = re.exec(this.args);
            switch (this.rule[2]) {
                case '<':
                    if (parseInt(this.rule[3]) === 0) {
                        return `sltz icxTempVar ${this.rule[1]}`;
                    }
                    else {
                        return `slt icxTempVar ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '==':
                    if (parseInt(this.rule[3]) === 0) {
                        return `seqz icxTempVar ${this.rule[1]}`;
                    }
                    else {
                        return `seq icxTempVar ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '>':
                    if (parseInt(this.rule[3]) === 0) {
                        return `sgtz icxTempVar ${this.rule[1]}`;
                    }
                    else {
                        return `sgt icxTempVar ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '<=':
                    if (parseInt(this.rule[3]) === 0) {
                        return `slez icxTempVar ${this.rule[1]}`;
                    }
                    else {
                        return `sle icxTempVar ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '>=':
                    if (parseInt(this.rule[3]) === 0) {
                        return `sgez icxTempVar ${this.rule[1]}`;
                    }
                    else {
                        return `sge icxTempVar ${this.rule[1]} ${this.rule[3]}`;
                    }
                case '|':
                    return `or icxTempVar ${this.rule[1]} ${this.rule[3]}`;
                case '&':
                    return `and icxTempVar ${this.rule[1]} ${this.rule[3]}`;
                case '~=':
                    if (parseInt(this.rule[3]) === 0) {
                        return `sapz icxTempVar ${this.rule[1]} ${this.rule[4]}`;
                    }
                    else {
                        return `sap icxTempVar ${this.rule[1]} ${this.rule[3]} ${this.rule[4]}`;
                    }
                case '!=':
                    if (parseInt(this.rule[3]) === 0) {
                        return `snez icxTempVar ${this.rule[1]}`;
                    }
                    else {
                        return `sne icxTempVar ${this.rule[1]} ${this.rule[3]}`;
                    }
            }
        }
    }
}
exports.icXElem = icXElem;
class icXBlock extends icXElem {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
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
        var txt = [];
        for (const contentKey in this.content) {
            txt.push(this.content[contentKey].compile());
        }
        return txt.join("\n") + "\n";
    }
}
exports.icXBlock = icXBlock;
class icXFunction extends icXBlock {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
    setCommand(e) {
        super.setCommand(e);
        this.name = e.args[0];
    }
    compile() {
        var txt = `${this.name}:\n`;
        txt += super.compile();
        txt += 'j ra\n';
        exports.functions.add(txt);
        return '';
    }
}
exports.icXFunction = icXFunction;
class icXIf extends icXBlock {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
    compile() {
        var isElse = false;
        var r = this.parseRules();
        var l = exports.ifs.get();
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
            txt.push(`beqz icxTempVar ${l}exit`);
            txt.push(`beq icxTempVar 1 ${l}`);
        }
        else {
            txt.push(`beqz icxTempVar ${l}else`);
            txt.push(`beq icxTempVar 1 ${l}`);
        }
        txt.push(`${l}:`);
        txt.push(_txt.join('\n'));
        txt.push(`${l}exit:`);
        return txt.join('\n') + '\n';
    }
}
exports.icXIf = icXIf;
class icXWhile extends icXBlock {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
    compile() {
        var r = this.parseRules();
        var l = exports.whiles.get();
        var txt = [];
        txt.push(`${l}:`);
        txt.push(r);
        txt.push(`beqz icxTempVar ${l}exit`);
        txt.push(super.compile());
        txt.push(`j ${l}`);
        txt.push(`${l}exit:`);
        return txt.join('\n') + '\n';
    }
}
exports.icXWhile = icXWhile;
class icXVar extends icXElem {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
    compile() {
        var txt = '';
        var v = exports.vars.get();
        if (0 in this.command.args) {
            var a = this.command.args[0];
            exports.vars.setAlias(v, a);
            txt += `alias ${a} ${v} \n`;
        }
        var b = this.originalText.split('=');
        if (1 in b) {
            txt += `move ${v} ${b[1].trim()}  \n`;
        }
        return txt;
    }
}
exports.icXVar = icXVar;
class icXConst extends icXElem {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
    compile() {
        var txt = '';
        if (this.command.args.length >= 2) {
            var a = this.command.args.join('');
            var b = a.split('=');
            b[0] = b[0].trim();
            exports.vars.setAlias(b[0], b[0]);
            txt += `define ${b[0]} ${b[1]} \n`;
        }
        return txt;
    }
}
exports.icXConst = icXConst;
class icXIncrement extends icXElem {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
    compile() {
        var a = /\b(\S+\b)\+\+/i.exec(this.originalText);
        var txt = `add ${a[1]} ${a[1]} 1  \n`;
        return txt;
    }
}
exports.icXIncrement = icXIncrement;
class icXAlias extends icXElem {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
    compile() {
        exports.vars.setAlias(this.command.args[0], this.command.args[1]);
        return super.compile();
    }
}
exports.icXAlias = icXAlias;
class icXLog extends icXElem {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
    compile() {
        return `#log ${this.args}`;
    }
}
exports.icXLog = icXLog;
//# sourceMappingURL=classes.js.map