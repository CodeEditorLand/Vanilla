import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { BaseBinaryResourceEditor } from "../../../../browser/parts/editor/binaryEditor.js";
import type { IEditorGroup } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorResolverService } from "../../../../services/editor/common/editorResolverService.js";
/**
 * An implementation of editor for binary files that cannot be displayed.
 */
export declare class BinaryFileEditor extends BaseBinaryResourceEditor {
    private readonly editorResolverService;
    static readonly ID = "workbench.editors.files.binaryFileEditor";
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, themeService: IThemeService, editorResolverService: IEditorResolverService, storageService: IStorageService);
    private openInternal;
    getTitle(): string;
}
