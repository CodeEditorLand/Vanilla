import { Disposable } from "vs/base/common/lifecycle";
import { IRange } from "vs/editor/common/core/range";
import { Command } from "vs/editor/common/languages";
import { Action2 } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { IChatWidget } from "vs/workbench/contrib/chat/browser/chat";
import { IChatWidgetContrib } from "vs/workbench/contrib/chat/browser/chatWidget";
import { IChatRequestVariableValue, IDynamicVariable } from "vs/workbench/contrib/chat/common/chatVariables";
export declare const dynamicVariableDecorationType = "chat-dynamic-variable";
export declare class ChatDynamicVariableModel extends Disposable implements IChatWidgetContrib {
    private readonly widget;
    private readonly labelService;
    static readonly ID = "chatDynamicVariableModel";
    private _variables;
    get variables(): ReadonlyArray<IDynamicVariable>;
    get id(): string;
    constructor(widget: IChatWidget, labelService: ILabelService);
    getInputState(): any;
    setInputState(s: any): void;
    addReference(ref: IDynamicVariable): void;
    private updateDecorations;
    private getHoverForReference;
}
export declare class SelectAndInsertFileAction extends Action2 {
    static readonly Name = "files";
    static readonly Item: {
        label: any;
        description: any;
    };
    static readonly ID = "workbench.action.chat.selectAndInsertFile";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
export interface IAddDynamicVariableContext {
    id: string;
    widget: IChatWidget;
    range: IRange;
    variableData: IChatRequestVariableValue;
    command?: Command;
}
export declare class AddDynamicVariableAction extends Action2 {
    static readonly ID = "workbench.action.chat.addDynamicVariable";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
