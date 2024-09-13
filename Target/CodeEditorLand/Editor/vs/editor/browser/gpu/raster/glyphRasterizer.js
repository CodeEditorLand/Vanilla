var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Disposable } from "../../../../base/common/lifecycle.js";
import { StringBuilder } from "../../../common/core/stringBuilder.js";
import {
  FontStyle,
  TokenMetadata
} from "../../../common/encodedTokenAttributes.js";
import { ensureNonNullable } from "../gpuUtils.js";
let nextId = 0;
class GlyphRasterizer extends Disposable {
  constructor(_fontSize, _fontFamily) {
    super();
    this._fontSize = _fontSize;
    this._fontFamily = _fontFamily;
    this._canvas = new OffscreenCanvas(
      this._fontSize * 3,
      this._fontSize * 3
    );
    this._ctx = ensureNonNullable(
      this._canvas.getContext("2d", {
        willReadFrequently: true
      })
    );
    this._ctx.textBaseline = "top";
    this._ctx.fillStyle = "#FFFFFF";
  }
  static {
    __name(this, "GlyphRasterizer");
  }
  id = nextId++;
  _canvas;
  _ctx;
  _workGlyph = {
    source: null,
    boundingBox: {
      left: 0,
      bottom: 0,
      right: 0,
      top: 0
    },
    originOffset: {
      x: 0,
      y: 0
    }
  };
  _workGlyphConfig = { chars: void 0, metadata: 0 };
  // TODO: Support drawing multiple fonts and sizes
  /**
   * Rasterizes a glyph. Note that the returned object is reused across different glyphs and
   * therefore is only safe for synchronous access.
   */
  rasterizeGlyph(chars, metadata, colorMap) {
    if (chars === "") {
      return {
        source: this._canvas,
        boundingBox: { top: 0, left: 0, bottom: -1, right: -1 },
        originOffset: { x: 0, y: 0 }
      };
    }
    if (this._workGlyphConfig.chars === chars && this._workGlyphConfig.metadata === metadata) {
      return this._workGlyph;
    }
    this._workGlyphConfig.chars = chars;
    this._workGlyphConfig.metadata = metadata;
    return this._rasterizeGlyph(chars, metadata, colorMap);
  }
  _rasterizeGlyph(chars, metadata, colorMap) {
    this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
    const fontSb = new StringBuilder(200);
    const fontStyle = TokenMetadata.getFontStyle(metadata);
    if (fontStyle & FontStyle.Italic) {
      fontSb.appendString("italic ");
    }
    if (fontStyle & FontStyle.Bold) {
      fontSb.appendString("bold ");
    }
    fontSb.appendString(`${this._fontSize}px ${this._fontFamily}`);
    this._ctx.font = fontSb.build();
    const originX = this._fontSize;
    const originY = this._fontSize;
    this._ctx.fillStyle = colorMap[TokenMetadata.getForeground(metadata)];
    this._ctx.fillText(chars, originX, originY);
    const imageData = this._ctx.getImageData(
      0,
      0,
      this._canvas.width,
      this._canvas.height
    );
    this._findGlyphBoundingBox(imageData, this._workGlyph.boundingBox);
    this._workGlyph.source = this._canvas;
    this._workGlyph.originOffset.x = this._workGlyph.boundingBox.left - originX;
    this._workGlyph.originOffset.y = this._workGlyph.boundingBox.top - originY;
    return this._workGlyph;
  }
  // TODO: Does this even need to happen when measure text is used?
  _findGlyphBoundingBox(imageData, outBoundingBox) {
    const height = this._canvas.height;
    const width = this._canvas.width;
    let found = false;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alphaOffset = y * width * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          outBoundingBox.top = y;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    outBoundingBox.left = 0;
    found = false;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const alphaOffset = y * width * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          outBoundingBox.left = x;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    outBoundingBox.right = width;
    found = false;
    for (let x = width - 1; x >= outBoundingBox.left; x--) {
      for (let y = 0; y < height; y++) {
        const alphaOffset = y * width * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          outBoundingBox.right = x;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    outBoundingBox.bottom = outBoundingBox.top;
    found = false;
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const alphaOffset = y * width * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          outBoundingBox.bottom = y;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
  }
}
export {
  GlyphRasterizer
};
//# sourceMappingURL=glyphRasterizer.js.map
