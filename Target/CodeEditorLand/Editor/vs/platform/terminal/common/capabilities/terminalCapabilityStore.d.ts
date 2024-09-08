import { Disposable } from "../../../../base/common/lifecycle.js";
import type { ITerminalCapabilityImplMap, ITerminalCapabilityStore, TerminalCapability, TerminalCapabilityChangeEvent } from "./capabilities.js";
export declare class TerminalCapabilityStore extends Disposable implements ITerminalCapabilityStore {
    private _map;
    private readonly _onDidRemoveCapabilityType;
    readonly onDidRemoveCapabilityType: import("../../../../base/common/event.js").Event<TerminalCapability>;
    private readonly _onDidAddCapabilityType;
    readonly onDidAddCapabilityType: import("../../../../base/common/event.js").Event<TerminalCapability>;
    private readonly _onDidRemoveCapability;
    readonly onDidRemoveCapability: import("../../../../base/common/event.js").Event<TerminalCapabilityChangeEvent<any>>;
    private readonly _onDidAddCapability;
    readonly onDidAddCapability: import("../../../../base/common/event.js").Event<TerminalCapabilityChangeEvent<any>>;
    get items(): IterableIterator<TerminalCapability>;
    add<T extends TerminalCapability>(capability: T, impl: ITerminalCapabilityImplMap[T]): void;
    get<T extends TerminalCapability>(capability: T): ITerminalCapabilityImplMap[T] | undefined;
    remove(capability: TerminalCapability): void;
    has(capability: TerminalCapability): boolean;
}
export declare class TerminalCapabilityStoreMultiplexer extends Disposable implements ITerminalCapabilityStore {
    readonly _stores: ITerminalCapabilityStore[];
    private readonly _onDidRemoveCapabilityType;
    readonly onDidRemoveCapabilityType: import("../../../../base/common/event.js").Event<TerminalCapability>;
    private readonly _onDidAddCapabilityType;
    readonly onDidAddCapabilityType: import("../../../../base/common/event.js").Event<TerminalCapability>;
    private readonly _onDidRemoveCapability;
    readonly onDidRemoveCapability: import("../../../../base/common/event.js").Event<TerminalCapabilityChangeEvent<any>>;
    private readonly _onDidAddCapability;
    readonly onDidAddCapability: import("../../../../base/common/event.js").Event<TerminalCapabilityChangeEvent<any>>;
    get items(): IterableIterator<TerminalCapability>;
    private _items;
    has(capability: TerminalCapability): boolean;
    get<T extends TerminalCapability>(capability: T): ITerminalCapabilityImplMap[T] | undefined;
    add(store: ITerminalCapabilityStore): void;
}
