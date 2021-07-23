"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const err_1 = require("./src/err");
const tests_1 = require("./tests/tests");
const testCases = [
    { icX: '_', ic10: '_', skip: false },
    { icX: 'useCommentsTrue', ic10: 'useCommentsTrue', skip: false },
    { icX: 'useCommentsFalse', ic10: 'useCommentsFalse', skip: false },
    { icX: 'example', ic10: 'example', skip: false },
    { icX: 'aliasForD0', ic10: 'aliasForD0', skip: false },
    { icX: 'devices', ic10: 'devices', skip: false }
];
let getLog = (result, name, current, expected) => {
    let text = result ? `Test passed: [${name}]` : `Test failed: [${name}]`;
    if (current) {
        text += `\nCurrent result:\n${current}`
            .split("\n")
            .map((str) => {
            return `\t${str}`;
        }).join("\n");
    }
    if (expected) {
        text += `\n\nExpected result:\n${expected}`
            .split("\n")
            .map((str) => {
            return `\t${str}`;
        }).join("\n");
    }
    return text;
};
try {
    testCases.forEach(function (testCase) {
        let tr = new tests_1.CompileExpectedTest(testCase.icX, testCase.ic10, testCase.skip).test();
        let text = tr.result
            ? { color: '\x1b[32m', text: getLog(tr.result, tr.name) }
            : { color: '\x1b[31m', text: getLog(tr.result, tr.name, tr.current, tr.expected) };
        if (testCase.skip !== undefined && !testCase.skip) {
            console.log(text.color, text.text);
        }
    });
}
catch (e) {
    console.log("\x1b[31m", "");
    if (e instanceof err_1.Err || e instanceof err_1.Errors) {
        console.error(e.getUserMessage());
    }
    else {
        console.error(e);
    }
}
//# sourceMappingURL=test-run.js.map