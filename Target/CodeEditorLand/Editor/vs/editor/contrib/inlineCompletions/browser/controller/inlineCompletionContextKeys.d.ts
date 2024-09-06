import { Disposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { InlineCompletionsModel } from "vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsModel";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
export declare class InlineCompletionContextKeys extends Disposable {
    private readonly contextKeyService;
    private readonly model;
    static readonly inlineSuggestionVisible: any;
    static readonly inlineSuggestionHasIndentation: any;
    static readonly inlineSuggestionHasIndentationLessThanTabSize: any;
    static readonly suppressSuggestions: any;
    readonly inlineCompletionVisible: any;
    readonly inlineCompletionSuggestsIndentation: any;
    readonly inlineCompletionSuggestsIndentationLessThanTabSize: any;
    readonly suppressSuggestions: any;
    constructor(contextKeyService: IContextKeyService, model: IObservable<InlineCompletionsModel | undefined>);
}
