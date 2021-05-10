"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const modules = {};
const mathop_1 = __importDefault(require("./mathop"));
push(mathop_1.default);
function push(mod) {
    for (const key in mod) {
        if (Object.prototype.hasOwnProperty.call(mod, key)) {
            const element = mod[key];
            modules[key] = element;
        }
    }
}
exports.default = modules;
//# sourceMappingURL=index.js.map