import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IMarkdownString } from "vs/base/common/htmlContent";
import { URI, UriComponents } from "vs/base/common/uri";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { ExtHostCommands } from "vs/workbench/api/common/extHostCommands";
import { ExtHostDocuments } from "vs/workbench/api/common/extHostDocuments";
import type * as vscode from "vscode";
import { ExtHostSCMShape, IMainContext, MainThreadSCMShape, SCMHistoryItemChangeDto, SCMHistoryItemDto } from "./extHost.protocol";
export interface IValidateInput {
    (value: string, cursorPosition: number): vscode.ProviderResult<vscode.SourceControlInputBoxValidation | undefined | null>;
}
export declare class ExtHostSCMInputBox implements vscode.SourceControlInputBox {
    #private;
    private _extension;
    private _sourceControlHandle;
    private _documentUri;
    private _value;
    get value(): string;
    set value(value: string);
    private readonly _onDidChange;
    get onDidChange(): Event<string>;
    private _placeholder;
    get placeholder(): string;
    set placeholder(placeholder: string);
    private _validateInput;
    get validateInput(): IValidateInput | undefined;
    set validateInput(fn: IValidateInput | undefined);
    private _enabled;
    get enabled(): boolean;
    set enabled(enabled: boolean);
    private _visible;
    get visible(): boolean;
    set visible(visible: boolean);
    get document(): vscode.TextDocument;
    constructor(_extension: IExtensionDescription, _extHostDocuments: ExtHostDocuments, proxy: MainThreadSCMShape, _sourceControlHandle: number, _documentUri: URI);
    showValidationMessage(message: string | vscode.MarkdownString, type: vscode.SourceControlInputBoxValidationType): void;
    $onInputBoxValueChange(value: string): void;
    private updateValue;
}
export declare class ExtHostSCM implements ExtHostSCMShape {
    private _commands;
    private _extHostDocuments;
    private readonly logService;
    private static _handlePool;
    private _proxy;
    private readonly _telemetry;
    private _sourceControls;
    private _sourceControlsByExtension;
    private readonly _onDidChangeActiveProvider;
    get onDidChangeActiveProvider(): Event<vscode.SourceControl>;
    private _selectedSourceControlHandle;
    constructor(mainContext: IMainContext, _commands: ExtHostCommands, _extHostDocuments: ExtHostDocuments, logService: ILogService);
    createSourceControl(extension: IExtensionDescription, id: string, label: string, rootUri: vscode.Uri | undefined): vscode.SourceControl;
    getLastInputBox(extension: IExtensionDescription): ExtHostSCMInputBox | undefined;
    $provideOriginalResource(sourceControlHandle: number, uriComponents: UriComponents, token: CancellationToken): Promise<UriComponents | null>;
    $onInputBoxValueChange(sourceControlHandle: number, value: string): Promise<void>;
    $executeResourceCommand(sourceControlHandle: number, groupHandle: number, handle: number, preserveFocus: boolean): Promise<void>;
    $validateInput(sourceControlHandle: number, value: string, cursorPosition: number): Promise<[string | IMarkdownString, number] | undefined>;
    $setSelectedSourceControl(selectedSourceControlHandle: number | undefined): Promise<void>;
    $resolveHistoryItemGroupCommonAncestor(sourceControlHandle: number, historyItemGroupId1: string, historyItemGroupId2: string | undefined, token: CancellationToken): Promise<{
        id: string;
        ahead: number;
        behind: number;
    } | undefined>;
    $resolveHistoryItemGroupCommonAncestor2(sourceControlHandle: number, historyItemGroupIds: string[], token: CancellationToken): Promise<string | undefined>;
    $provideHistoryItems(sourceControlHandle: number, historyItemGroupId: string, options: any, token: CancellationToken): Promise<SCMHistoryItemDto[] | undefined>;
    $provideHistoryItems2(sourceControlHandle: number, options: any, token: CancellationToken): Promise<SCMHistoryItemDto[] | undefined>;
    $provideHistoryItemSummary(sourceControlHandle: number, historyItemId: string, historyItemParentId: string | undefined, token: CancellationToken): Promise<SCMHistoryItemDto | undefined>;
    $provideHistoryItemChanges(sourceControlHandle: number, historyItemId: string, historyItemParentId: string | undefined, token: CancellationToken): Promise<SCMHistoryItemChangeDto[] | undefined>;
}
