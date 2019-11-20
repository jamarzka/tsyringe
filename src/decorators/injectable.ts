import constructor from "../types/constructor";
import {getParamInfo} from "../reflection-helpers";
import {typeInfo} from "../dependency-container";

/**
 * Class decorator factory that allows the class' dependencies to be injected
 * at runtime.
 *
 * @return {Function} The class decorator
 */
function injectable<T>(
  target?: constructor<T>,
  params?: any[]
): (target: constructor<T>) => void {
  if (target !== undefined) {
    typeInfo.set(target, params || []);
  }

  return function(target: constructor<T>): void {
    typeInfo.set(target, getParamInfo(target));
  };
}

export default injectable;
