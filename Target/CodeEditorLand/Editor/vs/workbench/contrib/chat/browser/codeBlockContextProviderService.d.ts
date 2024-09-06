import { IDisposable } from "vs/base/common/lifecycle";
import { IChatCodeBlockContextProviderService, ICodeBlockActionContextProvider } from "vs/workbench/contrib/chat/browser/chat";
export declare class ChatCodeBlockContextProviderService implements IChatCodeBlockContextProviderService {
    _serviceBrand: undefined;
    private readonly _providers;
    get providers(): ICodeBlockActionContextProvider[];
    registerProvider(provider: ICodeBlockActionContextProvider, id: string): IDisposable;
}
