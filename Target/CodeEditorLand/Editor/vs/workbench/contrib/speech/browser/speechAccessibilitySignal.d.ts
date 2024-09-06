import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { ISpeechService } from "vs/workbench/contrib/speech/common/speechService";
export declare class SpeechAccessibilitySignalContribution extends Disposable implements IWorkbenchContribution {
    private readonly _accessibilitySignalService;
    private readonly _speechService;
    static readonly ID = "workbench.contrib.speechAccessibilitySignal";
    constructor(_accessibilitySignalService: IAccessibilitySignalService, _speechService: ISpeechService);
}
