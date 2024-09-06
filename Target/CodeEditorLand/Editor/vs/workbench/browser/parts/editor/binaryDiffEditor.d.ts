import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { SideBySideEditor } from "vs/workbench/browser/parts/editor/sideBySideEditor";
import { IEditorGroup, IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
/**
 * An implementation of editor for diffing binary files like images or videos.
 */
export declare class BinaryResourceDiffEditor extends SideBySideEditor {
    static readonly ID: any;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, themeService: IThemeService, storageService: IStorageService, configurationService: IConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    getMetadata(): string | undefined;
}
