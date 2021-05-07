"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.icXIncrement = exports.icXConst = exports.icXVar = exports.icXWhile = exports.icXIf = exports.icXFunction = exports.icXBlock = exports.icXElem = exports.whiles = exports.vars = void 0;
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
            this.originalText = this.command.command + this.command.args.join(' ');
        }
        this.args = this.command.args.join(' ');
    }
    compile() {
        return this.originalText;
    }
    parseRules() {
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
        var txt = '';
        for (const contentKey in this.content) {
            txt += this.content[contentKey].compile() + "\n";
        }
        return txt;
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
        return txt;
    }
}
exports.icXFunction = icXFunction;
class icXIf extends icXBlock {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
}
exports.icXIf = icXIf;
class icXWhile extends icXBlock {
    constructor(scope, pos, text) {
        super(scope, pos = 0, text = '');
    }
    compile() {
        var l = exports.whiles.get();
        var txt = `${l}:\n`;
        txt += super.compile();
        txt += `j ${l}\n`;
        txt += `${l}exit:\n`;
        return txt;
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
        console.log(this.originalText);
        var txt = `add ${a[1]} ${a[1]} 1  \n`;
        return txt;
    }
}
exports.icXIncrement = icXIncrement;
//# sourceMappingURL=classes.js.map