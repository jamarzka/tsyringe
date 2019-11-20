import { getParamInfo } from "../reflection-helpers";
import { typeInfo } from "../dependency-container";
function injectable(target, params) {
    if (target !== undefined) {
        typeInfo.set(target, params || []);
    }
    return function (target) {
        typeInfo.set(target, getParamInfo(target));
    };
}
export default injectable;
