import { isClassProvider, isFactoryProvider, isNormalToken, isTokenProvider, isValueProvider } from "./providers";
import { isProvider } from "./providers/provider";
import { isTokenDescriptor } from "./providers/injection-token";
import Registry from "./registry";
import Lifecycle from "./types/lifecycle";
import ResolutionContext from "./resolution-context";
export const typeInfo = new Map();
class InternalDependencyContainer {
    constructor(parent) {
        this.parent = parent;
        this._registry = new Registry();
    }
    register(token, providerOrConstructor, options = { lifecycle: Lifecycle.Transient }) {
        let provider;
        if (!isProvider(providerOrConstructor)) {
            provider = { useClass: providerOrConstructor };
        }
        else {
            provider = providerOrConstructor;
        }
        if (options.lifecycle === Lifecycle.Singleton ||
            options.lifecycle == Lifecycle.ContainerScoped ||
            options.lifecycle == Lifecycle.ResolutionScoped) {
            if (isValueProvider(provider) || isFactoryProvider(provider)) {
                throw `Cannot use lifecycle "${Lifecycle[options.lifecycle]}" with ValueProviders or FactoryProviders`;
            }
        }
        this._registry.set(token, { provider, options });
        return this;
    }
    registerType(from, to) {
        if (isNormalToken(to)) {
            return this.register(from, {
                useToken: to
            });
        }
        return this.register(from, {
            useClass: to
        });
    }
    registerInstance(token, instance) {
        return this.register(token, {
            useValue: instance
        });
    }
    registerSingleton(from, to) {
        if (isNormalToken(from)) {
            if (isNormalToken(to)) {
                return this.register(from, {
                    useToken: to
                }, { lifecycle: Lifecycle.Singleton });
            }
            else if (to) {
                return this.register(from, {
                    useClass: to
                }, { lifecycle: Lifecycle.Singleton });
            }
            throw "Cannot register a type name as a singleton without a \"to\" token";
        }
        let useClass = from;
        if (to && !isNormalToken(to)) {
            useClass = to;
        }
        return this.register(from, {
            useClass
        }, { lifecycle: Lifecycle.Singleton });
    }
    resolve(token, context = new ResolutionContext()) {
        const registration = this.getRegistration(token);
        if (!registration && isNormalToken(token)) {
            throw `Attempted to resolve unregistered dependency token: ${token.toString()}`;
        }
        if (registration) {
            return this.resolveRegistration(registration, context);
        }
        return this.construct(token, context);
    }
    resolveRegistration(registration, context) {
        if (registration.options.lifecycle === Lifecycle.ResolutionScoped &&
            context.scopedResolutions.has(registration)) {
            return context.scopedResolutions.get(registration);
        }
        const isSingleton = registration.options.lifecycle === Lifecycle.Singleton;
        const isContainerScoped = registration.options.lifecycle === Lifecycle.ContainerScoped;
        const returnInstance = isSingleton || isContainerScoped;
        let resolved;
        if (isValueProvider(registration.provider)) {
            resolved = registration.provider.useValue;
        }
        else if (isTokenProvider(registration.provider)) {
            resolved = returnInstance
                ? registration.instance ||
                    (registration.instance = this.resolve(registration.provider.useToken, context))
                : this.resolve(registration.provider.useToken, context);
        }
        else if (isClassProvider(registration.provider)) {
            resolved = returnInstance
                ? registration.instance ||
                    (registration.instance = this.construct(registration.provider.useClass, context))
                : this.construct(registration.provider.useClass, context);
        }
        else if (isFactoryProvider(registration.provider)) {
            resolved = registration.provider.useFactory(this);
        }
        else {
            resolved = this.construct(registration.provider, context);
        }
        if (registration.options.lifecycle === Lifecycle.ResolutionScoped) {
            context.scopedResolutions.set(registration, resolved);
        }
        return resolved;
    }
    resolveAll(token, context = new ResolutionContext()) {
        const registrations = this.getAllRegistrations(token);
        if (!registrations && isNormalToken(token)) {
            throw `Attempted to resolve unregistered dependency token: ${token.toString()}`;
        }
        if (registrations) {
            return registrations.map(item => this.resolveRegistration(item, context));
        }
        return [this.construct(token, context)];
    }
    isRegistered(token, recursive = false) {
        return (this._registry.has(token) ||
            (recursive &&
                (this.parent || false) &&
                this.parent.isRegistered(token, true)));
    }
    reset() {
        this._registry.clear();
    }
    createChildContainer() {
        const childContainer = new InternalDependencyContainer(this);
        for (const [token, registrations] of this._registry.entries()) {
            if (registrations.some(({ options }) => options.lifecycle === Lifecycle.ContainerScoped)) {
                childContainer._registry.setAll(token, registrations.map(registration => {
                    if (registration.options.lifecycle === Lifecycle.ContainerScoped) {
                        return {
                            provider: registration.provider,
                            options: registration.options
                        };
                    }
                    return registration;
                }));
            }
        }
        return childContainer;
    }
    getRegistration(token) {
        if (this.isRegistered(token)) {
            return this._registry.get(token);
        }
        if (this.parent) {
            return this.parent.getRegistration(token);
        }
        return null;
    }
    getAllRegistrations(token) {
        if (this.isRegistered(token)) {
            return this._registry.getAll(token);
        }
        if (this.parent) {
            return this.parent.getAllRegistrations(token);
        }
        return null;
    }
    construct(ctor, context) {
        if (ctor.length === 0) {
            return new ctor();
        }
        const paramInfo = typeInfo.get(ctor);
        if (!paramInfo || paramInfo.length === 0) {
            throw `TypeInfo not known for ${ctor}`;
        }
        const params = paramInfo.map(param => {
            if (isTokenDescriptor(param)) {
                return param.multiple
                    ? this.resolveAll(param.token)
                    : this.resolve(param.token, context);
            }
            return this.resolve(param, context);
        });
        return new ctor(...params);
    }
}
export const instance = new InternalDependencyContainer();
export default instance;
