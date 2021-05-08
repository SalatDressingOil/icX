export declare const vars: {
    count: number;
    aliases: {
        [id: string]: string;
    };
    setAlias: (v: string, a: string) => void;
    reset: () => void;
    get: () => string;
};
export declare const whiles: {
    count: number;
    reset: () => void;
    get: () => string;
};
export declare const ifs: {
    count: number;
    reset: () => void;
    get: () => string;
};
export declare const functions: {
    fn: string[];
    add: (str: string) => void;
    get: () => string;
};
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
export declare class icXIncrement extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string | null;
}
export declare class icXAlias extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string | null;
}
export declare class icXLog extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string;
}
export declare class icXLog2 extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string;
}
