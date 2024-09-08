import type * as vscode from "vscode";
import type { CancellationToken } from "../../../base/common/cancellation.js";
import { type UriComponents } from "../../../base/common/uri.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import type { ISaveProfileResult } from "../../services/userDataProfile/common/userDataProfile.js";
import { type ExtHostProfileContentHandlersShape, type IMainContext } from "./extHost.protocol.js";
export declare class ExtHostProfileContentHandlers implements ExtHostProfileContentHandlersShape {
    private readonly proxy;
    private readonly handlers;
    constructor(mainContext: IMainContext);
    registerProfileContentHandler(extension: IExtensionDescription, id: string, handler: vscode.ProfileContentHandler): vscode.Disposable;
    $saveProfile(id: string, name: string, content: string, token: CancellationToken): Promise<ISaveProfileResult | null>;
    $readProfile(id: string, idOrUri: string | UriComponents, token: CancellationToken): Promise<string | null>;
}
