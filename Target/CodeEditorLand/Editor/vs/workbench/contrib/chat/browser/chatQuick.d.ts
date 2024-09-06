import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { IQuickChatOpenOptions, IQuickChatService } from "vs/workbench/contrib/chat/browser/chat";
import { IChatService } from "vs/workbench/contrib/chat/common/chatService";
export declare class QuickChatService extends Disposable implements IQuickChatService {
    private readonly quickInputService;
    private readonly chatService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    private readonly _onDidClose;
    readonly onDidClose: any;
    private _input;
    private _currentChat;
    private _container;
    constructor(quickInputService: IQuickInputService, chatService: IChatService, instantiationService: IInstantiationService);
    get enabled(): boolean;
    get focused(): boolean;
    toggle(options?: IQuickChatOpenOptions): void;
    open(options?: IQuickChatOpenOptions): void;
    focus(): void;
    close(): void;
    openInChatView(): Promise<void>;
}
