import { icX } from "./index";
export declare var vars: {
    count: number;
    aliases: {};
    setAlias: (v: any, a: any) => void;
    get: () => string;
    reset: () => void;
};
export declare var whiles: {
    count: number;
    get: () => string;
    reset: () => void;
};
export declare class icXElem {
    originalPosition: number;
    originalText: string;
    scope: icXElem | icX;
    command: {
        command: string;
        args: string[];
        empty: boolean;
    };
    private args;
    constructor(scope: icXElem | icX, pos?: number, text?: string);
    setCommand(e: {
        command: string;
        args: string[];
        empty: boolean;
    }): void;
    compile(): string;
    parseRules(): void;
}
export declare class icXBlock extends icXElem {
    end: number | undefined;
    start: number | undefined;
    content: Object;
    endKeys: RegExp;
    addElem(e: icXElem): void;
    setStart(line: number): this;
    setEnd(line: number): icXElem | icX;
    constructor(scope: icXElem | icX, pos: number, text: string);
    compile(): string;
}
export declare class icXFunction extends icXBlock {
    name: any;
    constructor(scope: icXElem, pos: number, text: string);
    setCommand(e: any): void;
    compile(): string;
}
export declare class icXIf extends icXBlock {
    constructor(scope: icXElem, pos: number, text: string);
}
export declare class icXWhile extends icXBlock {
    constructor(scope: icXElem, pos: number, text: string);
    compile(): string;
}
export declare class icXVar extends icXElem {
    constructor(scope: icXElem, pos: number, text: string);
    compile(): string;
}
export declare class icXConst extends icXElem {
    constructor(scope: icXElem, pos: number, text: string);
    compile(): string;
}
export declare class icXIncrement extends icXElem {
    constructor(scope: icXElem, pos: number, text: string);
    compile(): string;
}
