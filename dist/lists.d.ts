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
export declare const use: {
    arg: string[];
    add: (...str: string[]) => void;
    has: (str: string) => boolean;
};
