import { type CancelablePromise } from "../../../../base/common/async.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import type { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { type IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import type { IMarkerService } from "../../../../platform/markers/common/markers.js";
import { type IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import type { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import type { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { type CodeActionProvider } from "../../../common/languages.js";
import { type CodeActionSet, type CodeActionTrigger } from "../common/types.js";
export declare const SUPPORTED_CODE_ACTIONS: RawContextKey<string>;
export declare const APPLY_FIX_ALL_COMMAND_ID = "_typescript.applyFixAllCodeAction";
export declare namespace CodeActionsState {
    enum Type {
        Empty = 0,
        Triggered = 1
    }
    const Empty: {
        readonly type: Type.Empty;
    };
    class Triggered {
        readonly trigger: CodeActionTrigger;
        readonly position: Position;
        private readonly _cancellablePromise;
        readonly type = Type.Triggered;
        readonly actions: Promise<CodeActionSet>;
        constructor(trigger: CodeActionTrigger, position: Position, _cancellablePromise: CancelablePromise<CodeActionSet>);
        cancel(): void;
    }
    type State = typeof Empty | Triggered;
}
export declare class CodeActionModel extends Disposable {
    private readonly _editor;
    private readonly _registry;
    private readonly _markerService;
    private readonly _progressService?;
    private readonly _configurationService?;
    private readonly _telemetryService?;
    private readonly _codeActionOracle;
    private _state;
    private readonly _supportedCodeActions;
    private readonly _onDidChangeState;
    readonly onDidChangeState: import("../../../../base/common/event.js").Event<CodeActionsState.State>;
    private _disposed;
    constructor(_editor: ICodeEditor, _registry: LanguageFeatureRegistry<CodeActionProvider>, _markerService: IMarkerService, contextKeyService: IContextKeyService, _progressService?: IEditorProgressService | undefined, _configurationService?: IConfigurationService | undefined, _telemetryService?: ITelemetryService | undefined);
    dispose(): void;
    private _settingEnabledNearbyQuickfixes;
    private _update;
    trigger(trigger: CodeActionTrigger): void;
    private setState;
}
