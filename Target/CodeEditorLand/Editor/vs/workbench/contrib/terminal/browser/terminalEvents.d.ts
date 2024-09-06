import { Event, IDynamicListEventMultiplexer } from "vs/base/common/event";
import { ITerminalCapabilityImplMap, TerminalCapability } from "vs/platform/terminal/common/capabilities/capabilities";
import { ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
export declare function createInstanceCapabilityEventMultiplexer<T extends TerminalCapability, K>(currentInstances: ITerminalInstance[], onAddInstance: Event<ITerminalInstance>, onRemoveInstance: Event<ITerminalInstance>, capabilityId: T, getEvent: (capability: ITerminalCapabilityImplMap[T]) => Event<K>): IDynamicListEventMultiplexer<{
    instance: ITerminalInstance;
    data: K;
}>;
