import type { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import type { Position } from "../../../../../editor/common/core/position.js";
import type { ITextModel } from "../../../../../editor/common/model.js";
import { type ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { ISnippetsService } from "../snippets.js";
import type { Snippet } from "../snippetsFile.js";
import { SnippetEditorAction } from "./abstractSnippetsActions.js";
export declare function getSurroundableSnippets(snippetsService: ISnippetsService, model: ITextModel, position: Position, includeDisabledSnippets: boolean): Promise<Snippet[]>;
export declare class SurroundWithSnippetEditorAction extends SnippetEditorAction {
    static readonly options: {
        id: string;
        title: import("../../../../../nls.js").ILocalizedString;
    };
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
