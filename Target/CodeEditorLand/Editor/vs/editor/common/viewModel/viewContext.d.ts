import { IColorTheme } from "../../../platform/theme/common/themeService.js";
import { IEditorConfiguration } from "../config/editorConfiguration.js";
import { EditorTheme } from "../editorTheme.js";
import { ViewEventHandler } from "../viewEventHandler.js";
import { IViewLayout, IViewModel } from "../viewModel.js";
export declare class ViewContext {
    readonly configuration: IEditorConfiguration;
    readonly viewModel: IViewModel;
    readonly viewLayout: IViewLayout;
    readonly theme: EditorTheme;
    constructor(configuration: IEditorConfiguration, theme: IColorTheme, model: IViewModel);
    addEventHandler(eventHandler: ViewEventHandler): void;
    removeEventHandler(eventHandler: ViewEventHandler): void;
}
