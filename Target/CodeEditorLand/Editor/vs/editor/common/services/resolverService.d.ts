import type { Event } from "../../../base/common/event.js";
import type { IMarkdownString } from "../../../base/common/htmlContent.js";
import type { IDisposable, IReference } from "../../../base/common/lifecycle.js";
import type { URI } from "../../../base/common/uri.js";
import type { IResolvableEditorModel } from "../../../platform/editor/common/editor.js";
import type { ITextModel, ITextSnapshot } from "../model.js";
export declare const ITextModelService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextModelService>;
export interface ITextModelService {
    readonly _serviceBrand: undefined;
    /**
     * Provided a resource URI, it will return a model reference
     * which should be disposed once not needed anymore.
     */
    createModelReference(resource: URI): Promise<IReference<IResolvedTextEditorModel>>;
    /**
     * Registers a specific `scheme` content provider.
     */
    registerTextModelContentProvider(scheme: string, provider: ITextModelContentProvider): IDisposable;
    /**
     * Check if the given resource can be resolved to a text model.
     */
    canHandleResource(resource: URI): boolean;
}
export interface ITextModelContentProvider {
    /**
     * Given a resource, return the content of the resource as `ITextModel`.
     */
    provideTextContent(resource: URI): Promise<ITextModel | null> | null;
}
export interface ITextEditorModel extends IResolvableEditorModel {
    /**
     * Emitted when the text model is about to be disposed.
     */
    readonly onWillDispose: Event<void>;
    /**
     * Provides access to the underlying `ITextModel`.
     */
    readonly textEditorModel: ITextModel | null;
    /**
     * Creates a snapshot of the model's contents.
     */
    createSnapshot(this: IResolvedTextEditorModel): ITextSnapshot;
    createSnapshot(this: ITextEditorModel): ITextSnapshot | null;
    /**
     * Signals if this model is readonly or not.
     */
    isReadonly(): boolean | IMarkdownString;
    /**
     * The language id of the text model if known.
     */
    getLanguageId(): string | undefined;
    /**
     * Find out if this text model has been disposed.
     */
    isDisposed(): boolean;
}
export interface IResolvedTextEditorModel extends ITextEditorModel {
    /**
     * Same as ITextEditorModel#textEditorModel, but never null.
     */
    readonly textEditorModel: ITextModel;
}
export declare function isResolvedTextEditorModel(model: ITextEditorModel): model is IResolvedTextEditorModel;
