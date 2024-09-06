import { CancellationToken } from "vs/base/common/cancellation";
import { UriComponents } from "vs/base/common/uri";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ISaveProfileResult } from "vs/workbench/services/userDataProfile/common/userDataProfile";
import type * as vscode from "vscode";
import { ExtHostProfileContentHandlersShape, IMainContext } from "./extHost.protocol";
export declare class ExtHostProfileContentHandlers implements ExtHostProfileContentHandlersShape {
    private readonly proxy;
    private readonly handlers;
    constructor(mainContext: IMainContext);
    registerProfileContentHandler(extension: IExtensionDescription, id: string, handler: vscode.ProfileContentHandler): vscode.Disposable;
    $saveProfile(id: string, name: string, content: string, token: CancellationToken): Promise<ISaveProfileResult | null>;
    $readProfile(id: string, idOrUri: string | UriComponents, token: CancellationToken): Promise<string | null>;
}
