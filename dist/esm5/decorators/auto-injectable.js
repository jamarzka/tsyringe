import { __extends, __read, __spread } from "tslib";
import { getParamInfo } from "../reflection-helpers";
import { instance as globalContainer } from "../dependency-container";
import { isTokenDescriptor } from "../providers/injection-token";
function autoInjectable() {
    return function (target) {
        var paramInfo = getParamInfo(target);
        return (function (_super) {
            __extends(class_1, _super);
            function class_1() {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _super.apply(this, __spread(args.concat(paramInfo.slice(args.length).map(function (type, index) {
                    try {
                        if (isTokenDescriptor(type)) {
                            return type.multiple
                                ? globalContainer.resolveAll(type.token)
                                : globalContainer.resolve(type.token);
                        }
                        return globalContainer.resolve(type);
                    }
                    catch (e) {
                        var argIndex = index + args.length;
                        var _a = __read(target.toString().match(/constructor\(([\w, ]+)\)/) || [], 2), _b = _a[1], params = _b === void 0 ? null : _b;
                        var argName = params
                            ? params.split(",")[argIndex]
                            : "#" + argIndex;
                        throw "Cannot inject the dependency " + argName + " of " + target.name + " constructor. " + e;
                    }
                })))) || this;
            }
            return class_1;
        }(target));
    };
}
export default autoInjectable;
