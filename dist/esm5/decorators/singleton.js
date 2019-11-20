import injectable from "./injectable";
import { instance as globalContainer } from "../dependency-container";
function singleton(target, params) {
    if (target !== undefined) {
        injectable(target, params);
        globalContainer.registerSingleton(target);
    }
    return function (target) {
        injectable()(target);
        globalContainer.registerSingleton(target);
    };
}
export default singleton;
