"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./dist/index");
const fs_1 = __importDefault(require("fs"));
var text = fs_1.default.readFileSync('./tests/000.icX', 'utf8');
var a = new index_1.icX(text);
var b = a.getCompiled();
fs_1.default.writeFileSync('./tests/t2.ic10', b);
//# sourceMappingURL=test.js.map