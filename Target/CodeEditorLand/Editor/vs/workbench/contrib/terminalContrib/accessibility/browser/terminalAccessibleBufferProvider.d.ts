import { Disposable } from "vs/base/common/lifecycle";
import { IModelService } from "vs/editor/common/services/model";
import { IAccessibleViewContentProvider, IAccessibleViewOptions, IAccessibleViewSymbol } from "vs/platform/accessibility/browser/accessibleView";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ITerminalCommand } from "vs/platform/terminal/common/capabilities/capabilities";
import { ICurrentPartialCommand } from "vs/platform/terminal/common/capabilities/commandDetection/terminalCommand";
import { ITerminalInstance, ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { BufferContentTracker } from "vs/workbench/contrib/terminalContrib/accessibility/browser/bufferContentTracker";
export declare class TerminalAccessibleBufferProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _instance;
    private _bufferTracker;
    id: any;
    options: IAccessibleViewOptions;
    verbositySettingKey: any;
    private readonly _onDidRequestClearProvider;
    readonly onDidRequestClearLastProvider: any;
    private _focusedInstance;
    constructor(_instance: Pick<ITerminalInstance, "onDidExecuteText" | "focus" | "shellType" | "capabilities" | "onDidRequestFocus" | "resource" | "onDisposed">, _bufferTracker: BufferContentTracker, customHelp: () => string, _modelService: IModelService, configurationService: IConfigurationService, _contextKeyService: IContextKeyService, _terminalService: ITerminalService);
    onClose(): void;
    provideContent(): string;
    getSymbols(): IAccessibleViewSymbol[];
    private _getCommandsWithEditorLine;
    private _getEditorLineForCommand;
}
export interface ICommandWithEditorLine {
    command: ITerminalCommand | ICurrentPartialCommand;
    lineNumber: number;
    exitCode?: number;
}
