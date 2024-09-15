var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { strictEqual, throws } from "assert";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { ensureNonNullable } from "../../../../../browser/gpu/gpuUtils.js";
import { TextureAtlas } from "../../../../../browser/gpu/atlas/textureAtlas.js";
import { createCodeEditorServices } from "../../../testCodeEditor.js";
import { assertIsValidGlyph } from "./testUtil.js";
import { TextureAtlasSlabAllocator } from "../../../../../browser/gpu/atlas/textureAtlasSlabAllocator.js";
const blackInt = 255;
let lastUniqueGlyph;
function getUniqueGlyphId() {
  if (!lastUniqueGlyph) {
    lastUniqueGlyph = "a";
  } else {
    lastUniqueGlyph = String.fromCharCode(lastUniqueGlyph.charCodeAt(0) + 1);
  }
  return [lastUniqueGlyph, blackInt];
}
__name(getUniqueGlyphId, "getUniqueGlyphId");
class TestGlyphRasterizer {
  static {
    __name(this, "TestGlyphRasterizer");
  }
  id = 0;
  cacheKey = "";
  nextGlyphColor = [0, 0, 0, 0];
  nextGlyphDimensions = [0, 0];
  rasterizeGlyph(chars, metadata, colorMap) {
    const w = this.nextGlyphDimensions[0];
    const h = this.nextGlyphDimensions[1];
    if (w === 0 || h === 0) {
      throw new Error("TestGlyphRasterizer.nextGlyphDimensions must be set to a non-zero value before calling rasterizeGlyph");
    }
    const imageData = new ImageData(w, h);
    let i = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const [r, g, b, a] = this.nextGlyphColor;
        i = (y * w + x) * 4;
        imageData.data[i + 0] = r;
        imageData.data[i + 1] = g;
        imageData.data[i + 2] = b;
        imageData.data[i + 3] = a;
      }
    }
    const canvas = new OffscreenCanvas(w, h);
    const ctx = ensureNonNullable(canvas.getContext("2d"));
    ctx.putImageData(imageData, 0, 0);
    return {
      source: canvas,
      boundingBox: { top: 0, left: 0, bottom: h - 1, right: w - 1 },
      originOffset: { x: 0, y: 0 }
    };
  }
}
suite("TextureAtlas", () => {
  const store = ensureNoDisposablesAreLeakedInTestSuite();
  suiteSetup(() => {
    lastUniqueGlyph = void 0;
  });
  let instantiationService;
  let atlas;
  let glyphRasterizer;
  setup(() => {
    instantiationService = createCodeEditorServices(store);
    atlas = store.add(instantiationService.createInstance(TextureAtlas, 2, void 0));
    glyphRasterizer = new TestGlyphRasterizer();
    glyphRasterizer.nextGlyphDimensions = [1, 1];
    glyphRasterizer.nextGlyphColor = [0, 0, 0, 255];
  });
  test("get single glyph", () => {
    assertIsValidGlyph(atlas.getGlyph(glyphRasterizer, ...getUniqueGlyphId()), atlas);
  });
  test("get multiple glyphs", () => {
    atlas = store.add(instantiationService.createInstance(TextureAtlas, 32, void 0));
    for (let i = 0; i < 10; i++) {
      assertIsValidGlyph(atlas.getGlyph(glyphRasterizer, ...getUniqueGlyphId()), atlas);
    }
  });
  test("adding glyph to full page creates new page", () => {
    let pageCount;
    for (let i = 0; i < 4; i++) {
      assertIsValidGlyph(atlas.getGlyph(glyphRasterizer, ...getUniqueGlyphId()), atlas);
      if (pageCount === void 0) {
        pageCount = atlas.pages.length;
      } else {
        strictEqual(atlas.pages.length, pageCount, "the number of pages should not change when the page is being filled");
      }
    }
    assertIsValidGlyph(atlas.getGlyph(glyphRasterizer, ...getUniqueGlyphId()), atlas);
    strictEqual(atlas.pages.length, pageCount + 1, "the 5th glyph should overflow to a new page");
  });
  test("adding a glyph larger than the atlas", () => {
    glyphRasterizer.nextGlyphDimensions = [3, 2];
    throws(() => atlas.getGlyph(glyphRasterizer, ...getUniqueGlyphId()), "should throw when the glyph is too large, this should not happen in practice");
  });
  test("adding a glyph larger than the standard slab size", () => {
    glyphRasterizer.nextGlyphDimensions = [2, 2];
    atlas = store.add(instantiationService.createInstance(TextureAtlas, 32, {
      allocatorType: /* @__PURE__ */ __name((canvas, textureIndex) => new TextureAtlasSlabAllocator(canvas, textureIndex, { slabW: 1, slabH: 1 }), "allocatorType")
    }));
    assertIsValidGlyph(atlas.getGlyph(glyphRasterizer, ...getUniqueGlyphId()), atlas);
  });
  test("adding a non-first glyph larger than the standard slab size, causing an overflow to a new page", () => {
    atlas = store.add(instantiationService.createInstance(TextureAtlas, 2, {
      allocatorType: /* @__PURE__ */ __name((canvas, textureIndex) => new TextureAtlasSlabAllocator(canvas, textureIndex, { slabW: 1, slabH: 1 }), "allocatorType")
    }));
    assertIsValidGlyph(atlas.getGlyph(glyphRasterizer, ...getUniqueGlyphId()), atlas);
    strictEqual(atlas.pages.length, 1);
    glyphRasterizer.nextGlyphDimensions = [2, 2];
    assertIsValidGlyph(atlas.getGlyph(glyphRasterizer, ...getUniqueGlyphId()), atlas);
    strictEqual(atlas.pages.length, 2, "the 2nd glyph should overflow to a new page with a larger slab size");
  });
});
//# sourceMappingURL=textureAtlas.test.js.map
