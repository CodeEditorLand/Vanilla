import { IMarkdownString } from "vs/base/common/htmlContent";
import { URI } from "vs/base/common/uri";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IFileReadLimits, IFileService } from "vs/platform/files/common/files";
import { ILabelService } from "vs/platform/label/common/label";
import { EditorInputCapabilities, EditorInputWithPreferredResource, IFileLimitedEditorInputOptions, Verbosity } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { ICustomEditorLabelService } from "vs/workbench/services/editor/common/customEditorLabelService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
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
    getDescription(verbosity?: any): string | undefined;
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
