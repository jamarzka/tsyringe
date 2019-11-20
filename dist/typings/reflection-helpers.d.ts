import constructor from "./types/constructor";
export declare const INJECTION_TOKEN_METADATA_KEY = "injectionTokens";
export declare function getParamInfo(target: constructor<any>): any[];
export declare function defineInjectionTokenMetadata(data: any): (target: any, propertyKey: string | symbol, parameterIndex: number) => any;
