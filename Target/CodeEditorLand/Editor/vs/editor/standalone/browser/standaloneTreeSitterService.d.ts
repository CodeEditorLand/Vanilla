import type { Parser } from '@vscode/tree-sitter-wasm';
import { Event } from '../../../base/common/event.js';
import { ITextModel } from '../../common/model.js';
import { ITreeSitterParseResult, ITreeSitterParserService } from '../../common/services/treeSitterParserService.js';
/**
 * The monaco build doesn't like the dynamic import of tree sitter in the real service.
 * We use a dummy sertive here to make the build happy.
 */
export declare class StandaloneTreeSitterParserService implements ITreeSitterParserService {
    readonly _serviceBrand: undefined;
    onDidAddLanguage: Event<{
        id: string;
        language: Parser.Language;
    }>;
    getOrInitLanguage(_languageId: string): Parser.Language | undefined;
    getParseResult(textModel: ITextModel): ITreeSitterParseResult | undefined;
}
