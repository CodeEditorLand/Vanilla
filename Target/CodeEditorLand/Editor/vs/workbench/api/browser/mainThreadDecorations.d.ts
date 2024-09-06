import { UriComponents } from "../../../base/common/uri.js";
import { IDecorationsService } from "../../services/decorations/common/decorations.js";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadDecorationsShape } from "../common/extHost.protocol.js";
export declare class MainThreadDecorations implements MainThreadDecorationsShape {
    private readonly _decorationsService;
    private readonly _provider;
    private readonly _proxy;
    constructor(context: IExtHostContext, _decorationsService: IDecorationsService);
    dispose(): void;
    $registerDecorationProvider(handle: number, label: string): void;
    $onDidChange(handle: number, resources: UriComponents[]): void;
    $unregisterDecorationProvider(handle: number): void;
}
