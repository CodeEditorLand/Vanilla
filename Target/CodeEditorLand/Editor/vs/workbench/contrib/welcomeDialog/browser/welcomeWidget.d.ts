import "vs/css!./media/welcomeWidget";
import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from "vs/editor/browser/editorBrowser";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
export declare class WelcomeWidget extends Disposable implements IOverlayWidget {
    private readonly _editor;
    private readonly instantiationService;
    private readonly commandService;
    private readonly telemetryService;
    private readonly openerService;
    private readonly _rootDomNode;
    private readonly element;
    private readonly messageContainer;
    private readonly markdownRenderer;
    constructor(_editor: ICodeEditor, instantiationService: IInstantiationService, commandService: ICommandService, telemetryService: ITelemetryService, openerService: IOpenerService);
    executeCommand(commandId: string, ...args: string[]): Promise<void>;
    render(title: string, message: string, buttonText: string, buttonAction: string): Promise<void>;
    private buildWidgetContent;
    private buildStepMarkdownDescription;
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    private _isVisible;
    private _show;
    private _hide;
}
