"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const injectable_1 = require("./injectable");
const dependency_container_1 = require("../dependency-container");
function singleton(paramInfo) {
    return function (target) {
        injectable_1.default(paramInfo)(target);
        dependency_container_1.instance.registerSingleton(target);
    };
}
exports.default = singleton;
