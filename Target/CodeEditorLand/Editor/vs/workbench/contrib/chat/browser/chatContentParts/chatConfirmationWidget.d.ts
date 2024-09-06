import "vs/css!./media/chatConfirmationWidget";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export interface IChatConfirmationButton {
    label: string;
    isSecondary?: boolean;
    data: any;
}
export declare class ChatConfirmationWidget extends Disposable {
    private readonly instantiationService;
    private _onDidClick;
    get onDidClick(): Event<IChatConfirmationButton>;
    private _domNode;
    get domNode(): HTMLElement;
    setShowButtons(showButton: boolean): void;
    constructor(title: string, message: string, buttons: IChatConfirmationButton[], instantiationService: IInstantiationService);
}
