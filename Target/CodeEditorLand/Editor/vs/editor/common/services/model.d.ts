import { Event } from "vs/base/common/event";
import { URI } from "vs/base/common/uri";
import { DocumentRangeSemanticTokensProvider, DocumentSemanticTokensProvider } from "vs/editor/common/languages";
import { ILanguageSelection } from "vs/editor/common/languages/language";
import { ITextBufferFactory, ITextModel, ITextModelCreationOptions } from "vs/editor/common/model";
export declare const IModelService: any;
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
