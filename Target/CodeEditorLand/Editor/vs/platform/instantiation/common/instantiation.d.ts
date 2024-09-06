import { DisposableStore } from "../../../base/common/lifecycle.js";
import * as descriptors from "./descriptors.js";
import { ServiceCollection } from "./serviceCollection.js";
export declare namespace _util {
    const serviceIds: Map<string, ServiceIdentifier<any>>;
    const DI_TARGET = "$di$target";
    const DI_DEPENDENCIES = "$di$dependencies";
    function getServiceDependencies(ctor: any): {
        id: ServiceIdentifier<any>;
        index: number;
    }[];
}
export type BrandedService = {
    _serviceBrand: undefined;
};
export interface IConstructorSignature<T, Args extends any[] = []> {
    new <Services extends BrandedService[]>(...args: [...Args, ...Services]): T;
}
export interface ServicesAccessor {
    get<T>(id: ServiceIdentifier<T>): T;
}
export declare const IInstantiationService: ServiceIdentifier<IInstantiationService>;
/**
 * Given a list of arguments as a tuple, attempt to extract the leading, non-service arguments
 * to their own tuple.
 */
export type GetLeadingNonServiceArgs<TArgs extends any[]> = TArgs extends [] ? [] : TArgs extends [...infer TFirst, BrandedService] ? GetLeadingNonServiceArgs<TFirst> : TArgs;
export interface IInstantiationService {
    readonly _serviceBrand: undefined;
    /**
     * Synchronously creates an instance that is denoted by the descriptor
     */
    createInstance<T>(descriptor: descriptors.SyncDescriptor0<T>): T;
    createInstance<Ctor extends new (...args: any[]) => any, R extends InstanceType<Ctor>>(ctor: Ctor, ...args: GetLeadingNonServiceArgs<ConstructorParameters<Ctor>>): R;
    /**
     * Calls a function with a service accessor.
     */
    invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R;
    /**
     * Creates a child of this service which inherits all current services
     * and adds/overwrites the given services.
     *
     * NOTE that the returned child is `disposable` and should be disposed when not used
     * anymore. This will also dispose all the services that this service has created.
     */
    createChild(services: ServiceCollection, store?: DisposableStore): IInstantiationService;
    /**
     * Disposes this instantiation service.
     *
     * - Will dispose all services that this instantiation service has created.
     * - Will dispose all its children but not its parent.
     * - Will NOT dispose services-instances that this service has been created with
     * - Will NOT dispose consumer-instances this service has created
     */
    dispose(): void;
}
/**
 * Identifies a service of type `T`.
 */
export interface ServiceIdentifier<T> {
    (...args: any[]): void;
    type: T;
}
/**
 * The *only* valid way to create a {{ServiceIdentifier}}.
 */
export declare function createDecorator<T>(serviceId: string): ServiceIdentifier<T>;
export declare function refineServiceDecorator<T1, T extends T1>(serviceIdentifier: ServiceIdentifier<T1>): ServiceIdentifier<T>;
