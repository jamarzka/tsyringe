export var INJECTION_TOKEN_METADATA_KEY = "injectionTokens";
function requireReflectMetadata() {
    if (typeof Reflect === "undefined" || !Reflect.getMetadata) {
        throw "tsyringe requires a reflect polyfill. Please add 'import \"reflect-metadata\"' to the top of your entry point.";
    }
}
export function getParamInfo(target) {
    requireReflectMetadata();
    var params = Reflect.getMetadata("design:paramtypes", target) || [];
    var injectionTokens = Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
    Object.keys(injectionTokens).forEach(function (key) {
        params[+key] = injectionTokens[key];
    });
    return params;
}
export function defineInjectionTokenMetadata(data) {
    requireReflectMetadata();
    return function (target, _propertyKey, parameterIndex) {
        var injectionTokens = Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
        injectionTokens[parameterIndex] = data;
        Reflect.defineMetadata(INJECTION_TOKEN_METADATA_KEY, injectionTokens, target);
    };
}
