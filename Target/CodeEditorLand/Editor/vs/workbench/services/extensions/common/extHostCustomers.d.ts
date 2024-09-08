import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { BrandedService, IConstructorSignature } from "../../../../platform/instantiation/common/instantiation.js";
import type { ExtensionHostKind } from "./extensionHostKind.js";
import type { IExtensionHostProxy } from "./extensionHostProxy.js";
import type { IInternalExtensionService } from "./extensions.js";
import type { IRPCProtocol, ProxyIdentifier } from "./proxyIdentifier.js";
export interface IExtHostContext extends IRPCProtocol {
    readonly remoteAuthority: string | null;
    readonly extensionHostKind: ExtensionHostKind;
}
export interface IInternalExtHostContext extends IExtHostContext {
    readonly internalExtensionService: IInternalExtensionService;
    _setExtensionHostProxy(extensionHostProxy: IExtensionHostProxy): void;
    _setAllMainProxyIdentifiers(mainProxyIdentifiers: ProxyIdentifier<any>[]): void;
}
export type IExtHostNamedCustomer<T extends IDisposable> = [
    ProxyIdentifier<T>,
    IExtHostCustomerCtor<T>
];
export type IExtHostCustomerCtor<T extends IDisposable> = IConstructorSignature<T, [
    IExtHostContext
]>;
export declare function extHostNamedCustomer<T extends IDisposable>(id: ProxyIdentifier<T>): <Services extends BrandedService[]>(ctor: {
    new (context: IExtHostContext, ...services: Services): T;
}) => void;
export declare function extHostCustomer<T extends IDisposable, Services extends BrandedService[]>(ctor: {
    new (context: IExtHostContext, ...services: Services): T;
}): void;
export declare namespace ExtHostCustomersRegistry {
    function getNamedCustomers(): IExtHostNamedCustomer<IDisposable>[];
    function getCustomers(): IExtHostCustomerCtor<IDisposable>[];
}
