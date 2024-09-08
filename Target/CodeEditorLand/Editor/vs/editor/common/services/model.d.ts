import type { Event } from "../../../base/common/event.js";
import type { URI } from "../../../base/common/uri.js";
import type { DocumentRangeSemanticTokensProvider, DocumentSemanticTokensProvider } from "../languages.js";
import type { ILanguageSelection } from "../languages/language.js";
import type { ITextBufferFactory, ITextModel, ITextModelCreationOptions } from "../model.js";
export declare const IModelService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IModelService>;
export type DocumentTokensProvider = DocumentSemanticTokensProvider | DocumentRangeSemanticTokensProvider;
export interface IModelService {
    readonly _serviceBrand: undefined;
    createModel(value: string | ITextBufferFactory, languageSelection: ILanguageSelection | null, resource?: URI, isForSimpleWidget?: boolean): ITextModel;
    updateModel(model: ITextModel, value: string | ITextBufferFactory): void;
    destroyModel(resource: URI): void;
    getModels(): ITextModel[];
    getCreationOptions(language: string, resource: URI, isForSimpleWidget: boolean): ITextModelCreationOptions;
    getModel(resource: URI): ITextModel | null;
    onModelAdded: Event<ITextModel>;
    onModelRemoved: Event<ITextModel>;
    onModelLanguageChanged: Event<{
        model: ITextModel;
        oldLanguageId: string;
    }>;
}
