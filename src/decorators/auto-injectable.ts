import constructor from "../types/constructor";
import {getParamInfo} from "../reflection-helpers";
import {instance as globalContainer} from "../dependency-container";
import {isTokenDescriptor} from "../providers/injection-token";

/**
 * Class decorator factory that replaces the decorated class' constructor with
 * a parameterless constructor that has dependencies auto-resolved
 *
 * Note: Resolution is performed using the global container
 *
 * @return {Function} The class decorator
 */
function autoInjectable(): (target: constructor<any>) => any {
  return function(target: constructor<any>): constructor<any> {
    const paramInfo = getParamInfo(target);

    return class extends target {
      constructor(...args: any[]) {
        super(
          ...args.concat(
            paramInfo.slice(args.length).map((type, index) => {
              try {
                if (isTokenDescriptor(type)) {
                  return type.multiple
                    ? globalContainer.resolveAll(type.token)
                    : globalContainer.resolve(type.token);
                }
                return globalContainer.resolve(type);
              } catch (e) {
                const argIndex = index + args.length;

                const [, params = null] =
                  target.toString().match(/constructor\(([\w, ]+)\)/) || [];
                const argName = params
                  ? params.split(",")[argIndex]
                  : `#${argIndex}`;

                throw `Cannot inject the dependency ${argName} of ${target.name} constructor. ${e}`;
              }
            })
          )
        );
      }
    };
  };
}

export default autoInjectable;
