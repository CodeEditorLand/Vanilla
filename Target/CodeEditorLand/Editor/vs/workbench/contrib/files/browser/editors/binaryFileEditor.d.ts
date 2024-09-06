import { IStorageService } from "vs/platform/storage/common/storage";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { BaseBinaryResourceEditor } from "vs/workbench/browser/parts/editor/binaryEditor";
import { IEditorGroup } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorResolverService } from "vs/workbench/services/editor/common/editorResolverService";
/**
 * An implementation of editor for binary files that cannot be displayed.
 */
export declare class BinaryFileEditor extends BaseBinaryResourceEditor {
    private readonly editorResolverService;
    static readonly ID: any;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, editorResolverService: IEditorResolverService, storageService: IStorageService);
    private openInternal;
    getTitle(): string;
}
