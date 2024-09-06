import { IDisposable } from "vs/base/common/lifecycle";
import { UriComponents } from "vs/base/common/uri";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { ExtHostTimelineShape, IMainContext } from "vs/workbench/api/common/extHost.protocol";
import { CommandsConverter, ExtHostCommands } from "vs/workbench/api/common/extHostCommands";
import { Timeline } from "vs/workbench/contrib/timeline/common/timeline";
import * as vscode from "vscode";
export interface IExtHostTimeline extends ExtHostTimelineShape {
    readonly _serviceBrand: undefined;
    $getTimeline(id: string, uri: UriComponents, options: vscode.TimelineOptions, token: vscode.CancellationToken): Promise<Timeline | undefined>;
}
export declare const IExtHostTimeline: any;
export declare class ExtHostTimeline implements IExtHostTimeline {
    readonly _serviceBrand: undefined;
    private _proxy;
    private _providers;
    private _itemsBySourceAndUriMap;
    constructor(mainContext: IMainContext, commands: ExtHostCommands);
    $getTimeline(id: string, uri: UriComponents, options: vscode.TimelineOptions, token: vscode.CancellationToken): Promise<Timeline | undefined>;
    registerTimelineProvider(scheme: string | string[], provider: vscode.TimelineProvider, extensionId: ExtensionIdentifier, commandConverter: CommandsConverter): IDisposable;
    private convertTimelineItem;
    private registerTimelineProviderCore;
}
