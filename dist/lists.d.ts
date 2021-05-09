export declare const vars: {
    count: number;
    aliases: {
        [id: string]: string;
    };
    RDs: {
        [id: string]: string;
    };
    getRD: (a: string) => string | undefined;
    getAlias: (a: string) => string;
    setAlias: (r: string, a: string) => void;
    setRDs: (r: string, a: string) => void;
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
export declare const use: {
    arg: string[];
    add: (...str: string[]) => void;
    has: (str: string) => boolean;
};
