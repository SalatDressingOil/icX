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
Object.defineProperty(exports, "__esModule", { value: true });
exports.icX = exports.regexes = void 0;
const classes = __importStar(require("./classes"));
const classes_1 = require("./classes");
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
        this.position = 0;
        this.commands = [];
        this.keyFirstWord = [
            { class: 'icXFunction', re: /\bfunction\b/i },
            { class: 'icXFunction', re: /\bdef\b/i },
            { class: 'icXIf', re: /\bif\b/i },
            { class: 'icXWhile', re: /\bfor\b/i },
            { class: 'icXWhile', re: /\bwhile\b/i },
            { class: 'icXVar', re: /\bvar\b/i },
            { class: 'icXConst', re: /\bconst\b/i },
            { class: 'icXIncrement', re: /\b(\S+\b)\+\+/i },
        ];
        this.position = 0;
        this.text = text;
        this.init(this.text);
    }
    init(text) {
        this.lines = text.split(/\r?\n/);
        var commands = this.lines
            .map((line) => {
            const args = line.trim().split(/\s+/);
            const command = args.shift();
            const empty = (!command || command.startsWith("#")) ? true : false;
            return { command, args, empty: empty };
        });
        for (const commandsKey in this.lines) {
            if (commands.hasOwnProperty(commandsKey)) {
                let command = commands[commandsKey];
                var newArgs = {};
                var mode = 0;
                var argNumber = 0;
                for (let argsKey in command.args) {
                    if (command.args.hasOwnProperty(argsKey)) {
                        let arg = command.args[argsKey];
                        if (arg.startsWith("#")) {
                            break;
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
                    }
                }
                commands[commandsKey].args = Object.values(newArgs);
            }
            else {
                commands.push({ command: '', args: [], empty: true });
            }
        }
        this.commands = commands;
        this.position = 0;
        var blockLvl = 0;
        var startBlock = {};
        this.structure = new classes.icXBlock(this, 0, this.text);
        this.currentBlock = this.structure;
        for (let position = 0; position < this.lines.length; position++) {
            if (this.commands.hasOwnProperty(position) && this.commands[position].empty == false) {
                var line = this.lines[position];
                var c = this.commands[position];
                var r = '';
                for (const keyFirstWordKey in this.keyFirstWord) {
                    var key = this.keyFirstWord[keyFirstWordKey];
                    if (key.re.test(line)) {
                        r = key.class;
                    }
                }
                if (r) {
                    console.log(r);
                    var cls = new classes[r](this.currentBlock, position, line);
                    cls.setCommand(c);
                    cls.originalPosition = position;
                    this.currentBlock.addElem(cls);
                    if (cls instanceof classes.icXBlock) {
                        this.currentBlock = cls.setStart(cls.originalPosition + 1);
                    }
                }
                else {
                    if (this.currentBlock.endKeys.test(line)) {
                        let a = this.currentBlock.setEnd(position - 1);
                        if (a instanceof classes.icXBlock) {
                            this.currentBlock = a;
                        }
                    }
                    else {
                        var cls = new classes.icXElem(this.currentBlock, position, line);
                        cls.setCommand(c);
                        this.currentBlock.addElem(cls);
                    }
                }
            }
        }
        console.log('structure', this.structure.content);
        console.log('----------------');
        console.log(this.getCompiled());
        console.log('----------------');
    }
    getCompiled() {
        classes_1.vars.reset();
        return this.structure.compile();
    }
}
exports.icX = icX;
//# sourceMappingURL=index.js.map