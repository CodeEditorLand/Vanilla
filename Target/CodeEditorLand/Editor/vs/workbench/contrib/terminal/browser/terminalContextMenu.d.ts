import { ActionRunner, IAction } from "vs/base/common/actions";
import { SingleOrMany } from "vs/base/common/types";
import { IMenu } from "vs/platform/actions/common/actions";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
import { ISerializedTerminalInstanceContext } from "vs/workbench/contrib/terminal/common/terminal";
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
