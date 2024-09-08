import { type Event } from "../../../base/common/event.js";
import { type ICommandEvent, type ICommandService } from "../../../platform/commands/common/commands.js";
import type { IResourceEditorInput } from "../../../platform/editor/common/editor.js";
import type { IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import type { ICodeEditor } from "../../browser/editorBrowser.js";
import { AbstractCodeEditorService, GlobalStyleSheet } from "../../browser/services/abstractCodeEditorService.js";
export declare class TestCodeEditorService extends AbstractCodeEditorService {
    readonly globalStyleSheet: TestGlobalStyleSheet;
    protected _createGlobalStyleSheet(): GlobalStyleSheet;
    getActiveCodeEditor(): ICodeEditor | null;
    lastInput?: IResourceEditorInput;
    openCodeEditor(input: IResourceEditorInput, source: ICodeEditor | null, sideBySide?: boolean): Promise<ICodeEditor | null>;
}
export declare class TestGlobalStyleSheet extends GlobalStyleSheet {
    rules: string[];
    constructor();
    insertRule(selector: string, rule: string): void;
    removeRulesContainingSelector(ruleName: string): void;
    read(): string;
}
export declare class TestCommandService implements ICommandService {
    readonly _serviceBrand: undefined;
    private readonly _instantiationService;
    private readonly _onWillExecuteCommand;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    private readonly _onDidExecuteCommand;
    readonly onDidExecuteCommand: Event<ICommandEvent>;
    constructor(instantiationService: IInstantiationService);
    executeCommand<T>(id: string, ...args: any[]): Promise<T>;
}
