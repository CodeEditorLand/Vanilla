import * as dom from "vs/base/browser/dom";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { ILayoutOffsetInfo, ILayoutService } from "vs/platform/layout/browser/layoutService";
declare class StandaloneLayoutService implements ILayoutService {
    private _codeEditorService;
    readonly _serviceBrand: undefined;
    readonly onDidLayoutMainContainer: any;
    readonly onDidLayoutActiveContainer: any;
    readonly onDidLayoutContainer: any;
    readonly onDidChangeActiveContainer: any;
    readonly onDidAddContainer: any;
    get mainContainer(): HTMLElement;
    get activeContainer(): HTMLElement;
    get mainContainerDimension(): dom.IDimension;
    get activeContainerDimension(): any;
    readonly mainContainerOffset: ILayoutOffsetInfo;
    readonly activeContainerOffset: ILayoutOffsetInfo;
    get containers(): Iterable<HTMLElement>;
    getContainer(): HTMLElement;
    whenContainerStylesLoaded(): undefined;
    focus(): void;
    constructor(_codeEditorService: ICodeEditorService);
}
export declare class EditorScopedLayoutService extends StandaloneLayoutService {
    private _container;
    get mainContainer(): HTMLElement;
    constructor(_container: HTMLElement, codeEditorService: ICodeEditorService);
}
export {};
