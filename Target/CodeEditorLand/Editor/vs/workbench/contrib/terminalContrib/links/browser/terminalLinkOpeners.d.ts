import { OperatingSystem } from "../../../../../base/common/platform.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { type ITerminalCapabilityStore } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../../services/environment/common/environmentService.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { QueryBuilder } from "../../../../services/search/common/queryBuilder.js";
import { ISearchService } from "../../../../services/search/common/search.js";
import type { ITerminalLinkOpener, ITerminalSimpleLink } from "./links.js";
export declare class TerminalLocalFileLinkOpener implements ITerminalLinkOpener {
    private readonly _editorService;
    constructor(_editorService: IEditorService);
    open(link: ITerminalSimpleLink): Promise<void>;
}
export declare class TerminalLocalFolderInWorkspaceLinkOpener implements ITerminalLinkOpener {
    private readonly _commandService;
    constructor(_commandService: ICommandService);
    open(link: ITerminalSimpleLink): Promise<void>;
}
export declare class TerminalLocalFolderOutsideWorkspaceLinkOpener implements ITerminalLinkOpener {
    private readonly _hostService;
    constructor(_hostService: IHostService);
    open(link: ITerminalSimpleLink): Promise<void>;
}
export declare class TerminalSearchLinkOpener implements ITerminalLinkOpener {
    private readonly _capabilities;
    private readonly _initialCwd;
    private readonly _localFileOpener;
    private readonly _localFolderInWorkspaceOpener;
    private readonly _getOS;
    private readonly _fileService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _quickInputService;
    private readonly _searchService;
    private readonly _workspaceContextService;
    private readonly _workbenchEnvironmentService;
    protected _fileQueryBuilder: QueryBuilder;
    constructor(_capabilities: ITerminalCapabilityStore, _initialCwd: string, _localFileOpener: TerminalLocalFileLinkOpener, _localFolderInWorkspaceOpener: TerminalLocalFolderInWorkspaceLinkOpener, _getOS: () => OperatingSystem, _fileService: IFileService, _instantiationService: IInstantiationService, _logService: ITerminalLogService, _quickInputService: IQuickInputService, _searchService: ISearchService, _workspaceContextService: IWorkspaceContextService, _workbenchEnvironmentService: IWorkbenchEnvironmentService);
    open(link: ITerminalSimpleLink): Promise<void>;
    private _getExactMatch;
    private _tryOpenExactLink;
}
export declare class TerminalUrlLinkOpener implements ITerminalLinkOpener {
    private readonly _isRemote;
    private readonly _openerService;
    private readonly _configurationService;
    constructor(_isRemote: boolean, _openerService: IOpenerService, _configurationService: IConfigurationService);
    open(link: ITerminalSimpleLink): Promise<void>;
}
