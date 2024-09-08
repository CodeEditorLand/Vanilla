import { ActionRunner, type IAction } from "../../../../base/common/actions.js";
import type { SingleOrMany } from "../../../../base/common/types.js";
import type { IMenu } from "../../../../platform/actions/common/actions.js";
import type { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import type { ISerializedTerminalInstanceContext } from "../common/terminal.js";
import type { ITerminalInstance } from "./terminal.js";
/**
 * A context that is passed to actions as arguments to represent the terminal instance(s) being
 * acted upon.
 */
export declare class InstanceContext {
    readonly instanceId: number;
    constructor(instance: ITerminalInstance);
    toJSON(): ISerializedTerminalInstanceContext;
}
export declare class TerminalContextActionRunner extends ActionRunner {
    protected runAction(action: IAction, context?: InstanceContext | InstanceContext[]): Promise<void>;
}
export declare function openContextMenu(targetWindow: Window, event: MouseEvent, contextInstances: SingleOrMany<ITerminalInstance> | undefined, menu: IMenu, contextMenuService: IContextMenuService, extraActions?: IAction[]): void;
