"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reflection_helpers_1 = require("../reflection-helpers");
const dependency_container_1 = require("../dependency-container");
const injection_token_1 = require("../providers/injection-token");
function autoInjectable() {
    return function (target) {
        const paramInfo = reflection_helpers_1.getParamInfo(target);
        return class extends target {
            constructor(...args) {
                super(...args.concat(paramInfo.slice(args.length).map((type, index) => {
                    try {
                        if (injection_token_1.isTokenDescriptor(type)) {
                            return type.multiple
                                ? dependency_container_1.instance.resolveAll(type.token)
                                : dependency_container_1.instance.resolve(type.token);
                        }
                        return dependency_container_1.instance.resolve(type);
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
exports.default = autoInjectable;
