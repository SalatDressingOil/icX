import { icXElem } from "../classes";
declare class icXIncrement extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string | null;
}
declare class icXDecrement extends icXElem {
    constructor(scope: icXElem | null, pos?: number, text?: string);
    compile(): string | null;
}
declare const _default: {
    icXIncrement: typeof icXIncrement;
    icXDecrement: typeof icXDecrement;
};
export default _default;
