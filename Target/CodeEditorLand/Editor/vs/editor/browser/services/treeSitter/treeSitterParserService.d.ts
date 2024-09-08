import type { Parser } from "@vscode/tree-sitter-wasm";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable, type IDisposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import type { ITextModel } from "../../../common/model.js";
import { IModelService } from "../../../common/services/model.js";
import { type ITreeSitterParseResult, type ITreeSitterParserService } from "../../../common/services/treeSitterParserService.js";
import type { IModelContentChange } from "../../../common/textModelEvents.js";
export declare class TextModelTreeSitter extends Disposable {
    readonly model: ITextModel;
    private readonly _treeSitterLanguages;
    private readonly _treeSitterImporter;
    private readonly _logService;
    private readonly _telemetryService;
    private _parseResult;
    get parseResult(): ITreeSitterParseResult | undefined;
    constructor(model: ITextModel, _treeSitterLanguages: TreeSitterLanguages, _treeSitterImporter: TreeSitterImporter, _logService: ILogService, _telemetryService: ITelemetryService);
    private readonly _languageSessionDisposables;
    /**
     * Be very careful when making changes to this method as it is easy to introduce race conditions.
     */
    private _onDidChangeLanguage;
    private _getLanguage;
    private _onDidChangeContent;
}
export declare class TreeSitterParseResult implements IDisposable, ITreeSitterParseResult {
    readonly parser: Parser;
    readonly language: Parser.Language;
    private readonly _logService;
    private readonly _telemetryService;
    private _tree;
    private _isDisposed;
    constructor(parser: Parser, language: Parser.Language, _logService: ILogService, _telemetryService: ITelemetryService);
    dispose(): void;
    get tree(): Parser.Tree | undefined;
    private set tree(value);
    get isDisposed(): boolean;
    private _onDidChangeContentQueue;
    onDidChangeContent(model: ITextModel, changes: IModelContentChange[]): Promise<void>;
    private _newEdits;
    private _applyEdits;
    private _parseAndUpdateTree;
    private _parse;
    private _parseAndYield;
    private _parseCallback;
    private sendParseTimeTelemetry;
}
export declare class TreeSitterLanguages extends Disposable {
    private readonly _treeSitterImporter;
    private readonly _fileService;
    private readonly _environmentService;
    private readonly _registeredLanguages;
    private _languages;
    readonly _onDidAddLanguage: Emitter<{
        id: string;
        language: Parser.Language;
    }>;
    /**
     * If you're looking for a specific language, make sure to check if it already exists with `getLanguage` as it will kick off the process to add it if it doesn't exist.
     */
    readonly onDidAddLanguage: Event<{
        id: string;
        language: Parser.Language;
    }>;
    constructor(_treeSitterImporter: TreeSitterImporter, _fileService: IFileService, _environmentService: IEnvironmentService, _registeredLanguages: Map<string, string>);
    getOrInitLanguage(languageId: string): Parser.Language | undefined;
    private _addLanguage;
    private _fetchLanguage;
    private _getLanguageLocation;
}
export declare class TreeSitterImporter {
    private _treeSitterImport;
    private _getTreeSitterImport;
    private _parserClass;
    getParserClass(): Promise<any>;
}
export declare class TreeSitterTextModelService extends Disposable implements ITreeSitterParserService {
    private readonly _modelService;
    private readonly _telemetryService;
    private readonly _logService;
    private readonly _configurationService;
    private readonly _environmentService;
    readonly _serviceBrand: undefined;
    private _init;
    private _textModelTreeSitters;
    private readonly _registeredLanguages;
    private readonly _treeSitterImporter;
    private readonly _treeSitterLanguages;
    readonly onDidAddLanguage: Event<{
        id: string;
        language: Parser.Language;
    }>;
    constructor(_modelService: IModelService, fileService: IFileService, _telemetryService: ITelemetryService, _logService: ILogService, _configurationService: IConfigurationService, _environmentService: IEnvironmentService);
    getOrInitLanguage(languageId: string): Parser.Language | undefined;
    getParseResult(textModel: ITextModel): ITreeSitterParseResult | undefined;
    private _doInitParser;
    private _hasInit;
    private _initParser;
    private _supportedLanguagesChanged;
    private _getSetting;
    private _registerModelServiceListeners;
    private _createTextModelTreeSitter;
    private _addGrammar;
    private _removeGrammar;
}
