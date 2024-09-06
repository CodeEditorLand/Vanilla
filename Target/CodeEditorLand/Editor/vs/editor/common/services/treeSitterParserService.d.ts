import type { Parser } from "@vscode/tree-sitter-wasm";
import { Event } from "vs/base/common/event";
import { ITextModel } from "vs/editor/common/model";
export declare const EDITOR_EXPERIMENTAL_PREFER_TREESITTER = "editor.experimental.preferTreeSitter";
export declare const ITreeSitterParserService: any;
export interface ITreeSitterParserService {
    readonly _serviceBrand: undefined;
    onDidAddLanguage: Event<{
        id: string;
        language: Parser.Language;
    }>;
    getOrInitLanguage(languageId: string): Parser.Language | undefined;
    getParseResult(textModel: ITextModel): ITreeSitterParseResult | undefined;
}
export interface ITreeSitterParseResult {
    readonly tree: Parser.Tree | undefined;
    readonly language: Parser.Language;
}
