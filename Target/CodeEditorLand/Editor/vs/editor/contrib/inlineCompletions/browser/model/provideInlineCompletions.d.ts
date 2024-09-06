import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { ISingleEditOperation } from "vs/editor/common/core/editOperation";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { SingleTextEdit } from "vs/editor/common/core/textEdit";
import { LanguageFeatureRegistry } from "vs/editor/common/languageFeatureRegistry";
import { Command, InlineCompletion, InlineCompletionContext, InlineCompletions, InlineCompletionsProvider } from "vs/editor/common/languages";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ITextModel } from "vs/editor/common/model";
export declare function provideInlineCompletions(registry: LanguageFeatureRegistry<InlineCompletionsProvider>, positionOrRange: Position | Range, model: ITextModel, context: InlineCompletionContext, token?: CancellationToken, languageConfigurationService?: ILanguageConfigurationService): Promise<InlineCompletionProviderResult>;
export declare class InlineCompletionProviderResult implements IDisposable {
    /**
     * Free of duplicates.
     */
    readonly completions: readonly InlineCompletionItem[];
    private readonly hashs;
    private readonly providerResults;
    constructor(
    /**
     * Free of duplicates.
     */
    completions: readonly InlineCompletionItem[], hashs: Set<string>, providerResults: readonly InlineCompletionList[]);
    has(item: InlineCompletionItem): boolean;
    dispose(): void;
}
/**
 * A ref counted pointer to the computed `InlineCompletions` and the `InlineCompletionsProvider` that
 * computed them.
 */
export declare class InlineCompletionList {
    readonly inlineCompletions: InlineCompletions;
    readonly provider: InlineCompletionsProvider;
    private refCount;
    constructor(inlineCompletions: InlineCompletions, provider: InlineCompletionsProvider);
    addRef(): void;
    removeRef(): void;
}
export declare class InlineCompletionItem {
    readonly filterText: string;
    readonly command: Command | undefined;
    readonly range: Range;
    readonly insertText: string;
    readonly snippetInfo: SnippetInfo | undefined;
    readonly additionalTextEdits: readonly ISingleEditOperation[];
    /**
     * A reference to the original inline completion this inline completion has been constructed from.
     * Used for event data to ensure referential equality.
     */
    readonly sourceInlineCompletion: InlineCompletion;
    /**
     * A reference to the original inline completion list this inline completion has been constructed from.
     * Used for event data to ensure referential equality.
     */
    readonly source: InlineCompletionList;
    static from(inlineCompletion: InlineCompletion, source: InlineCompletionList, defaultReplaceRange: Range, textModel: ITextModel, languageConfigurationService: ILanguageConfigurationService | undefined): InlineCompletionItem;
    constructor(filterText: string, command: Command | undefined, range: Range, insertText: string, snippetInfo: SnippetInfo | undefined, additionalTextEdits: readonly ISingleEditOperation[], 
    /**
     * A reference to the original inline completion this inline completion has been constructed from.
     * Used for event data to ensure referential equality.
     */
    sourceInlineCompletion: InlineCompletion, 
    /**
     * A reference to the original inline completion list this inline completion has been constructed from.
     * Used for event data to ensure referential equality.
     */
    source: InlineCompletionList);
    withRange(updatedRange: Range): InlineCompletionItem;
    hash(): string;
    toSingleTextEdit(): SingleTextEdit;
}
export interface SnippetInfo {
    snippet: string;
    range: Range;
}
