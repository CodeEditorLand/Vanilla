import { URI } from "vs/base/common/uri";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IFileService } from "vs/platform/files/common/files";
import { IJSONEditingService, IJSONValue } from "vs/workbench/services/configuration/common/jsonEditing";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
export declare class JSONEditingService implements IJSONEditingService {
    private readonly fileService;
    private readonly textModelResolverService;
    private readonly textFileService;
    _serviceBrand: undefined;
    private queue;
    constructor(fileService: IFileService, textModelResolverService: ITextModelService, textFileService: ITextFileService);
    write(resource: URI, values: IJSONValue[]): Promise<void>;
    private doWriteConfiguration;
    private writeToBuffer;
    private applyEditsToBuffer;
    private getEdits;
    private resolveModelReference;
    private hasParseErrors;
    private resolveAndValidate;
    private reject;
    private toErrorMessage;
}
