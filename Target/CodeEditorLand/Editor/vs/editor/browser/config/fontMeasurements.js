import { getWindowId } from "../../../base/browser/dom.js";
import { PixelRatio } from "../../../base/browser/pixelRatio.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { EditorFontLigatures } from "../../common/config/editorOptions.js";
import {
  FontInfo,
  SERIALIZED_FONT_INFO_VERSION
} from "../../common/config/fontInfo.js";
import {
  CharWidthRequest,
  CharWidthRequestType,
  readCharWidths
} from "./charWidthReader.js";
class FontMeasurementsImpl extends Disposable {
  _cache = /* @__PURE__ */ new Map();
  _evictUntrustedReadingsTimeout = -1;
  _onDidChange = this._register(new Emitter());
  onDidChange = this._onDidChange.event;
  dispose() {
    if (this._evictUntrustedReadingsTimeout !== -1) {
      clearTimeout(this._evictUntrustedReadingsTimeout);
      this._evictUntrustedReadingsTimeout = -1;
    }
    super.dispose();
  }
  /**
   * Clear all cached font information and trigger a change event.
   */
  clearAllFontInfos() {
    this._cache.clear();
    this._onDidChange.fire();
  }
  _ensureCache(targetWindow) {
    const windowId = getWindowId(targetWindow);
    let cache = this._cache.get(windowId);
    if (!cache) {
      cache = new FontMeasurementsCache();
      this._cache.set(windowId, cache);
    }
    return cache;
  }
  _writeToCache(targetWindow, item, value) {
    const cache = this._ensureCache(targetWindow);
    cache.put(item, value);
    if (!value.isTrusted && this._evictUntrustedReadingsTimeout === -1) {
      this._evictUntrustedReadingsTimeout = targetWindow.setTimeout(
        () => {
          this._evictUntrustedReadingsTimeout = -1;
          this._evictUntrustedReadings(targetWindow);
        },
        5e3
      );
    }
  }
  _evictUntrustedReadings(targetWindow) {
    const cache = this._ensureCache(targetWindow);
    const values = cache.getValues();
    let somethingRemoved = false;
    for (const item of values) {
      if (!item.isTrusted) {
        somethingRemoved = true;
        cache.remove(item);
      }
    }
    if (somethingRemoved) {
      this._onDidChange.fire();
    }
  }
  /**
   * Serialized currently cached font information.
   */
  serializeFontInfo(targetWindow) {
    const cache = this._ensureCache(targetWindow);
    return cache.getValues().filter((item) => item.isTrusted);
  }
  /**
   * Restore previously serialized font informations.
   */
  restoreFontInfo(targetWindow, savedFontInfos) {
    for (const savedFontInfo of savedFontInfos) {
      if (savedFontInfo.version !== SERIALIZED_FONT_INFO_VERSION) {
        continue;
      }
      const fontInfo = new FontInfo(savedFontInfo, false);
      this._writeToCache(targetWindow, fontInfo, fontInfo);
    }
  }
  /**
   * Read font information.
   */
  readFontInfo(targetWindow, bareFontInfo) {
    const cache = this._ensureCache(targetWindow);
    if (!cache.has(bareFontInfo)) {
      let readConfig = this._actualReadFontInfo(
        targetWindow,
        bareFontInfo
      );
      if (readConfig.typicalHalfwidthCharacterWidth <= 2 || readConfig.typicalFullwidthCharacterWidth <= 2 || readConfig.spaceWidth <= 2 || readConfig.maxDigitWidth <= 2) {
        readConfig = new FontInfo(
          {
            pixelRatio: PixelRatio.getInstance(targetWindow).value,
            fontFamily: readConfig.fontFamily,
            fontWeight: readConfig.fontWeight,
            fontSize: readConfig.fontSize,
            fontFeatureSettings: readConfig.fontFeatureSettings,
            fontVariationSettings: readConfig.fontVariationSettings,
            lineHeight: readConfig.lineHeight,
            letterSpacing: readConfig.letterSpacing,
            isMonospace: readConfig.isMonospace,
            typicalHalfwidthCharacterWidth: Math.max(
              readConfig.typicalHalfwidthCharacterWidth,
              5
            ),
            typicalFullwidthCharacterWidth: Math.max(
              readConfig.typicalFullwidthCharacterWidth,
              5
            ),
            canUseHalfwidthRightwardsArrow: readConfig.canUseHalfwidthRightwardsArrow,
            spaceWidth: Math.max(readConfig.spaceWidth, 5),
            middotWidth: Math.max(readConfig.middotWidth, 5),
            wsmiddotWidth: Math.max(readConfig.wsmiddotWidth, 5),
            maxDigitWidth: Math.max(readConfig.maxDigitWidth, 5)
          },
          false
        );
      }
      this._writeToCache(targetWindow, bareFontInfo, readConfig);
    }
    return cache.get(bareFontInfo);
  }
  _createRequest(chr, type, all, monospace) {
    const result = new CharWidthRequest(chr, type);
    all.push(result);
    monospace?.push(result);
    return result;
  }
  _actualReadFontInfo(targetWindow, bareFontInfo) {
    const all = [];
    const monospace = [];
    const typicalHalfwidthCharacter = this._createRequest(
      "n",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const typicalFullwidthCharacter = this._createRequest(
      "\uFF4D",
      CharWidthRequestType.Regular,
      all,
      null
    );
    const space = this._createRequest(
      " ",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit0 = this._createRequest(
      "0",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit1 = this._createRequest(
      "1",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit2 = this._createRequest(
      "2",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit3 = this._createRequest(
      "3",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit4 = this._createRequest(
      "4",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit5 = this._createRequest(
      "5",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit6 = this._createRequest(
      "6",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit7 = this._createRequest(
      "7",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit8 = this._createRequest(
      "8",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const digit9 = this._createRequest(
      "9",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const rightwardsArrow = this._createRequest(
      "\u2192",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const halfwidthRightwardsArrow = this._createRequest(
      "\uFFEB",
      CharWidthRequestType.Regular,
      all,
      null
    );
    const middot = this._createRequest(
      "\xB7",
      CharWidthRequestType.Regular,
      all,
      monospace
    );
    const wsmiddotWidth = this._createRequest(
      String.fromCharCode(11825),
      CharWidthRequestType.Regular,
      all,
      null
    );
    const monospaceTestChars = "|/-_ilm%";
    for (let i = 0, len = monospaceTestChars.length; i < len; i++) {
      this._createRequest(
        monospaceTestChars.charAt(i),
        CharWidthRequestType.Regular,
        all,
        monospace
      );
      this._createRequest(
        monospaceTestChars.charAt(i),
        CharWidthRequestType.Italic,
        all,
        monospace
      );
      this._createRequest(
        monospaceTestChars.charAt(i),
        CharWidthRequestType.Bold,
        all,
        monospace
      );
    }
    readCharWidths(targetWindow, bareFontInfo, all);
    const maxDigitWidth = Math.max(
      digit0.width,
      digit1.width,
      digit2.width,
      digit3.width,
      digit4.width,
      digit5.width,
      digit6.width,
      digit7.width,
      digit8.width,
      digit9.width
    );
    let isMonospace = bareFontInfo.fontFeatureSettings === EditorFontLigatures.OFF;
    const referenceWidth = monospace[0].width;
    for (let i = 1, len = monospace.length; isMonospace && i < len; i++) {
      const diff = referenceWidth - monospace[i].width;
      if (diff < -1e-3 || diff > 1e-3) {
        isMonospace = false;
        break;
      }
    }
    let canUseHalfwidthRightwardsArrow = true;
    if (isMonospace && halfwidthRightwardsArrow.width !== referenceWidth) {
      canUseHalfwidthRightwardsArrow = false;
    }
    if (halfwidthRightwardsArrow.width > rightwardsArrow.width) {
      canUseHalfwidthRightwardsArrow = false;
    }
    return new FontInfo(
      {
        pixelRatio: PixelRatio.getInstance(targetWindow).value,
        fontFamily: bareFontInfo.fontFamily,
        fontWeight: bareFontInfo.fontWeight,
        fontSize: bareFontInfo.fontSize,
        fontFeatureSettings: bareFontInfo.fontFeatureSettings,
        fontVariationSettings: bareFontInfo.fontVariationSettings,
        lineHeight: bareFontInfo.lineHeight,
        letterSpacing: bareFontInfo.letterSpacing,
        isMonospace,
        typicalHalfwidthCharacterWidth: typicalHalfwidthCharacter.width,
        typicalFullwidthCharacterWidth: typicalFullwidthCharacter.width,
        canUseHalfwidthRightwardsArrow,
        spaceWidth: space.width,
        middotWidth: middot.width,
        wsmiddotWidth: wsmiddotWidth.width,
        maxDigitWidth
      },
      true
    );
  }
}
class FontMeasurementsCache {
  _keys;
  _values;
  constructor() {
    this._keys = /* @__PURE__ */ Object.create(null);
    this._values = /* @__PURE__ */ Object.create(null);
  }
  has(item) {
    const itemId = item.getId();
    return !!this._values[itemId];
  }
  get(item) {
    const itemId = item.getId();
    return this._values[itemId];
  }
  put(item, value) {
    const itemId = item.getId();
    this._keys[itemId] = item;
    this._values[itemId] = value;
  }
  remove(item) {
    const itemId = item.getId();
    delete this._keys[itemId];
    delete this._values[itemId];
  }
  getValues() {
    return Object.keys(this._keys).map((id) => this._values[id]);
  }
}
const FontMeasurements = new FontMeasurementsImpl();
export {
  FontMeasurements,
  FontMeasurementsImpl
};
