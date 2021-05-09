export declare class icXElem {
    originalPosition: number;
    originalText: string;
    scope: icXElem | null;
    command: {
        command: string;
        args: string[];
        empty: boolean;
    };
    args: string;
    rule: RegExpExecArray | null;
    re: RegExp[];
    constructor(scope: icXElem | null, pos?: number, text?: string);
    setCommand(e: {
        command: string;
        args: string[];
        empty: boolean;
    }): void;
    compile(): string | null;
    parseRules(): string | null | undefined;
}
export declare class icXBlock extends icXElem {
    end: number | undefined;
    start: number | undefined;
    content: {
        [id: number]: icXElem;
    };
    endKeys: RegExp;
    addElem(e: icXElem): void;
    setStart(line: number): this;
    setEnd(line: number): icXElem | null;
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string;
}
export declare class icXFunction extends icXBlock {
    name: string | null;
    constructor(scope: icXElem | null, pos?: number, text?: string);
    setCommand(e: {
        command: string;
        args: string[];
        empty: boolean;
    }): void;
    compile(): string;
}
export declare class icXIf extends icXBlock {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string;
}
export declare class icXWhile extends icXBlock {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string;
}
export declare class icXVar extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string;
}
export declare class icXConst extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string;
}
export declare class icXAlias extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string | null;
}
export declare class icXLog extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string;
}
export declare class icXUse extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): "";
}
export declare class icXYield extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string | null;
}
