import * as dom from "vs/base/browser/dom";
import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IDiffEditorOptions } from "vs/editor/common/config/editorOptions";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { IViewDescriptorService } from "vs/workbench/common/views";
import { ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { InspectSubject } from "vs/workbench/contrib/testing/browser/testResultsView/testResultsSubject";
export interface IPeekOutputRenderer extends IDisposable {
    onDidContentSizeChange?: Event<void>;
    /** Updates the displayed test. Should clear if it cannot display the test. */
    update(subject: InspectSubject): Promise<boolean>;
    /** Recalculate content layout. Returns the height it should be rendered at. */
    layout(dimension: dom.IDimension, hasMultipleFrames: boolean): number | undefined;
    /** Dispose the content provider. */
    dispose(): void;
}
export declare class DiffContentProvider extends Disposable implements IPeekOutputRenderer {
    private readonly editor;
    private readonly container;
    private readonly instantiationService;
    private readonly modelService;
    private readonly widget;
    private readonly model;
    private dimension?;
    get onDidContentSizeChange(): any;
    constructor(editor: ICodeEditor | undefined, container: HTMLElement, instantiationService: IInstantiationService, modelService: ITextModelService);
    update(subject: InspectSubject): Promise<boolean>;
    private clear;
    layout(dimensions: dom.IDimension, hasMultipleFrames: boolean): any;
    protected getOptions(isMultiline: boolean): IDiffEditorOptions;
}
export declare class MarkdownTestMessagePeek extends Disposable implements IPeekOutputRenderer {
    private readonly container;
    private readonly instantiationService;
    private readonly markdown;
    private element?;
    constructor(container: HTMLElement, instantiationService: IInstantiationService);
    update(subject: InspectSubject): Promise<boolean>;
    layout(dimension: dom.IDimension): number | undefined;
    private clear;
}
export declare class PlainTextMessagePeek extends Disposable implements IPeekOutputRenderer {
    private readonly editor;
    private readonly container;
    private readonly instantiationService;
    private readonly modelService;
    private readonly widgetDecorations;
    private readonly widget;
    private readonly model;
    private dimension?;
    get onDidContentSizeChange(): any;
    constructor(editor: ICodeEditor | undefined, container: HTMLElement, instantiationService: IInstantiationService, modelService: ITextModelService);
    update(subject: InspectSubject): Promise<boolean>;
    private clear;
    layout(dimensions: dom.IDimension, hasMultipleFrames: boolean): any;
}
export declare class TerminalMessagePeek extends Disposable implements IPeekOutputRenderer {
    private readonly container;
    private readonly isInPeekView;
    private readonly terminalService;
    private readonly viewDescriptorService;
    private readonly workspaceContext;
    private dimensions?;
    private readonly terminalCwd;
    private readonly xtermLayoutDelayer;
    /** Active terminal instance. */
    private readonly terminal;
    /** Listener for streaming result data */
    private readonly outputDataListener;
    constructor(container: HTMLElement, isInPeekView: boolean, terminalService: ITerminalService, viewDescriptorService: IViewDescriptorService, workspaceContext: IWorkspaceContextService);
    private makeTerminal;
    update(subject: InspectSubject): Promise<boolean>;
    private updateForTestSubject;
    private updateForTaskSubject;
    private updateGenerically;
    private updateCwd;
    private writeNotice;
    private attachTerminalToDom;
    private clear;
    layout(dimensions: dom.IDimension): any;
    private layoutTerminal;
}
