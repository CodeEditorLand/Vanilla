var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { deepStrictEqual, strictEqual, throws } from "assert";
import { ensureNonNullable } from "../../../../../browser/gpu/gpuUtils.js";
import { TextureAtlasShelfAllocator } from "../../../../../browser/gpu/atlas/textureAtlasShelfAllocator.js";
import { TextureAtlasSlabAllocator } from "../../../../../browser/gpu/atlas/textureAtlasSlabAllocator.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../../base/test/common/utils.js";
import { assertIsValidGlyph } from "./testUtil.js";
import { BugIndicatingError } from "../../../../../../base/common/errors.js";
const blackArr = [0, 0, 0, 255];
const pixel1x1 = createRasterizedGlyph(1, 1, [...blackArr]);
const pixel2x1 = createRasterizedGlyph(2, 1, [...blackArr, ...blackArr]);
const pixel1x2 = createRasterizedGlyph(1, 2, [...blackArr, ...blackArr]);
function createRasterizedGlyph(w, h, data) {
  strictEqual(w * h * 4, data.length);
  const source = new OffscreenCanvas(w, h);
  const imageData = new ImageData(w, h);
  imageData.data.set(data);
  ensureNonNullable(source.getContext("2d")).putImageData(imageData, 0, 0);
  return {
    source,
    boundingBox: { top: 0, left: 0, bottom: h - 1, right: w - 1 },
    originOffset: { x: 0, y: 0 }
  };
}
__name(createRasterizedGlyph, "createRasterizedGlyph");
function allocateAndAssert(allocator, rasterizedGlyph, expected) {
  const actual = allocator.allocate(rasterizedGlyph);
  if (!actual) {
    strictEqual(actual, expected);
    return;
  }
  deepStrictEqual({
    x: actual.x,
    y: actual.y,
    w: actual.w,
    h: actual.h
  }, expected);
}
__name(allocateAndAssert, "allocateAndAssert");
function initShelfAllocator(w, h) {
  const canvas = new OffscreenCanvas(w, h);
  const allocator = new TextureAtlasShelfAllocator(canvas, 0);
  return { canvas, allocator };
}
__name(initShelfAllocator, "initShelfAllocator");
function initSlabAllocator(w, h, options) {
  const canvas = new OffscreenCanvas(w, h);
  const allocator = new TextureAtlasSlabAllocator(canvas, 0, options);
  return { canvas, allocator };
}
__name(initSlabAllocator, "initSlabAllocator");
const allocatorDefinitions = [
  { name: "shelf", initAllocator: initShelfAllocator },
  { name: "slab", initAllocator: initSlabAllocator }
];
suite("TextureAtlasAllocator", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  suite("shared tests", () => {
    for (const { name, initAllocator } of allocatorDefinitions) {
      test(`(${name}) single allocation`, () => {
        const { canvas, allocator } = initAllocator(2, 2);
        assertIsValidGlyph(allocator.allocate(pixel1x1), canvas);
      });
      test.skip(`(${name}) glyph too large for canvas`, () => {
        const { allocator } = initAllocator(1, 1);
        throws(() => allocateAndAssert(allocator, pixel2x1, void 0), new BugIndicatingError("Glyph is too large for the atlas page"));
      });
    }
  });
  suite("TextureAtlasShelfAllocator", () => {
    const initAllocator = initShelfAllocator;
    test("single allocation", () => {
      const { allocator } = initAllocator(2, 2);
      allocateAndAssert(allocator, pixel1x1, { x: 0, y: 0, w: 1, h: 1 });
    });
    test("wrapping", () => {
      const { allocator } = initAllocator(5, 4);
      allocateAndAssert(allocator, pixel1x1, { x: 0, y: 0, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x2, { x: 1, y: 0, w: 1, h: 2 });
      allocateAndAssert(allocator, pixel2x1, { x: 2, y: 0, w: 2, h: 1 });
      allocateAndAssert(allocator, pixel2x1, { x: 0, y: 2, w: 2, h: 1 });
      allocateAndAssert(allocator, pixel2x1, { x: 2, y: 2, w: 2, h: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 4, y: 2, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 0, y: 3, w: 1, h: 1 });
    });
    test("full", () => {
      const { allocator } = initAllocator(3, 2);
      allocateAndAssert(allocator, pixel1x2, { x: 0, y: 0, w: 1, h: 2 });
      allocateAndAssert(allocator, pixel2x1, { x: 1, y: 0, w: 2, h: 1 });
      allocateAndAssert(allocator, pixel1x1, void 0);
    });
  });
  suite("TextureAtlasSlabAllocator", () => {
    const initAllocator = initSlabAllocator;
    test("single allocation", () => {
      const { allocator } = initAllocator(2, 2);
      allocateAndAssert(allocator, pixel1x1, { x: 0, y: 0, w: 1, h: 1 });
    });
    test("single slab single glyph full", () => {
      const { allocator } = initAllocator(1, 1, { slabW: 1, slabH: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 0, y: 0, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, void 0);
    });
    test("single slab multiple glyph full", () => {
      const { allocator } = initAllocator(2, 2, { slabW: 2, slabH: 2 });
      allocateAndAssert(allocator, pixel1x2, { x: 0, y: 0, w: 1, h: 2 });
      allocateAndAssert(allocator, pixel1x2, { x: 1, y: 0, w: 1, h: 2 });
      allocateAndAssert(allocator, pixel1x2, void 0);
    });
    test("allocate 1x1 to multiple slabs until full", () => {
      const { allocator } = initAllocator(4, 2, { slabW: 2, slabH: 2 });
      allocateAndAssert(allocator, pixel1x1, { x: 0, y: 0, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 1, y: 0, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 0, y: 1, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 1, y: 1, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 2, y: 0, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 3, y: 0, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 2, y: 1, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 3, y: 1, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x1, void 0);
    });
    test("glyph too large for slab (increase slab size for first glyph)", () => {
      const { allocator } = initAllocator(2, 2, { slabW: 1, slabH: 1 });
      allocateAndAssert(allocator, pixel2x1, { x: 0, y: 0, w: 2, h: 1 });
    });
    test("glyph too large for slab (undefined as it's not the first glyph)", () => {
      const { allocator } = initAllocator(2, 2, { slabW: 1, slabH: 1 });
      allocateAndAssert(allocator, pixel1x1, { x: 0, y: 0, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel2x1, void 0);
    });
    test("separate slabs for different sized glyphs", () => {
      const { allocator } = initAllocator(4, 2, { slabW: 2, slabH: 2 });
      allocateAndAssert(allocator, pixel1x1, { x: 0, y: 0, w: 1, h: 1 });
      allocateAndAssert(allocator, pixel1x2, { x: 2, y: 0, w: 1, h: 2 });
      allocateAndAssert(allocator, pixel1x2, { x: 3, y: 0, w: 1, h: 2 });
      allocateAndAssert(allocator, pixel1x1, { x: 1, y: 0, w: 1, h: 1 });
    });
  });
});
//# sourceMappingURL=textureAtlasAllocator.test.js.map
