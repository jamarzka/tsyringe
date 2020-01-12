import constructor from "../types/constructor";
import injectable from "./injectable";
import {instance as globalContainer} from "../dependency-container";

/**
 * Class decorator factory that registers the class as a singleton within
 * the global container.
 *
 * @return {Function} The class decorator
 */
function singleton<T>(paramInfo?: any[]): (target: constructor<T>) => void {
  return function(target: constructor<T>): void {
    injectable(paramInfo)(target);
    globalContainer.registerSingleton(target);
  };
}

export default singleton;
