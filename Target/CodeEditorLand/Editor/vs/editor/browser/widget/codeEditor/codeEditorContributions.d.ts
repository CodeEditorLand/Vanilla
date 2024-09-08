import { Disposable, type IDisposable } from "../../../../base/common/lifecycle.js";
import type { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { IEditorContribution } from "../../../common/editorCommon.js";
import type { ICodeEditor } from "../../editorBrowser.js";
import { type IEditorContributionDescription } from "../../editorExtensions.js";
export declare class CodeEditorContributions extends Disposable {
    private _editor;
    private _instantiationService;
    /**
     * Contains all instantiated contributions.
     */
    private readonly _instances;
    /**
     * Contains contributions which are not yet instantiated.
     */
    private readonly _pending;
    /**
     * Tracks which instantiation kinds are still left in `_pending`.
     */
    private readonly _finishedInstantiation;
    constructor();
    initialize(editor: ICodeEditor, contributions: IEditorContributionDescription[], instantiationService: IInstantiationService): void;
    saveViewState(): {
        [key: string]: any;
    };
    restoreViewState(contributionsState: {
        [key: string]: any;
    }): void;
    get(id: string): IEditorContribution | null;
    /**
     * used by tests
     */
    set(id: string, value: IEditorContribution): void;
    onBeforeInteractionEvent(): void;
    onAfterModelAttached(): IDisposable;
    private _instantiateSome;
    private _findPendingContributionsByInstantiation;
    private _instantiateById;
}
