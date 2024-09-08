import type { IAnchor } from "../../../../base/browser/ui/contextview/contextview.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IActionWidgetService } from "../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { type IPosition } from "../../../common/core/position.js";
import { type IEditorContribution } from "../../../common/editorCommon.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { CodeActionAutoApply, type CodeActionFilter, type CodeActionSet, type CodeActionTrigger, CodeActionTriggerSource } from "../common/types.js";
interface IActionShowOptions {
    readonly includeDisabledActions?: boolean;
    readonly fromLightbulb?: boolean;
}
export declare class CodeActionController extends Disposable implements IEditorContribution {
    private readonly _commandService;
    private readonly _configurationService;
    private readonly _actionWidgetService;
    private readonly _instantiationService;
    private readonly _telemetryService;
    static readonly ID = "editor.contrib.codeActionController";
    static get(editor: ICodeEditor): CodeActionController | null;
    private readonly _editor;
    private readonly _model;
    private readonly _lightBulbWidget;
    private readonly _activeCodeActions;
    private _showDisabled;
    private readonly _resolver;
    private _disposed;
    constructor(editor: ICodeEditor, markerService: IMarkerService, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, languageFeaturesService: ILanguageFeaturesService, progressService: IEditorProgressService, _commandService: ICommandService, _configurationService: IConfigurationService, _actionWidgetService: IActionWidgetService, _instantiationService: IInstantiationService, _telemetryService: ITelemetryService);
    dispose(): void;
    private showCodeActionsFromLightbulb;
    showCodeActions(_trigger: CodeActionTrigger, actions: CodeActionSet, at: IAnchor | IPosition): Promise<void>;
    hideCodeActions(): void;
    manualTriggerAtCurrentPosition(notAvailableMessage: string, triggerAction: CodeActionTriggerSource, filter?: CodeActionFilter, autoApply?: CodeActionAutoApply): void;
    private _trigger;
    private _applyCodeAction;
    hideLightBulbWidget(): void;
    private update;
    private getInvalidActionThatWouldHaveBeenApplied;
    private tryGetValidActionToApply;
    private static readonly DECORATION;
    showCodeActionList(actions: CodeActionSet, at: IAnchor | IPosition, options: IActionShowOptions): Promise<void>;
    private toCoords;
    private _shouldShowHeaders;
    private _getActionBarActions;
}
export {};
