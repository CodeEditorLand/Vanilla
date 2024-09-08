import { URI } from "../../../../base/common/uri.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, type ServicesAccessor } from "../../../browser/editorExtensions.js";
import { type IPosition, Position } from "../../../common/core/position.js";
import type { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { type Rejection, type RenameProvider, type WorkspaceEdit } from "../../../common/languages.js";
import type { ITextModel } from "../../../common/model.js";
export declare function rename(registry: LanguageFeatureRegistry<RenameProvider>, model: ITextModel, position: Position, newName: string): Promise<WorkspaceEdit & Rejection>;
export declare class RenameAction extends EditorAction {
    constructor();
    runCommand(accessor: ServicesAccessor, args: [URI, IPosition]): void | Promise<void>;
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
