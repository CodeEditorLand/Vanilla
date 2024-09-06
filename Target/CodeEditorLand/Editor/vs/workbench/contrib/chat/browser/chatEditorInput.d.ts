import { Disposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import { URI } from "vs/base/common/uri";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { EditorInputCapabilities, IEditorSerializer, IUntypedEditorInput } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import type { IChatEditorOptions } from "vs/workbench/contrib/chat/browser/chatEditor";
import { IChatModel } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatService } from "vs/workbench/contrib/chat/common/chatService";
export declare class ChatEditorInput extends EditorInput {
    readonly resource: URI;
    readonly options: IChatEditorOptions;
    private readonly chatService;
    static readonly countsInUse: Set<number>;
    static readonly TypeID: string;
    static readonly EditorID: string;
    private readonly inputCount;
    sessionId: string | undefined;
    private model;
    static getNewEditorUri(): URI;
    static getNextCount(): number;
    constructor(resource: URI, options: IChatEditorOptions, chatService: IChatService);
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    get typeId(): string;
    getName(): string;
    getIcon(): ThemeIcon;
    resolve(): Promise<ChatEditorModel | null>;
    dispose(): void;
}
export declare class ChatEditorModel extends Disposable {
    readonly model: IChatModel;
    private _onWillDispose;
    readonly onWillDispose: any;
    private _isDisposed;
    private _isResolved;
    constructor(model: IChatModel);
    resolve(): Promise<void>;
    isResolved(): boolean;
    isDisposed(): boolean;
    dispose(): void;
}
export declare namespace ChatUri {
    const scheme: any;
    function generate(handle: number): URI;
    function parse(resource: URI): {
        handle: number;
    } | undefined;
}
export declare class ChatEditorInputSerializer implements IEditorSerializer {
    canSerialize(input: EditorInput): input is ChatEditorInput & {
        readonly sessionId: string;
    };
    serialize(input: EditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditor: string): EditorInput | undefined;
}
