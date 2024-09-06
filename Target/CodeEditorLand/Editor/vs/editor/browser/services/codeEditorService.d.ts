import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ICodeEditor, IDiffEditor } from "vs/editor/browser/editorBrowser";
import { IDecorationRenderOptions } from "vs/editor/common/editorCommon";
import { IModelDecorationOptions, ITextModel } from "vs/editor/common/model";
import { ITextResourceEditorInput } from "vs/platform/editor/common/editor";
export declare const ICodeEditorService: any;
export interface ICodeEditorService {
    readonly _serviceBrand: undefined;
    readonly onWillCreateCodeEditor: Event<void>;
    readonly onCodeEditorAdd: Event<ICodeEditor>;
    readonly onCodeEditorRemove: Event<ICodeEditor>;
    readonly onWillCreateDiffEditor: Event<void>;
    readonly onDiffEditorAdd: Event<IDiffEditor>;
    readonly onDiffEditorRemove: Event<IDiffEditor>;
    readonly onDidChangeTransientModelProperty: Event<ITextModel>;
    readonly onDecorationTypeRegistered: Event<string>;
    willCreateCodeEditor(): void;
    addCodeEditor(editor: ICodeEditor): void;
    removeCodeEditor(editor: ICodeEditor): void;
    listCodeEditors(): readonly ICodeEditor[];
    willCreateDiffEditor(): void;
    addDiffEditor(editor: IDiffEditor): void;
    removeDiffEditor(editor: IDiffEditor): void;
    listDiffEditors(): readonly IDiffEditor[];
    /**
     * Returns the current focused code editor (if the focus is in the editor or in an editor widget) or null.
     */
    getFocusedCodeEditor(): ICodeEditor | null;
    registerDecorationType(description: string, key: string, options: IDecorationRenderOptions, parentTypeKey?: string, editor?: ICodeEditor): void;
    listDecorationTypes(): string[];
    removeDecorationType(key: string): void;
    resolveDecorationOptions(typeKey: string, writable: boolean): IModelDecorationOptions;
    resolveDecorationCSSRules(decorationTypeKey: string): CSSRuleList | null;
    setModelProperty(resource: URI, key: string, value: any): void;
    getModelProperty(resource: URI, key: string): any;
    setTransientModelProperty(model: ITextModel, key: string, value: any): void;
    getTransientModelProperty(model: ITextModel, key: string): any;
    getTransientModelProperties(model: ITextModel): [string, any][] | undefined;
    getActiveCodeEditor(): ICodeEditor | null;
    openCodeEditor(input: ITextResourceEditorInput, source: ICodeEditor | null, sideBySide?: boolean): Promise<ICodeEditor | null>;
    registerCodeEditorOpenHandler(handler: ICodeEditorOpenHandler): IDisposable;
}
export interface ICodeEditorOpenHandler {
    (input: ITextResourceEditorInput, source: ICodeEditor | null, sideBySide?: boolean): Promise<ICodeEditor | null>;
}
