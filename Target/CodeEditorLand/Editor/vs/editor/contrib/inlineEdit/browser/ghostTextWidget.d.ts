import { Disposable } from "../../../../base/common/lifecycle.js";
import { type IObservable } from "../../../../base/common/observable.js";
import "./inlineEdit.css";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { type IRange } from "../../../common/core/range.js";
import { ILanguageService } from "../../../common/languages/language.js";
import { type ITextModel } from "../../../common/model.js";
import type { GhostText } from "../../inlineCompletions/browser/model/ghostText.js";
export declare const INLINE_EDIT_DESCRIPTION = "inline-edit";
export interface IGhostTextWidgetModel {
    readonly targetTextModel: IObservable<ITextModel | undefined>;
    readonly ghostText: IObservable<GhostText | undefined>;
    readonly minReservedLineCount: IObservable<number>;
    readonly range: IObservable<IRange | undefined>;
}
export declare class GhostTextWidget extends Disposable {
    private readonly editor;
    readonly model: IGhostTextWidgetModel;
    private readonly languageService;
    private readonly isDisposed;
    private readonly currentTextModel;
    constructor(editor: ICodeEditor, model: IGhostTextWidgetModel, languageService: ILanguageService);
    private readonly uiState;
    private readonly decorations;
    private readonly additionalLinesWidget;
    ownsViewZone(viewZoneId: string): boolean;
}
