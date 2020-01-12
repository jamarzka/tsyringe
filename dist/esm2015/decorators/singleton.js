import injectable from "./injectable";
import { instance as globalContainer } from "../dependency-container";
function singleton(paramInfo) {
    return function (target) {
        injectable(paramInfo)(target);
        globalContainer.registerSingleton(target);
    };
}
export default singleton;
