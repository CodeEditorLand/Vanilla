import "vs/css!./media/keybindings";
import * as dom from "vs/base/browser/dom";
import { Widget } from "vs/base/browser/ui/widget";
import { Event } from "vs/base/common/event";
import { ResolvedKeybinding } from "vs/base/common/keybindings";
import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from "vs/editor/browser/editorBrowser";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { SearchOptions, SearchWidget } from "vs/workbench/contrib/preferences/browser/preferencesWidgets";
export interface KeybindingsSearchOptions extends SearchOptions {
    recordEnter?: boolean;
    quoteRecordedKeys?: boolean;
}
export declare class KeybindingsSearchWidget extends SearchWidget {
    private _chords;
    private _inputValue;
    private readonly recordDisposables;
    private _onKeybinding;
    readonly onKeybinding: Event<ResolvedKeybinding[] | null>;
    private _onEnter;
    readonly onEnter: Event<void>;
    private _onEscape;
    readonly onEscape: Event<void>;
    private _onBlur;
    readonly onBlur: Event<void>;
    constructor(parent: HTMLElement, options: KeybindingsSearchOptions, contextViewService: IContextViewService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService);
    clear(): void;
    startRecordingKeys(): void;
    stopRecordingKeys(): void;
    setInputValue(value: string): void;
    private _onKeyDown;
    private printKeybinding;
}
export declare class DefineKeybindingWidget extends Widget {
    private readonly instantiationService;
    private static readonly WIDTH;
    private static readonly HEIGHT;
    private _domNode;
    private _keybindingInputWidget;
    private _outputNode;
    private _showExistingKeybindingsNode;
    private readonly _keybindingDisposables;
    private _chords;
    private _isVisible;
    private _onHide;
    private _onDidChange;
    onDidChange: Event<string>;
    private _onShowExistingKeybindings;
    readonly onShowExistingKeybidings: Event<string | null>;
    constructor(parent: HTMLElement | null, instantiationService: IInstantiationService);
    get domNode(): HTMLElement;
    define(): Promise<string | null>;
    layout(layout: dom.Dimension): void;
    printExisting(numberOfExisting: number): void;
    private onKeybinding;
    private getUserSettingsLabel;
    private onCancel;
    private clearOrHide;
    private hide;
}
export declare class DefineKeybindingOverlayWidget extends Disposable implements IOverlayWidget {
    private _editor;
    private static readonly ID;
    private readonly _widget;
    constructor(_editor: ICodeEditor, instantiationService: IInstantiationService);
    getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IOverlayWidgetPosition;
    dispose(): void;
    start(): Promise<string | null>;
}
