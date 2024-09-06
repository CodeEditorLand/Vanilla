import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { ILanguageStatusService } from "vs/workbench/services/languageStatus/common/languageStatusService";
/**
 * Uses that language status indicator to show information which language features have been limited for performance reasons.
 * Currently this is used for folding ranges and for color decorators.
 */
export declare class LimitIndicatorContribution extends Disposable implements IWorkbenchContribution {
    constructor(editorService: IEditorService, languageStatusService: ILanguageStatusService);
}
export interface LimitInfo {
    readonly onDidChange: Event<void>;
    readonly computed: number;
    readonly limited: number | false;
}
