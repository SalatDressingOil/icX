"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.use = exports.functions = exports.ifs = exports.whiles = exports.vars = void 0;
exports.vars = {
    count: 1,
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
        this.count = 1;
        this.aliases = {};
    }
};
exports.whiles = {
    count: 0,
    reset: function () {
        this.count = 0;
    },
    get: function () {
        return 'while' + this.count++;
    }
};
exports.ifs = {
    count: 0,
    reset: function () {
        this.count = 0;
    },
    get: function () {
        return 'if' + this.count++;
    }
};
exports.functions = {
    fn: [],
    add: function (str) {
        this.fn.push(str);
    },
    get: function () {
        return this.fn.join('\n');
    }
};
exports.use = {
    arg: [],
    add: function (...str) {
        this.arg.push(...str);
    },
    has: function (str) {
        if (this.arg.indexOf(str) === -1)
            return false;
        else
            return true;
    }
};
//# sourceMappingURL=lists.js.map