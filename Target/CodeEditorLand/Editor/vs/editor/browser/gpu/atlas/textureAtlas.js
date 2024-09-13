var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { getActiveWindow } from "../../../../base/browser/dom.js";
import { CharCode } from "../../../../base/common/charCode.js";
import { Event } from "../../../../base/common/event.js";
import {
  Disposable,
  MutableDisposable,
  dispose,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { TwoKeyMap } from "../../../../base/common/map.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { MetadataConsts } from "../../../common/encodedTokenAttributes.js";
import { GlyphRasterizer } from "../raster/glyphRasterizer.js";
import { IdleTaskQueue } from "../taskQueue.js";
import { TextureAtlasPage } from "./textureAtlasPage.js";
let TextureAtlas = class extends Disposable {
  constructor(_maxTextureSize, options, _themeService, _instantiationService) {
    super();
    this._maxTextureSize = _maxTextureSize;
    this._themeService = _themeService;
    this._instantiationService = _instantiationService;
    this._allocatorType = options?.allocatorType ?? "slab";
    this._register(Event.runAndSubscribe(this._themeService.onDidColorThemeChange, () => {
      this._colorMap = this._themeService.getColorTheme().tokenColorMap;
    }));
    const dprFactor = Math.max(1, Math.floor(getActiveWindow().devicePixelRatio));
    this.pageSize = Math.min(1024 * dprFactor, this._maxTextureSize);
    const firstPage = this._instantiationService.createInstance(TextureAtlasPage, 0, this.pageSize, this._allocatorType);
    this._pages.push(firstPage);
    const nullRasterizer = new GlyphRasterizer(1, "");
    firstPage.getGlyph(nullRasterizer, "", 0);
    nullRasterizer.dispose();
    this._register(toDisposable(() => dispose(this._pages)));
  }
  static {
    __name(this, "TextureAtlas");
  }
  _colorMap;
  _warmUpTask = this._register(new MutableDisposable());
  _warmedUpRasterizers = /* @__PURE__ */ new Set();
  _allocatorType;
  /**
   * The main texture atlas pages which are both larger textures and more efficiently packed
   * relative to the scratch page. The idea is the main pages are drawn to and uploaded to the GPU
   * much less frequently so as to not drop frames.
   */
  _pages = [];
  get pages() {
    return this._pages;
  }
  pageSize;
  /**
   * A maps of glyph keys to the page to start searching for the glyph. This is set before
   * searching to have as little runtime overhead (branching, intermediate variables) as possible,
   * so it is not guaranteed to be the actual page the glyph is on. But it is guaranteed that all
   * pages with a lower index do not contain the glyph.
   */
  _glyphPageIndex = new TwoKeyMap();
  getGlyph(rasterizer, chars, metadata) {
    metadata &= ~(MetadataConsts.LANGUAGEID_MASK | MetadataConsts.TOKEN_TYPE_MASK | MetadataConsts.BALANCED_BRACKETS_MASK);
    if (!this._warmedUpRasterizers.has(rasterizer.id)) {
      this._warmUpAtlas(rasterizer);
      this._warmedUpRasterizers.add(rasterizer.id);
    }
    return this._tryGetGlyph(
      this._glyphPageIndex.get(chars, metadata) ?? 0,
      rasterizer,
      chars,
      metadata
    );
  }
  _tryGetGlyph(pageIndex, rasterizer, chars, metadata) {
    this._glyphPageIndex.set(chars, metadata, pageIndex);
    return this._pages[pageIndex].getGlyph(rasterizer, chars, metadata) ?? (pageIndex + 1 < this._pages.length ? this._tryGetGlyph(pageIndex + 1, rasterizer, chars, metadata) : void 0) ?? this._getGlyphFromNewPage(rasterizer, chars, metadata);
  }
  _getGlyphFromNewPage(rasterizer, chars, metadata) {
    this._pages.push(
      this._instantiationService.createInstance(
        TextureAtlasPage,
        this._pages.length,
        this.pageSize,
        this._allocatorType
      )
    );
    this._glyphPageIndex.set(chars, metadata, this._pages.length - 1);
    return this._pages[this._pages.length - 1].getGlyph(
      rasterizer,
      chars,
      metadata
    );
  }
  getUsagePreview() {
    return Promise.all(this._pages.map((e) => e.getUsagePreview()));
  }
  getStats() {
    return this._pages.map((e) => e.getStats());
  }
  /**
   * Warms up the atlas by rasterizing all printable ASCII characters for each token color. This
   * is distrubuted over multiple idle callbacks to avoid blocking the main thread.
   */
  _warmUpAtlas(rasterizer) {
    this._warmUpTask.value?.clear();
    const taskQueue = this._warmUpTask.value = new IdleTaskQueue();
    for (let code = CharCode.A; code <= CharCode.Z; code++) {
      taskQueue.enqueue(() => {
        for (const fgColor of this._colorMap.keys()) {
          this.getGlyph(
            rasterizer,
            String.fromCharCode(code),
            fgColor << MetadataConsts.FOREGROUND_OFFSET & MetadataConsts.FOREGROUND_MASK
          );
        }
      });
    }
    for (let code = CharCode.a; code <= CharCode.z; code++) {
      taskQueue.enqueue(() => {
        for (const fgColor of this._colorMap.keys()) {
          this.getGlyph(
            rasterizer,
            String.fromCharCode(code),
            fgColor << MetadataConsts.FOREGROUND_OFFSET & MetadataConsts.FOREGROUND_MASK
          );
        }
      });
    }
    for (let code = CharCode.ExclamationMark; code <= CharCode.Tilde; code++) {
      taskQueue.enqueue(() => {
        for (const fgColor of this._colorMap.keys()) {
          this.getGlyph(
            rasterizer,
            String.fromCharCode(code),
            fgColor << MetadataConsts.FOREGROUND_OFFSET & MetadataConsts.FOREGROUND_MASK
          );
        }
      });
    }
  }
};
TextureAtlas = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService)
], TextureAtlas);
export {
  TextureAtlas
};
//# sourceMappingURL=textureAtlas.js.map
