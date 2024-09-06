import { IIconLabelCreationOptions, IIconLabelValueOptions } from "vs/base/browser/ui/iconLabel/iconLabel";
import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { IRange } from "vs/editor/common/core/range";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelService } from "vs/editor/common/services/model";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { FileKind } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IDecorationsService } from "vs/workbench/services/decorations/common/decorations";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
export interface IResourceLabelProps {
    resource?: URI | {
        primary?: URI;
        secondary?: URI;
    };
    name?: string | string[];
    range?: IRange;
    description?: string;
}
export interface IResourceLabelOptions extends IIconLabelValueOptions {
    /**
     * A hint to the file kind of the resource.
     */
    fileKind?: FileKind;
    /**
     * File decorations to use for the label.
     */
    readonly fileDecorations?: {
        colors: boolean;
        badges: boolean;
    };
    /**
     * Will take the provided label as is and e.g. not override it for untitled files.
     */
    readonly forceLabel?: boolean;
    /**
     * Uses the provided icon instead of deriving a resource icon.
     */
    readonly icon?: ThemeIcon | URI;
}
export interface IFileLabelOptions extends IResourceLabelOptions {
    hideLabel?: boolean;
    hidePath?: boolean;
    range?: IRange;
}
export interface IResourceLabel extends IDisposable {
    readonly element: HTMLElement;
    readonly onDidRender: Event<void>;
    /**
     * Most generic way to apply a label with raw information.
     */
    setLabel(label?: string, description?: string, options?: IIconLabelValueOptions): void;
    /**
     * Convenient method to apply a label by passing a resource along.
     *
     * Note: for file resources consider to use the #setFile() method instead.
     */
    setResource(label: IResourceLabelProps, options?: IResourceLabelOptions): void;
    /**
     * Convenient method to render a file label based on a resource.
     */
    setFile(resource: URI, options?: IFileLabelOptions): void;
    /**
     * Resets the label to be empty.
     */
    clear(): void;
}
export interface IResourceLabelsContainer {
    readonly onDidChangeVisibility: Event<boolean>;
}
export declare const DEFAULT_LABELS_CONTAINER: IResourceLabelsContainer;
export declare class ResourceLabels extends Disposable {
    private readonly instantiationService;
    private readonly configurationService;
    private readonly modelService;
    private readonly workspaceService;
    private readonly languageService;
    private readonly decorationsService;
    private readonly themeService;
    private readonly labelService;
    private readonly textFileService;
    private readonly _onDidChangeDecorations;
    readonly onDidChangeDecorations: any;
    private widgets;
    private labels;
    constructor(container: IResourceLabelsContainer, instantiationService: IInstantiationService, configurationService: IConfigurationService, modelService: IModelService, workspaceService: IWorkspaceContextService, languageService: ILanguageService, decorationsService: IDecorationsService, themeService: IThemeService, labelService: ILabelService, textFileService: ITextFileService);
    private registerListeners;
    get(index: number): IResourceLabel;
    create(container: HTMLElement, options?: IIconLabelCreationOptions): IResourceLabel;
    private disposeWidget;
    clear(): void;
    dispose(): void;
}
/**
 * Note: please consider to use `ResourceLabels` if you are in need
 * of more than one label for your widget.
 */
export declare class ResourceLabel extends ResourceLabels {
    private label;
    get element(): IResourceLabel;
    constructor(container: HTMLElement, options: IIconLabelCreationOptions | undefined, instantiationService: IInstantiationService, configurationService: IConfigurationService, modelService: IModelService, workspaceService: IWorkspaceContextService, languageService: ILanguageService, decorationsService: IDecorationsService, themeService: IThemeService, labelService: ILabelService, textFileService: ITextFileService);
}
