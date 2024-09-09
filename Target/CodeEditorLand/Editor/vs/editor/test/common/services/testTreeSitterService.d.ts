import type { Parser } from '@vscode/tree-sitter-wasm';
import { Event } from '../../../../base/common/event.js';
import { ITextModel } from '../../../common/model.js';
import { ITreeSitterParserService, ITreeSitterParseResult } from '../../../common/services/treeSitterParserService.js';
export declare class TestTreeSitterParserService implements ITreeSitterParserService {
    onDidAddLanguage: Event<{
        id: string;
        language: Parser.Language;
    }>;
    _serviceBrand: undefined;
    getOrInitLanguage(languageId: string): Parser.Language | undefined;
    waitForLanguage(languageId: string): Promise<Parser.Language | undefined>;
    getParseResult(textModel: ITextModel): ITreeSitterParseResult | undefined;
}
