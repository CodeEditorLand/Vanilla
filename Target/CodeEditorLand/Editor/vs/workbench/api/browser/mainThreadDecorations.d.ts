import { UriComponents } from "vs/base/common/uri";
import { IDecorationsService } from "vs/workbench/services/decorations/common/decorations";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { MainThreadDecorationsShape } from "../common/extHost.protocol";
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
