import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
/**
 * This solves the problem that the editor layer cannot depend on the workbench layer.
 *
 * Maybe the multi diff editor widget should be moved to the workbench layer?
 * This would make monaco-editor consumption much more difficult though.
 */
export interface IWorkbenchUIElementFactory {
    createResourceLabel?(element: HTMLElement): IResourceLabel;
}
export interface IResourceLabel extends IDisposable {
    setUri(uri: URI | undefined, options?: IResourceLabelOptions): void;
}
export interface IResourceLabelOptions {
    strikethrough?: boolean;
}
