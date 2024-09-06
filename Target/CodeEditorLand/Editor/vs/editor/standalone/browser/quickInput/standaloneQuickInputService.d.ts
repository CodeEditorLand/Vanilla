import "vs/css!./standaloneQuickInput";
import { CancellationToken } from "vs/base/common/cancellation";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from "vs/editor/browser/editorBrowser";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IInputBox, IInputOptions, IPickOptions, IQuickInputService, IQuickNavigateConfiguration, IQuickPick, IQuickPickItem, IQuickWidget, QuickPickInput } from "vs/platform/quickinput/common/quickInput";
export declare class StandaloneQuickInputService implements IQuickInputService {
    private readonly instantiationService;
    private readonly codeEditorService;
    readonly _serviceBrand: undefined;
    private mapEditorToService;
    private get activeService();
    get currentQuickInput(): any;
    get quickAccess(): any;
    get backButton(): any;
    get onShow(): any;
    get onHide(): any;
    constructor(instantiationService: IInstantiationService, codeEditorService: ICodeEditorService);
    pick<T extends IQuickPickItem, O extends IPickOptions<T>>(picks: Promise<QuickPickInput<T>[]> | QuickPickInput<T>[], options?: O, token?: CancellationToken): Promise<(O extends {
        canPickMany: true;
    } ? T[] : T) | undefined>;
    input(options?: IInputOptions | undefined, token?: CancellationToken | undefined): Promise<string | undefined>;
    createQuickPick<T extends IQuickPickItem>(options: {
        useSeparators: true;
    }): IQuickPick<T, {
        useSeparators: true;
    }>;
    createQuickPick<T extends IQuickPickItem>(options?: {
        useSeparators: boolean;
    }): IQuickPick<T, {
        useSeparators: false;
    }>;
    createInputBox(): IInputBox;
    createQuickWidget(): IQuickWidget;
    focus(): void;
    toggle(): void;
    navigate(next: boolean, quickNavigate?: IQuickNavigateConfiguration | undefined): void;
    accept(): Promise<void>;
    back(): Promise<void>;
    cancel(): Promise<void>;
}
export declare class QuickInputEditorContribution implements IEditorContribution {
    private editor;
    static readonly ID = "editor.controller.quickInput";
    static get(editor: ICodeEditor): QuickInputEditorContribution | null;
    readonly widget: QuickInputEditorWidget;
    constructor(editor: ICodeEditor);
    dispose(): void;
}
export declare class QuickInputEditorWidget implements IOverlayWidget {
    private codeEditor;
    private static readonly ID;
    private domNode;
    constructor(codeEditor: ICodeEditor);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition | null;
    dispose(): void;
}
