export const INJECTION_TOKEN_METADATA_KEY = "injectionTokens";
function requireReflectMetadata() {
    if (typeof Reflect === "undefined" || !Reflect.getMetadata) {
        throw `tsyringe requires a reflect polyfill. Please add 'import "reflect-metadata"' to the top of your entry point.`;
    }
}
export function getParamInfo(target) {
    requireReflectMetadata();
    const params = Reflect.getMetadata("design:paramtypes", target) || [];
    const injectionTokens = Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
    Object.keys(injectionTokens).forEach(key => {
        params[+key] = injectionTokens[key];
    });
    return params;
}
export function defineInjectionTokenMetadata(data) {
    requireReflectMetadata();
    return function (target, _propertyKey, parameterIndex) {
        const injectionTokens = Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
        injectionTokens[parameterIndex] = data;
        Reflect.defineMetadata(INJECTION_TOKEN_METADATA_KEY, injectionTokens, target);
    };
}
