import { Event, type IDynamicListEventMultiplexer } from "../../../../base/common/event.js";
import type { ITerminalCapabilityImplMap, TerminalCapability } from "../../../../platform/terminal/common/capabilities/capabilities.js";
import type { ITerminalInstance } from "./terminal.js";
export declare function createInstanceCapabilityEventMultiplexer<T extends TerminalCapability, K>(currentInstances: ITerminalInstance[], onAddInstance: Event<ITerminalInstance>, onRemoveInstance: Event<ITerminalInstance>, capabilityId: T, getEvent: (capability: ITerminalCapabilityImplMap[T]) => Event<K>): IDynamicListEventMultiplexer<{
    instance: ITerminalInstance;
    data: K;
}>;
