import DependencyContainer from "./types/dependency-container";
import Provider from "./providers/provider";
import RegistrationOptions from "./types/registration-options";
import constructor from "./types/constructor";
export declare type Registration<T = any> = {
    provider: Provider<T>;
    options: RegistrationOptions;
    instance?: T;
};
export declare const typeInfo: Map<constructor<any>, any[]>;
export declare const instance: DependencyContainer;
export default instance;
