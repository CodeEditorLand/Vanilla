import { URI } from "vs/base/common/uri";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { TextResourceEditorInput } from "vs/workbench/common/editor/textResourceEditorInput";
import { ICustomEditorLabelService } from "vs/workbench/services/editor/common/customEditorLabelService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
export declare class PerfviewContrib {
    private readonly _instaService;
    static get(): any;
    static readonly ID = "workbench.contrib.perfview";
    private readonly _inputUri;
    private readonly _registration;
    constructor(_instaService: IInstantiationService, textModelResolverService: ITextModelService);
    dispose(): void;
    getInputUri(): URI;
    getEditorInput(): PerfviewInput;
}
export declare class PerfviewInput extends TextResourceEditorInput {
    static readonly Id = "PerfviewInput";
    get typeId(): string;
    constructor(textModelResolverService: ITextModelService, textFileService: ITextFileService, editorService: IEditorService, fileService: IFileService, labelService: ILabelService, filesConfigurationService: IFilesConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService);
}
