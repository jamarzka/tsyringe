import { getParamInfo } from "../reflection-helpers";
import { typeInfo } from "../dependency-container";
function injectable(paramInfo) {
    return function (target) {
        typeInfo.set(target, paramInfo !== undefined ? paramInfo : getParamInfo(target));
    };
}
export default injectable;
