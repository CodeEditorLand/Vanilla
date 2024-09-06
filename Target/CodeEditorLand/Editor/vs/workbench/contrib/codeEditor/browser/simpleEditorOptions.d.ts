import { IDisposable } from "vs/base/common/lifecycle";
import { ICodeEditorWidgetOptions } from "vs/editor/browser/widget/codeEditor/codeEditorWidget";
import { IEditorOptions } from "vs/editor/common/config/editorOptions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
export declare function getSimpleEditorOptions(configurationService: IConfigurationService): IEditorOptions;
export declare function getSimpleCodeEditorWidgetOptions(): ICodeEditorWidgetOptions;
/**
 * Should be called to set the styling on editors that are appearing as just input boxes
 * @param editorContainerSelector An element selector that will match the container of the editor
 */
export declare function setupSimpleEditorSelectionStyling(editorContainerSelector: string): IDisposable;
