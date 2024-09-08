import { DisposableStore, type IDisposable } from "../../../base/common/lifecycle.js";
import { type AccessibilitySupport } from "../../../platform/accessibility/common/accessibility.js";
import type { MenuId } from "../../../platform/actions/common/actions.js";
import type { BrandedService, IInstantiationService } from "../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../platform/instantiation/common/serviceCollection.js";
import { TestInstantiationService } from "../../../platform/instantiation/test/common/instantiationServiceMock.js";
import type { EditorConfiguration } from "../../browser/config/editorConfiguration.js";
import type { IActiveCodeEditor, ICodeEditor } from "../../browser/editorBrowser.js";
import type { View } from "../../browser/view.js";
import { CodeEditorWidget } from "../../browser/widget/codeEditor/codeEditorWidget.js";
import type * as editorOptions from "../../common/config/editorOptions.js";
import type { IEditorContribution } from "../../common/editorCommon.js";
import type { ITextBufferFactory, ITextModel } from "../../common/model.js";
import type { ViewModel } from "../../common/viewModel/viewModelImpl.js";
export interface ITestCodeEditor extends IActiveCodeEditor {
    getViewModel(): ViewModel | undefined;
    registerAndInstantiateContribution<T extends IEditorContribution, Services extends BrandedService[]>(id: string, ctor: new (editor: ICodeEditor, ...services: Services) => T): T;
    registerDisposable(disposable: IDisposable): void;
}
export declare class TestCodeEditor extends CodeEditorWidget implements ICodeEditor {
    protected _createConfiguration(isSimpleWidget: boolean, contextMenuId: MenuId, options: Readonly<TestCodeEditorCreationOptions>): EditorConfiguration;
    protected _createView(viewModel: ViewModel): [View, boolean];
    private _hasTextFocus;
    setHasTextFocus(hasTextFocus: boolean): void;
    hasTextFocus(): boolean;
    getViewModel(): ViewModel | undefined;
    registerAndInstantiateContribution<T extends IEditorContribution>(id: string, ctor: new (editor: ICodeEditor, ...services: BrandedService[]) => T): T;
    registerDisposable(disposable: IDisposable): void;
}
export interface TestCodeEditorCreationOptions extends editorOptions.IEditorOptions {
    /**
     * If the editor has text focus.
     * Defaults to true.
     */
    hasTextFocus?: boolean;
    /**
     * Env configuration
     */
    envConfig?: ITestEnvConfiguration;
}
export interface TestCodeEditorInstantiationOptions extends TestCodeEditorCreationOptions {
    /**
     * Services to use.
     */
    serviceCollection?: ServiceCollection;
}
export interface ITestEnvConfiguration {
    extraEditorClassName?: string;
    outerWidth?: number;
    outerHeight?: number;
    emptySelectionClipboard?: boolean;
    pixelRatio?: number;
    accessibilitySupport?: AccessibilitySupport;
}
export declare function withTestCodeEditor(text: ITextModel | string | string[] | ITextBufferFactory, options: TestCodeEditorInstantiationOptions, callback: (editor: ITestCodeEditor, viewModel: ViewModel, instantiationService: TestInstantiationService) => void): void;
export declare function withAsyncTestCodeEditor(text: ITextModel | string | string[] | ITextBufferFactory, options: TestCodeEditorInstantiationOptions, callback: (editor: ITestCodeEditor, viewModel: ViewModel, instantiationService: TestInstantiationService) => Promise<void>): Promise<void>;
export declare function createCodeEditorServices(disposables: DisposableStore, services?: ServiceCollection): TestInstantiationService;
export declare function createTestCodeEditor(model: ITextModel | undefined, options?: TestCodeEditorInstantiationOptions): ITestCodeEditor;
export declare function instantiateTestCodeEditor(instantiationService: IInstantiationService, model: ITextModel | null, options?: TestCodeEditorCreationOptions): ITestCodeEditor;
