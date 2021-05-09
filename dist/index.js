"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.icX = exports.regexes = void 0;
const classes = __importStar(require("./classes"));
const lists_1 = require("./lists");
const modules_1 = __importDefault(require("./modules"));
exports.regexes = {
    'rr1': new RegExp("[rd]{1,}(r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a))$"),
    'r1': new RegExp("^r(0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|a)$"),
    'd1': new RegExp("^d(0|1|2|3|4|5|b)$"),
    'rr': new RegExp("^d(0|1|2|3|4|5|b)$"),
    'strStart': new RegExp("^\".+$"),
    'strEnd': new RegExp(".+\"$"),
};
class icX {
    constructor(text) {
        this.keyFirstWord = [];
        this.position = 0;
        this.commands = [];
        this.structure = null;
        this.currentBlock = null;
        this.operators = {};
        for (const key in classes) {
            try {
                if (Object.prototype.hasOwnProperty.call(classes, key)) {
                    const element = classes[key];
                    try {
                        var x = new element;
                        if (x instanceof classes.icXElem) {
                            x.re.forEach(re => {
                                this.keyFirstWord.push({ class: key, re });
                                this.operators[key] = classes[key];
                            });
                        }
                    }
                    catch { }
                }
            }
            catch { }
        }
        for (const key in modules_1.default) {
            try {
                if (Object.prototype.hasOwnProperty.call(modules_1.default, key)) {
                    const element = modules_1.default[key];
                    try {
                        var x = new element;
                        if (x instanceof classes.icXElem) {
                            x.re.forEach(re => {
                                this.keyFirstWord.push({ class: key, re });
                                this.operators[key] = modules_1.default[key];
                            });
                        }
                    }
                    catch { }
                }
            }
            catch { }
        }
        console.log(this.keyFirstWord);
        this.position = 0;
        this.text = text;
        this.init(this.text);
    }
    init(text) {
        this.lines = text.split(/\r?\n/);
        var commands = this.lines
            .map((line) => {
            const args = line.trim().split(/\s+/);
            const command = args.shift() ?? "";
            const empty = (!command || command.startsWith("#")) ? true : false;
            return { command, args, empty };
        });
        commands.forEach(command => {
            var newArgs = {};
            var mode = 0;
            var argNumber = 0;
            command.args.forEach(arg => {
                if (arg.startsWith("#")) {
                    return;
                }
                if (mode === 0) {
                    argNumber++;
                }
                if (exports.regexes.strStart.test(arg)) {
                    mode = 1;
                }
                if (argNumber in newArgs) {
                    newArgs[argNumber] += ' ' + arg;
                }
                else {
                    newArgs[argNumber] = arg;
                }
                if (exports.regexes.strEnd.test(arg)) {
                    mode = 0;
                }
                command.args = Object.values(newArgs);
            });
        });
        this.commands = commands;
        this.position = 0;
        var blockLvl = 0;
        var startBlock = {};
        this.structure = new classes.icXBlock(null, 0, this.text);
        this.currentBlock = this.structure;
        for (let position = 0; position < this.lines.length; position++) {
            if (this.commands.hasOwnProperty(position) && this.commands[position].empty == false) {
                var line = this.lines[position];
                var c = this.commands[position];
                var r = '';
                console.log(line);
                for (const keyFirstWordKey in this.keyFirstWord) {
                    var key = this.keyFirstWord[keyFirstWordKey];
                    if (key.re.test(line)) {
                        r = key.class;
                    }
                }
                if (r) {
                    try {
                        var a = new this.operators[r](this.currentBlock, position, line);
                        a.setCommand(c);
                        a.originalPosition = position;
                        this.currentBlock.addElem(a);
                        if (a instanceof classes.icXBlock) {
                            this.currentBlock = a.setStart(a.originalPosition + 1);
                        }
                    }
                    catch { }
                }
                else {
                    if (this.currentBlock.endKeys.test(line)) {
                        var block = this.currentBlock.setEnd(position - 1);
                        if (block instanceof classes.icXBlock) {
                            this.currentBlock = block;
                        }
                    }
                    else {
                        var elem = new classes.icXElem(this.currentBlock, position, line);
                        elem.setCommand(c);
                        this.currentBlock.addElem(elem);
                    }
                }
            }
        }
    }
    getCompiled() {
        lists_1.vars.reset();
        lists_1.ifs.reset();
        lists_1.whiles.reset();
        const code = (this.structure?.compile() ?? "") + "\n";
        var txt = "move r0 0\n";
        if (lists_1.use.has("loop"))
            txt += "_icXstart:\n";
        txt += "# ---icX User code start---\n";
        txt += code;
        txt += "# ---icX User code end---\n";
        if (lists_1.functions.fn.length != 0) {
            txt += "j _icXstart\n";
            txt += lists_1.functions.get();
            if (!lists_1.use.has("loop"))
                txt += "_icXstart:\n";
        }
        txt = txt
            .split("\n")
            .map((str) => {
            return str.trim();
        }).filter((str) => {
            if (!lists_1.use.has("comments") && str.startsWith("#"))
                return false;
            else
                return str !== "";
        }).join('\n\n');
        console.log(txt);
        return txt;
    }
}
exports.icX = icX;
//# sourceMappingURL=index.js.map