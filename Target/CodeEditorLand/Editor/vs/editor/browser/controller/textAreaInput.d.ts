import { IKeyboardEvent } from "vs/base/browser/keyboardEvent";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { OperatingSystem } from "vs/base/common/platform";
import { ITextAreaWrapper, ITypeData, TextAreaState } from "vs/editor/browser/controller/textAreaState";
import { Position } from "vs/editor/common/core/position";
import { Selection } from "vs/editor/common/core/selection";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { ILogService } from "vs/platform/log/common/log";
export declare namespace TextAreaSyntethicEvents {
    const Tap = "-monaco-textarea-synthetic-tap";
}
export interface ICompositionData {
    data: string;
}
export declare const CopyOptions: {
    forceCopyWithSyntaxHighlighting: boolean;
};
export interface IPasteData {
    text: string;
    metadata: ClipboardStoredMetadata | null;
}
export interface ClipboardDataToCopy {
    isFromEmptySelection: boolean;
    multicursorText: string[] | null | undefined;
    text: string;
    html: string | null | undefined;
    mode: string | null;
}
export interface ClipboardStoredMetadata {
    version: 1;
    isFromEmptySelection: boolean | undefined;
    multicursorText: string[] | null | undefined;
    mode: string | null;
}
export interface ITextAreaInputHost {
    getDataToCopy(): ClipboardDataToCopy;
    getScreenReaderContent(): TextAreaState;
    deduceModelPosition(viewAnchorPosition: Position, deltaOffset: number, lineFeedCnt: number): Position;
}
/**
 * Every time we write to the clipboard, we record a bit of extra metadata here.
 * Every time we read from the cipboard, if the text matches our last written text,
 * we can fetch the previous metadata.
 */
export declare class InMemoryClipboardMetadataManager {
    static readonly INSTANCE: InMemoryClipboardMetadataManager;
    private _lastState;
    constructor();
    set(lastCopiedValue: string, data: ClipboardStoredMetadata): void;
    get(pastedText: string): ClipboardStoredMetadata | null;
}
export interface ICompositionStartEvent {
    data: string;
}
export interface ICompleteTextAreaWrapper extends ITextAreaWrapper {
    readonly onKeyDown: Event<KeyboardEvent>;
    readonly onKeyPress: Event<KeyboardEvent>;
    readonly onKeyUp: Event<KeyboardEvent>;
    readonly onCompositionStart: Event<CompositionEvent>;
    readonly onCompositionUpdate: Event<CompositionEvent>;
    readonly onCompositionEnd: Event<CompositionEvent>;
    readonly onBeforeInput: Event<InputEvent>;
    readonly onInput: Event<InputEvent>;
    readonly onCut: Event<ClipboardEvent>;
    readonly onCopy: Event<ClipboardEvent>;
    readonly onPaste: Event<ClipboardEvent>;
    readonly onFocus: Event<FocusEvent>;
    readonly onBlur: Event<FocusEvent>;
    readonly onSyntheticTap: Event<void>;
    readonly ownerDocument: Document;
    setIgnoreSelectionChangeTime(reason: string): void;
    getIgnoreSelectionChangeTime(): number;
    resetSelectionChangeTime(): void;
    hasFocus(): boolean;
}
export interface IBrowser {
    isAndroid: boolean;
    isFirefox: boolean;
    isChrome: boolean;
    isSafari: boolean;
}
/**
 * Writes screen reader content to the textarea and is able to analyze its input events to generate:
 *  - onCut
 *  - onPaste
 *  - onType
 *
 * Composition events are generated for presentation purposes (composition input is reflected in onType).
 */
export declare class TextAreaInput extends Disposable {
    private readonly _host;
    private readonly _textArea;
    private readonly _OS;
    private readonly _browser;
    private readonly _accessibilityService;
    private readonly _logService;
    private _onFocus;
    readonly onFocus: Event<void>;
    private _onBlur;
    readonly onBlur: Event<void>;
    private _onKeyDown;
    readonly onKeyDown: Event<IKeyboardEvent>;
    private _onKeyUp;
    readonly onKeyUp: Event<IKeyboardEvent>;
    private _onCut;
    readonly onCut: Event<void>;
    private _onPaste;
    readonly onPaste: Event<IPasteData>;
    private _onType;
    readonly onType: Event<ITypeData>;
    private _onCompositionStart;
    readonly onCompositionStart: Event<ICompositionStartEvent>;
    private _onCompositionUpdate;
    readonly onCompositionUpdate: Event<ICompositionData>;
    private _onCompositionEnd;
    readonly onCompositionEnd: Event<void>;
    private _onSelectionChangeRequest;
    readonly onSelectionChangeRequest: Event<Selection>;
    private readonly _asyncTriggerCut;
    private readonly _asyncFocusGainWriteScreenReaderContent;
    private _textAreaState;
    get textAreaState(): TextAreaState;
    private _selectionChangeListener;
    private _hasFocus;
    private _currentComposition;
    constructor(_host: ITextAreaInputHost, _textArea: ICompleteTextAreaWrapper, _OS: OperatingSystem, _browser: IBrowser, _accessibilityService: IAccessibilityService, _logService: ILogService);
    _initializeFromTest(): void;
    private _installSelectionChangeListener;
    dispose(): void;
    focusTextArea(): void;
    isFocused(): boolean;
    refreshFocusState(): void;
    private _setHasFocus;
    private _setAndWriteTextAreaState;
    writeNativeTextAreaContent(reason: string): void;
    private _ensureClipboardGetsEditorSelection;
}
export declare const ClipboardEventUtils: {
    getTextData(clipboardData: DataTransfer): [string, ClipboardStoredMetadata | null];
    setTextData(clipboardData: DataTransfer, text: string, html: string | null | undefined, metadata: ClipboardStoredMetadata): void;
};
export declare class TextAreaWrapper extends Disposable implements ICompleteTextAreaWrapper {
    private readonly _actual;
    readonly onKeyDown: any;
    readonly onKeyPress: any;
    readonly onKeyUp: any;
    readonly onCompositionStart: any;
    readonly onCompositionUpdate: any;
    readonly onCompositionEnd: any;
    readonly onBeforeInput: any;
    readonly onInput: Event<InputEvent>;
    readonly onCut: any;
    readonly onCopy: any;
    readonly onPaste: any;
    readonly onFocus: any;
    readonly onBlur: any;
    get ownerDocument(): Document;
    private _onSyntheticTap;
    readonly onSyntheticTap: Event<void>;
    private _ignoreSelectionChangeTime;
    constructor(_actual: HTMLTextAreaElement);
    hasFocus(): boolean;
    setIgnoreSelectionChangeTime(reason: string): void;
    getIgnoreSelectionChangeTime(): number;
    resetSelectionChangeTime(): void;
    getValue(): string;
    setValue(reason: string, value: string): void;
    getSelectionStart(): number;
    getSelectionEnd(): number;
    setSelectionRange(reason: string, selectionStart: number, selectionEnd: number): void;
}
