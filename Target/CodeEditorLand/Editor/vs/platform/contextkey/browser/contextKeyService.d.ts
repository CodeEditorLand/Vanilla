import { Iterable } from "vs/base/common/iterator";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ContextKeyExpression, ContextKeyValue, IContext, IContextKey, IContextKeyService, IContextKeyServiceTarget, IScopedContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class Context implements IContext {
    protected _parent: Context | null;
    protected _value: Record<string, any>;
    protected _id: number;
    constructor(id: number, parent: Context | null);
    get value(): Record<string, any>;
    setValue(key: string, value: any): boolean;
    removeValue(key: string): boolean;
    getValue<T>(key: string): T | undefined;
    updateParent(parent: Context): void;
    collectAllValues(): Record<string, any>;
}
export declare abstract class AbstractContextKeyService extends Disposable implements IContextKeyService {
    _serviceBrand: undefined;
    protected _isDisposed: boolean;
    protected _myContextId: number;
    protected _onDidChangeContext: any;
    readonly onDidChangeContext: any;
    constructor(myContextId: number);
    get contextId(): number;
    createKey<T extends ContextKeyValue>(key: string, defaultValue: T | undefined): IContextKey<T>;
    bufferChangeEvents(callback: Function): void;
    createScoped(domNode: IContextKeyServiceTarget): IScopedContextKeyService;
    createOverlay(overlay?: Iterable<[string, any]>): IContextKeyService;
    contextMatchesRules(rules: ContextKeyExpression | undefined): boolean;
    getContextKeyValue<T>(key: string): T | undefined;
    setContext(key: string, value: any): void;
    removeContext(key: string): void;
    getContext(target: IContextKeyServiceTarget | null): IContext;
    abstract getContextValuesContainer(contextId: number): Context;
    abstract createChildContext(parentContextId?: number): number;
    abstract disposeContext(contextId: number): void;
    abstract updateParent(parentContextKeyService?: IContextKeyService): void;
    dispose(): void;
}
export declare class ContextKeyService extends AbstractContextKeyService implements IContextKeyService {
    private _lastContextId;
    private readonly _contexts;
    constructor(configurationService: IConfigurationService);
    getContextValuesContainer(contextId: number): Context;
    createChildContext(parentContextId?: number): number;
    disposeContext(contextId: number): void;
    updateParent(_parentContextKeyService: IContextKeyService): void;
}
export declare function setContext(accessor: ServicesAccessor, contextKey: any, contextValue: any): void;