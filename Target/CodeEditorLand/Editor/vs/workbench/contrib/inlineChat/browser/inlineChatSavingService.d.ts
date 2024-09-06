import { Session } from "vs/workbench/contrib/inlineChat/browser/inlineChatSession";
export declare const IInlineChatSavingService: any;
export interface IInlineChatSavingService {
    _serviceBrand: undefined;
    markChanged(session: Session): void;
}
