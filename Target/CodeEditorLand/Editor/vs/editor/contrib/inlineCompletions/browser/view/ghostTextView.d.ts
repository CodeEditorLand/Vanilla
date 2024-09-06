import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import "vs/css!./ghostTextView";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ILanguageIdCodec } from "vs/editor/common/languages";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ITextModel } from "vs/editor/common/model";
import { LineDecoration } from "vs/editor/common/viewLayout/lineDecorations";
import { GhostText, GhostTextReplacement } from "vs/editor/contrib/inlineCompletions/browser/model/ghostText";
export declare const GHOST_TEXT_DESCRIPTION = "ghost-text";
export interface IGhostTextWidgetModel {
    readonly targetTextModel: IObservable<ITextModel | undefined>;
    readonly ghostText: IObservable<GhostText | GhostTextReplacement | undefined>;
    readonly minReservedLineCount: IObservable<number>;
}
export declare class GhostTextView extends Disposable {
    private readonly editor;
    private readonly model;
    private readonly languageService;
    private readonly isDisposed;
    private readonly currentTextModel;
    constructor(editor: ICodeEditor, model: IGhostTextWidgetModel, languageService: ILanguageService);
    private readonly uiState;
    private readonly decorations;
    private readonly additionalLinesWidget;
    ownsViewZone(viewZoneId: string): boolean;
}
export declare class AdditionalLinesWidget extends Disposable {
    private readonly editor;
    private readonly languageIdCodec;
    private readonly lines;
    private _viewZoneId;
    get viewZoneId(): string | undefined;
    private readonly editorOptionsChanged;
    constructor(editor: ICodeEditor, languageIdCodec: ILanguageIdCodec, lines: IObservable<{
        targetTextModel: ITextModel;
        lineNumber: number;
        additionalLines: LineData[];
        minReservedLineCount: number;
    } | undefined>);
    dispose(): void;
    private clear;
    private updateLines;
}
export interface LineData {
    content: string;
    decorations: LineDecoration[];
}
export declare const ttPolicy: any;
