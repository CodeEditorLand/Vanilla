import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
import { IPreferencesService } from "vs/workbench/services/preferences/common/preferences";
import { ITextEditorService } from "vs/workbench/services/textfile/common/textEditorService";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class PreferencesContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly preferencesService;
    private readonly userDataProfileService;
    private readonly workspaceService;
    private readonly configurationService;
    private readonly editorResolverService;
    private readonly textEditorService;
    static readonly ID = "workbench.contrib.preferences";
    private editorOpeningListener;
    constructor(fileService: IFileService, instantiationService: IInstantiationService, preferencesService: IPreferencesService, userDataProfileService: IUserDataProfileService, workspaceService: IWorkspaceContextService, configurationService: IConfigurationService, editorResolverService: IEditorResolverService, textEditorService: ITextEditorService);
    private handleSettingsEditorRegistration;
    dispose(): void;
}
