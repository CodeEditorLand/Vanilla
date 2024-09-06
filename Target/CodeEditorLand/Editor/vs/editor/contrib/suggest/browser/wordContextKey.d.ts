import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
export declare class WordContextKey {
    private readonly _editor;
    static readonly AtEnd: any;
    private readonly _ckAtEnd;
    private readonly _configListener;
    private _enabled;
    private _selectionListener?;
    constructor(_editor: ICodeEditor, contextKeyService: IContextKeyService);
    dispose(): void;
    private _update;
}
