export declare const regexes: {
    rr1: RegExp;
    r1: RegExp;
    d1: RegExp;
    rr: RegExp;
    strStart: RegExp;
    strEnd: RegExp;
};
export declare class icX {
    text: string;
    private keyFirstWord;
    private lines;
    position: number;
    private commands;
    private structure;
    private currentBlock;
    private operators;
    constructor(text: string);
    init(text: string): void;
    getCompiled(): string;
}
