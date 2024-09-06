import { Event } from "vs/base/common/event";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ExtHostSecretState } from "vs/workbench/api/common/extHostSecretState";
import type * as vscode from "vscode";
export declare class ExtensionSecrets implements vscode.SecretStorage {
    #private;
    protected readonly _id: string;
    readonly onDidChange: Event<vscode.SecretStorageChangeEvent>;
    readonly disposables: any;
    constructor(extensionDescription: IExtensionDescription, secretState: ExtHostSecretState);
    dispose(): void;
    get(key: string): Promise<string | undefined>;
    store(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
