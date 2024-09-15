var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { LineTokens } from "../../common/tokens/lineTokens.js";
import { StandardTokenType, MetadataConsts } from "../../common/encodedTokenAttributes.js";
import { ScopedLineTokens, createScopedLineTokens } from "../../common/languages/supports.js";
import { LanguageIdCodec } from "../../common/services/languagesRegistry.js";
function createFakeScopedLineTokens(rawTokens) {
  const tokens = new Uint32Array(rawTokens.length << 1);
  let line = "";
  for (let i = 0, len = rawTokens.length; i < len; i++) {
    const rawToken = rawTokens[i];
    const startOffset = line.length;
    const metadata = rawToken.type << MetadataConsts.TOKEN_TYPE_OFFSET >>> 0;
    tokens[i << 1] = startOffset;
    tokens[(i << 1) + 1] = metadata;
    line += rawToken.text;
  }
  LineTokens.convertToEndOffset(tokens, line.length);
  return createScopedLineTokens(new LineTokens(tokens, line, new LanguageIdCodec()), 0);
}
__name(createFakeScopedLineTokens, "createFakeScopedLineTokens");
export {
  createFakeScopedLineTokens
};
//# sourceMappingURL=modesTestUtils.js.map
