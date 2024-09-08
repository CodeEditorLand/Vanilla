import { CancellationToken } from "../../../../base/common/cancellation.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { Position } from "../../../common/core/position.js";
import type { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import * as languages from "../../../common/languages.js";
import type { ITextModel } from "../../../common/model.js";
export declare const Context: {
    Visible: RawContextKey<boolean>;
    MultipleSignatures: RawContextKey<boolean>;
};
export declare function provideSignatureHelp(registry: LanguageFeatureRegistry<languages.SignatureHelpProvider>, model: ITextModel, position: Position, context: languages.SignatureHelpContext, token: CancellationToken): Promise<languages.SignatureHelpResult | undefined>;
