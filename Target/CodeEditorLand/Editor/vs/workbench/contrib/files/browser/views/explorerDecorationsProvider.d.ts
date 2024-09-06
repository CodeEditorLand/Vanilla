import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IExplorerService } from "vs/workbench/contrib/files/browser/files";
import { ExplorerItem } from "vs/workbench/contrib/files/common/explorerModel";
import { IDecorationData, IDecorationsProvider } from "vs/workbench/services/decorations/common/decorations";
export declare function provideDecorations(fileStat: ExplorerItem): IDecorationData | undefined;
export declare class ExplorerDecorationsProvider implements IDecorationsProvider {
    private explorerService;
    readonly label: string;
    private readonly _onDidChange;
    private readonly toDispose;
    constructor(explorerService: IExplorerService, contextService: IWorkspaceContextService);
    get onDidChange(): Event<URI[]>;
    provideDecorations(resource: URI): Promise<IDecorationData | undefined>;
    dispose(): void;
}
