import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { Position } from '../../../../common/core/position.js';
import { ITextModel } from '../../../../common/model.js';
import { InlineCompletion, InlineCompletionContext, InlineCompletionsProvider } from '../../../../common/languages.js';
import { ITestCodeEditor } from '../../../../test/browser/testCodeEditor.js';
import { InlineCompletionsModel } from '../../browser/model/inlineCompletionsModel.js';
export declare class MockInlineCompletionsProvider implements InlineCompletionsProvider {
    private returnValue;
    private delayMs;
    private callHistory;
    private calledTwiceIn50Ms;
    setReturnValue(value: InlineCompletion | undefined, delayMs?: number): void;
    setReturnValues(values: InlineCompletion[], delayMs?: number): void;
    getAndClearCallHistory(): unknown[];
    assertNotCalledTwiceWithin50ms(): void;
    private lastTimeMs;
    provideInlineCompletions(model: ITextModel, position: Position, context: InlineCompletionContext, token: CancellationToken): Promise<{
        items: InlineCompletion[];
    }>;
    freeInlineCompletions(): void;
    handleItemDidShow(): void;
}
export declare class GhostTextContext extends Disposable {
    private readonly editor;
    readonly prettyViewStates: (string | undefined)[];
    private _currentPrettyViewState;
    get currentPrettyViewState(): string | undefined;
    constructor(model: InlineCompletionsModel, editor: ITestCodeEditor);
    getAndClearViewStates(): (string | undefined)[];
    keyboardType(text: string): void;
    cursorUp(): void;
    cursorRight(): void;
    cursorLeft(): void;
    cursorDown(): void;
    cursorLineEnd(): void;
    leftDelete(): void;
}
