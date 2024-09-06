import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { IModelDecorationOptions, IModelDeltaDecoration } from "vs/editor/common/model";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IDebugService, IStackFrame } from "vs/workbench/contrib/debug/common/debug";
import "vs/css!./media/callStackEditorContribution";
export declare const topStackFrameColor: any;
export declare const focusedStackFrameColor: any;
export declare const TOP_STACK_FRAME_DECORATION: IModelDecorationOptions;
export declare const FOCUSED_STACK_FRAME_DECORATION: IModelDecorationOptions;
export declare const makeStackFrameColumnDecoration: (noCharactersBefore: boolean) => IModelDecorationOptions;
export declare function createDecorationsForStackFrame(stackFrame: IStackFrame, isFocusedSession: boolean, noCharactersBefore: boolean): IModelDeltaDecoration[];
export declare class CallStackEditorContribution extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly debugService;
    private readonly uriIdentityService;
    private readonly logService;
    private decorations;
    constructor(editor: ICodeEditor, debugService: IDebugService, uriIdentityService: IUriIdentityService, logService: ILogService);
    private createCallStackDecorations;
    dispose(): void;
}
