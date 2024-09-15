var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { fail, ok } from "assert";
import { TextureAtlas } from "../../../../../browser/gpu/atlas/textureAtlas.js";
import { isNumber } from "../../../../../../base/common/types.js";
import { ensureNonNullable } from "../../../../../browser/gpu/gpuUtils.js";
function assertIsValidGlyph(glyph, atlasOrSource) {
  if (glyph === void 0) {
    fail("glyph is undefined");
  }
  const pageW = atlasOrSource instanceof TextureAtlas ? atlasOrSource.pageSize : atlasOrSource.width;
  const pageH = atlasOrSource instanceof TextureAtlas ? atlasOrSource.pageSize : atlasOrSource.width;
  const source = atlasOrSource instanceof TextureAtlas ? atlasOrSource.pages[glyph.pageIndex].source : atlasOrSource;
  ok(isNumber(glyph.x));
  ok(glyph.x >= 0);
  ok(glyph.x < pageW);
  ok(isNumber(glyph.y));
  ok(glyph.y >= 0);
  ok(glyph.y < pageH);
  ok(isNumber(glyph.w));
  ok(glyph.w > 0);
  ok(glyph.w <= pageW);
  ok(isNumber(glyph.h));
  ok(glyph.h > 0);
  ok(glyph.h <= pageH);
  ok(isNumber(glyph.originOffsetX));
  ok(isNumber(glyph.originOffsetY));
  ok(glyph.x + glyph.w <= pageW);
  ok(glyph.y + glyph.h <= pageH);
  const ctx = ensureNonNullable(source.getContext("2d"));
  const edges = [
    ctx.getImageData(glyph.x, glyph.y, glyph.w, 1).data,
    ctx.getImageData(glyph.x, glyph.y + glyph.h - 1, glyph.w, 1).data,
    ctx.getImageData(glyph.x, glyph.y, 1, glyph.h).data,
    ctx.getImageData(glyph.x + glyph.w - 1, glyph.y, 1, glyph.h).data
  ];
  for (const edge of edges) {
    ok(edge.some((color) => (color & 255) !== 0));
  }
}
__name(assertIsValidGlyph, "assertIsValidGlyph");
export {
  assertIsValidGlyph
};
//# sourceMappingURL=testUtil.js.map
