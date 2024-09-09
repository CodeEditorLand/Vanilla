import { DisposableStore } from '../../../base/common/lifecycle.js';
import { SyncDescriptor0 } from './descriptors.js';
import { Graph } from './graph.js';
import { GetLeadingNonServiceArgs, IInstantiationService, ServiceIdentifier, ServicesAccessor } from './instantiation.js';
import { ServiceCollection } from './serviceCollection.js';
export declare class InstantiationService implements IInstantiationService {
    private readonly _services;
    private readonly _strict;
    private readonly _parent?;
    private readonly _enableTracing;
    readonly _serviceBrand: undefined;
    readonly _globalGraph?: Graph<string>;
    private _globalGraphImplicitDependency?;
    private _isDisposed;
    private readonly _servicesToMaybeDispose;
    private readonly _children;
    constructor(_services?: ServiceCollection, _strict?: boolean, _parent?: InstantiationService | undefined, _enableTracing?: boolean);
    dispose(): void;
    private _throwIfDisposed;
    createChild(services: ServiceCollection, store?: DisposableStore): IInstantiationService;
    invokeFunction<R, TS extends any[] = []>(fn: (accessor: ServicesAccessor, ...args: TS) => R, ...args: TS): R;
    createInstance<T>(descriptor: SyncDescriptor0<T>): T;
    createInstance<Ctor extends new (...args: any[]) => any, R extends InstanceType<Ctor>>(ctor: Ctor, ...args: GetLeadingNonServiceArgs<ConstructorParameters<Ctor>>): R;
    private _createInstance;
    private _setCreatedServiceInstance;
    private _getServiceInstanceOrDescriptor;
    protected _getOrCreateServiceInstance<T>(id: ServiceIdentifier<T>, _trace: Trace): T;
    private readonly _activeInstantiations;
    private _safeCreateAndCacheServiceInstance;
    private _createAndCacheServiceInstance;
    private _createServiceInstanceWithOwner;
    private _createServiceInstance;
    private _throwIfStrict;
}
declare const enum TraceType {
    None = 0,
    Creation = 1,
    Invocation = 2,
    Branch = 3
}
export declare class Trace {
    readonly type: TraceType;
    readonly name: string | null;
    static all: Set<string>;
    private static readonly _None;
    static traceInvocation(_enableTracing: boolean, ctor: any): Trace;
    static traceCreation(_enableTracing: boolean, ctor: any): Trace;
    private static _totals;
    private readonly _start;
    private readonly _dep;
    private constructor();
    branch(id: ServiceIdentifier<any>, first: boolean): Trace;
    stop(): void;
}
export {};
