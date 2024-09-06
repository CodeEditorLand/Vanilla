import type { IGrammar } from "vscode-textmate";
export declare const ITextMateTokenizationService: any;
export interface ITextMateTokenizationService {
    readonly _serviceBrand: undefined;
    createTokenizer(languageId: string): Promise<IGrammar | null>;
    startDebugMode(printFn: (str: string) => void, onStop: () => void): void;
}
