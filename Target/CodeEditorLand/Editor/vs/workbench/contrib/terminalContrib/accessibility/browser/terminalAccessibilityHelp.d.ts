import type { Terminal } from "@xterm/xterm";
import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibleViewContentProvider, IAccessibleViewOptions } from "vs/platform/accessibility/browser/accessibleView";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ITerminalInstance, IXtermTerminal } from "vs/workbench/contrib/terminal/browser/terminal";
export declare const enum ClassName {
    Active = "active",
    EditorTextArea = "textarea"
}
export declare class TerminalAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _instance;
    private readonly _contextKeyService;
    private readonly _commandService;
    private readonly _configurationService;
    id: any;
    private readonly _hasShellIntegration;
    onClose(): void;
    options: IAccessibleViewOptions;
    verbositySettingKey: any;
    constructor(_instance: Pick<ITerminalInstance, "shellType" | "capabilities" | "onDidRequestFocus" | "resource" | "focus">, _xterm: Pick<IXtermTerminal, "getFont" | "shellIntegration"> & {
        raw: Terminal;
    }, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _commandService: ICommandService, _configurationService: IConfigurationService);
    provideContent(): string;
}
