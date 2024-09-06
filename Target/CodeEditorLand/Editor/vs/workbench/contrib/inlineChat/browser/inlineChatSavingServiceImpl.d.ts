import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ILogService } from "vs/platform/log/common/log";
import { Session } from "vs/workbench/contrib/inlineChat/browser/inlineChatSession";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
import { IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService";
import { IInlineChatSavingService } from "./inlineChatSavingService";
import { IInlineChatSessionService } from "./inlineChatSessionService";
export declare class InlineChatSavingServiceImpl implements IInlineChatSavingService {
    private readonly _fileConfigService;
    private readonly _editorGroupService;
    private readonly _textFileService;
    private readonly _editorService;
    private readonly _inlineChatSessionService;
    private readonly _configService;
    private readonly _workingCopyFileService;
    private readonly _logService;
    readonly _serviceBrand: undefined;
    private readonly _store;
    private readonly _saveParticipant;
    private readonly _sessionData;
    constructor(_fileConfigService: IFilesConfigurationService, _editorGroupService: IEditorGroupsService, _textFileService: ITextFileService, _editorService: IEditorService, _inlineChatSessionService: IInlineChatSessionService, _configService: IConfigurationService, _workingCopyFileService: IWorkingCopyFileService, _logService: ILogService);
    dispose(): void;
    markChanged(session: Session): void;
    private _installSaveParticpant;
    private _participate;
    private _getGroupsAndOrphans;
    private _openAndWait;
    private _whenSessionsEnded;
}