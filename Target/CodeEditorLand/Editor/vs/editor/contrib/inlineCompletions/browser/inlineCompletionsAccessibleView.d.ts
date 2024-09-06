import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { InlineCompletionsModel } from "vs/editor/contrib/inlineCompletions/browser/model/inlineCompletionsModel";
import { IAccessibleViewContentProvider } from "vs/platform/accessibility/browser/accessibleView";
import { IAccessibleViewImplentation } from "vs/platform/accessibility/browser/accessibleViewRegistry";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class InlineCompletionsAccessibleView implements IAccessibleViewImplentation {
    readonly type: any;
    readonly priority = 95;
    readonly name = "inline-completions";
    readonly when: any;
    getProvider(accessor: ServicesAccessor): InlineCompletionsAccessibleViewContentProvider | undefined;
}
declare class InlineCompletionsAccessibleViewContentProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _editor;
    private readonly _model;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    constructor(_editor: ICodeEditor, _model: InlineCompletionsModel);
    readonly id: any;
    readonly verbositySettingKey = "accessibility.verbosity.inlineCompletions";
    readonly options: {
        language: any;
        type: any;
    };
    provideContent(): string;
    provideNextContent(): string | undefined;
    providePreviousContent(): string | undefined;
    onClose(): void;
}
export {};
