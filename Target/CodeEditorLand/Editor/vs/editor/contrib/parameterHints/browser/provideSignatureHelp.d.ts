import { CancellationToken } from "vs/base/common/cancellation";
import { Position } from "vs/editor/common/core/position";
import { LanguageFeatureRegistry } from "vs/editor/common/languageFeatureRegistry";
import * as languages from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
export declare const Context: {
    Visible: any;
    MultipleSignatures: any;
};
export declare function provideSignatureHelp(registry: LanguageFeatureRegistry<languages.SignatureHelpProvider>, model: ITextModel, position: Position, context: languages.SignatureHelpContext, token: CancellationToken): Promise<languages.SignatureHelpResult | undefined>;
