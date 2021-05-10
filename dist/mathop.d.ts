import { icXElem } from "./classes";
export declare class icXIncrement extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string | null;
}
export declare class icXDecrement extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string | null;
}
