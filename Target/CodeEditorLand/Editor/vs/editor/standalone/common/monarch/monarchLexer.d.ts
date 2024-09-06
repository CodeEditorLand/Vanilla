/**
 * Create a syntax highighter with a fully declarative JSON style lexer description
 * using regular expressions.
 */
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import * as languages from "vs/editor/common/languages";
import { ILanguageService } from "vs/editor/common/languages/language";
import * as monarchCommon from "vs/editor/standalone/common/monarch/monarchCommon";
import { IStandaloneThemeService } from "vs/editor/standalone/common/standaloneTheme";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
export type ILoadStatus = {
    loaded: true;
} | {
    loaded: false;
    promise: Promise<void>;
};
export declare class MonarchTokenizer extends Disposable implements languages.ITokenizationSupport, IDisposable {
    private readonly _configurationService;
    private readonly _languageService;
    private readonly _standaloneThemeService;
    private readonly _languageId;
    private readonly _lexer;
    private readonly _embeddedLanguages;
    embeddedLoaded: Promise<void>;
    private _maxTokenizationLineLength;
    constructor(languageService: ILanguageService, standaloneThemeService: IStandaloneThemeService, languageId: string, lexer: monarchCommon.ILexer, _configurationService: IConfigurationService);
    getLoadStatus(): ILoadStatus;
    getInitialState(): languages.IState;
    tokenize(line: string, hasEOL: boolean, lineState: languages.IState): languages.TokenizationResult;
    tokenizeEncoded(line: string, hasEOL: boolean, lineState: languages.IState): languages.EncodedTokenizationResult;
    private _tokenize;
    private _findLeavingNestedLanguageOffset;
    private _nestedTokenize;
    private _safeRuleName;
    private _myTokenize;
    private _getNestedEmbeddedLanguageData;
}
