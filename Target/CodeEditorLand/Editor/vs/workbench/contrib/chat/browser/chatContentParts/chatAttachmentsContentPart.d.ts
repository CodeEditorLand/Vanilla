import { Disposable } from '../../../../../base/common/lifecycle.js';
import { IChatRequestVariableEntry } from '../../common/chatModel.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatContentReference } from '../../common/chatService.js';
import { IOpenerService } from '../../../../../platform/opener/common/opener.js';
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
