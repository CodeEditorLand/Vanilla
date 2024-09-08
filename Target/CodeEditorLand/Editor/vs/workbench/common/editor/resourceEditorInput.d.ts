import type { IMarkdownString } from "../../../base/common/htmlContent.js";
import type { URI } from "../../../base/common/uri.js";
import { ITextResourceConfigurationService } from "../../../editor/common/services/textResourceConfiguration.js";
import { IFileService, type IFileReadLimits } from "../../../platform/files/common/files.js";
import { ILabelService } from "../../../platform/label/common/label.js";
import { ICustomEditorLabelService } from "../../services/editor/common/customEditorLabelService.js";
import { IFilesConfigurationService } from "../../services/filesConfiguration/common/filesConfigurationService.js";
import { EditorInputCapabilities, Verbosity, type EditorInputWithPreferredResource, type IFileLimitedEditorInputOptions } from "../editor.js";
import { EditorInput } from "./editorInput.js";
/**
 * The base class for all editor inputs that open resources.
 */
export declare abstract class AbstractResourceEditorInput extends EditorInput implements EditorInputWithPreferredResource {
    readonly resource: URI;
    protected readonly labelService: ILabelService;
    protected readonly fileService: IFileService;
    protected readonly filesConfigurationService: IFilesConfigurationService;
    protected readonly textResourceConfigurationService: ITextResourceConfigurationService;
    protected readonly customEditorLabelService: ICustomEditorLabelService;
    get capabilities(): EditorInputCapabilities;
    private _preferredResource;
    get preferredResource(): URI;
    constructor(resource: URI, preferredResource: URI | undefined, labelService: ILabelService, fileService: IFileService, filesConfigurationService: IFilesConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService);
    private registerListeners;
    private onLabelEvent;
    private updateLabel;
    setPreferredResource(preferredResource: URI): void;
    private _name;
    getName(): string;
    getDescription(verbosity?: Verbosity): string | undefined;
    private _shortDescription;
    private get shortDescription();
    private _mediumDescription;
    private get mediumDescription();
    private _longDescription;
    private get longDescription();
    private _shortTitle;
    private get shortTitle();
    private _mediumTitle;
    private get mediumTitle();
    private _longTitle;
    private get longTitle();
    getTitle(verbosity?: Verbosity): string;
    isReadonly(): boolean | IMarkdownString;
    protected ensureLimits(options?: IFileLimitedEditorInputOptions): IFileReadLimits | undefined;
}
