import { getParamInfo } from "../reflection-helpers";
import { instance as globalContainer } from "../dependency-container";
import { isTokenDescriptor } from "../providers/injection-token";
function autoInjectable() {
    return function (target) {
        const paramInfo = getParamInfo(target);
        return class extends target {
            constructor(...args) {
                super(...args.concat(paramInfo.slice(args.length).map((type, index) => {
                    try {
                        if (isTokenDescriptor(type)) {
                            return type.multiple
                                ? globalContainer.resolveAll(type.token)
                                : globalContainer.resolve(type.token);
                        }
                        return globalContainer.resolve(type);
                    }
                    catch (e) {
                        const argIndex = index + args.length;
                        const [, params = null] = target.toString().match(/constructor\(([\w, ]+)\)/) || [];
                        const argName = params
                            ? params.split(",")[argIndex]
                            : `#${argIndex}`;
                        throw `Cannot inject the dependency ${argName} of ${target.name} constructor. ${e}`;
                    }
                })));
            }
        };
    };
}
export default autoInjectable;
