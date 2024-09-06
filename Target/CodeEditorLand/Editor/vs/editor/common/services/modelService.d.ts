import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ISingleEditOperation } from "vs/editor/common/core/editOperation";
import { ILanguageSelection } from "vs/editor/common/languages/language";
import { ITextBuffer, ITextBufferFactory, ITextModel, ITextModelCreationOptions } from "vs/editor/common/model";
import { IModelService } from "vs/editor/common/services/model";
import { ITextResourcePropertiesService } from "vs/editor/common/services/textResourceConfiguration";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IUndoRedoService } from "vs/platform/undoRedo/common/undoRedo";
export declare class ModelService extends Disposable implements IModelService {
    private readonly _configurationService;
    private readonly _resourcePropertiesService;
    private readonly _undoRedoService;
    private readonly _instantiationService;
    static MAX_MEMORY_FOR_CLOSED_FILES_UNDO_STACK: number;
    _serviceBrand: undefined;
    private readonly _onModelAdded;
    readonly onModelAdded: Event<ITextModel>;
    private readonly _onModelRemoved;
    readonly onModelRemoved: Event<ITextModel>;
    private readonly _onModelModeChanged;
    readonly onModelLanguageChanged: any;
    private _modelCreationOptionsByLanguageAndResource;
    /**
     * All the models known in the system.
     */
    private readonly _models;
    private readonly _disposedModels;
    private _disposedModelsHeapSize;
    constructor(_configurationService: IConfigurationService, _resourcePropertiesService: ITextResourcePropertiesService, _undoRedoService: IUndoRedoService, _instantiationService: IInstantiationService);
    private static _readModelOptions;
    private _getEOL;
    private _shouldRestoreUndoStack;
    getCreationOptions(languageIdOrSelection: string | ILanguageSelection, resource: URI | undefined, isForSimpleWidget: boolean): ITextModelCreationOptions;
    private _updateModelOptions;
    private static _setModelOptionsForModel;
    private _insertDisposedModel;
    private _removeDisposedModel;
    private _ensureDisposedModelsHeapSize;
    private _createModelData;
    updateModel(model: ITextModel, value: string | ITextBufferFactory): void;
    private static _commonPrefix;
    private static _commonSuffix;
    /**
     * Compute edits to bring `model` to the state of `textSource`.
     */
    static _computeEdits(model: ITextModel, textBuffer: ITextBuffer): ISingleEditOperation[];
    createModel(value: string | ITextBufferFactory, languageSelection: ILanguageSelection | null, resource?: URI, isForSimpleWidget?: boolean): ITextModel;
    destroyModel(resource: URI): void;
    getModels(): ITextModel[];
    getModel(resource: URI): ITextModel | null;
    protected _schemaShouldMaintainUndoRedoElements(resource: URI): boolean;
    private _onWillDispose;
    private _onDidChangeLanguage;
    protected _getSHA1Computer(): ITextModelSHA1Computer;
}
export interface ITextModelSHA1Computer {
    canComputeSHA1(model: ITextModel): boolean;
    computeSHA1(model: ITextModel): string;
}
export declare class DefaultModelSHA1Computer implements ITextModelSHA1Computer {
    static MAX_MODEL_SIZE: number;
    canComputeSHA1(model: ITextModel): boolean;
    computeSHA1(model: ITextModel): string;
}
