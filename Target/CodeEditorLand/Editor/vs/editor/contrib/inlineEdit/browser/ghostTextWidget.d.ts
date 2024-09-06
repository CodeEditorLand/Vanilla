import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import "vs/css!./inlineEdit";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IRange } from "vs/editor/common/core/range";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ITextModel } from "vs/editor/common/model";
import { GhostText } from "vs/editor/contrib/inlineCompletions/browser/model/ghostText";
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
