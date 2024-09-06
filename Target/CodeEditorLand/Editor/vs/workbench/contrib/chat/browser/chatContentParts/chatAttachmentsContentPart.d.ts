import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IChatRequestVariableEntry } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatContentReference } from "vs/workbench/contrib/chat/common/chatService";
export declare class ChatAttachmentsContentPart extends Disposable {
    private readonly variables;
    private readonly contentReferences;
    readonly domNode: HTMLElement;
    private readonly instantiationService;
    private readonly openerService;
    private readonly attachedContextDisposables;
    private readonly _onDidChangeVisibility;
    private readonly _contextResourceLabels;
    constructor(variables: IChatRequestVariableEntry[], contentReferences: ReadonlyArray<IChatContentReference>, domNode: HTMLElement, instantiationService: IInstantiationService, openerService: IOpenerService);
    private initAttachedContext;
}
