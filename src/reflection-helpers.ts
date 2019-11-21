import Dictionary from "./types/dictionary";
import constructor from "./types/constructor";
import InjectionToken from "./providers/injection-token";

export const INJECTION_TOKEN_METADATA_KEY = "injectionTokens";

function requireReflectMetadata(): void {
  if (typeof Reflect === "undefined" || !Reflect.getMetadata) {
    throw `tsyringe requires a reflect polyfill. Please add 'import "reflect-metadata"' to the top of your entry point.`;
  }
}

export function getParamInfo(target: constructor<any>): any[] {
  requireReflectMetadata();
  const params: any[] = Reflect.getMetadata("design:paramtypes", target) || [];
  const injectionTokens: Dictionary<InjectionToken<any>> =
    Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
  Object.keys(injectionTokens).forEach(key => {
    params[+key] = injectionTokens[key];
  });

  return params;
}

export function defineInjectionTokenMetadata(
  data: any
): (target: any, propertyKey: string | symbol, parameterIndex: number) => any {
  requireReflectMetadata();
  return function(
    target: any,
    _propertyKey: string | symbol,
    parameterIndex: number
  ): any {
    const injectionTokens =
      Reflect.getOwnMetadata(INJECTION_TOKEN_METADATA_KEY, target) || {};
    injectionTokens[parameterIndex] = data;
    Reflect.defineMetadata(
      INJECTION_TOKEN_METADATA_KEY,
      injectionTokens,
      target
    );
  };
}
