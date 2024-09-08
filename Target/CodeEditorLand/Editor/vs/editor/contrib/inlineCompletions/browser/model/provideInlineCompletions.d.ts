import { CancellationToken } from "../../../../../base/common/cancellation.js";
import type { IDisposable } from "../../../../../base/common/lifecycle.js";
import type { ISingleEditOperation } from "../../../../common/core/editOperation.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { SingleTextEdit } from "../../../../common/core/textEdit.js";
import type { LanguageFeatureRegistry } from "../../../../common/languageFeatureRegistry.js";
import type { Command, InlineCompletion, InlineCompletionContext, InlineCompletions, InlineCompletionsProvider } from "../../../../common/languages.js";
import type { ILanguageConfigurationService } from "../../../../common/languages/languageConfigurationRegistry.js";
import type { ITextModel } from "../../../../common/model.js";
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
