import { type IDisposable } from "../../base/common/lifecycle.js";
import type { URI } from "../../base/common/uri.js";
import { type LanguageSelector } from "./languageSelector.js";
import { type ITextModel } from "./model.js";
export interface NotebookInfo {
    readonly uri: URI;
    readonly type: string;
}
export interface NotebookInfoResolver {
    (uri: URI): NotebookInfo | undefined;
}
export declare class LanguageFeatureRegistry<T> {
    private readonly _notebookInfoResolver?;
    private _clock;
    private readonly _entries;
    private readonly _onDidChange;
    readonly onDidChange: import("../../base/common/event.js").Event<number>;
    constructor(_notebookInfoResolver?: NotebookInfoResolver | undefined);
    register(selector: LanguageSelector, provider: T): IDisposable;
    has(model: ITextModel): boolean;
    all(model: ITextModel): T[];
    allNoModel(): T[];
    ordered(model: ITextModel, recursive?: boolean): T[];
    orderedGroups(model: ITextModel): T[][];
    private _orderedForEach;
    private _lastCandidate;
    private _updateScores;
    private static _compareByScoreAndTime;
}
