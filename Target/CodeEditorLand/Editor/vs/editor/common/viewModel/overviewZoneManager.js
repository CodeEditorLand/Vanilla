var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["MINIMUM_HEIGHT"] = 4] = "MINIMUM_HEIGHT";
  return Constants2;
})(Constants || {});
class ColorZone {
  static {
    __name(this, "ColorZone");
  }
  _colorZoneBrand = void 0;
  from;
  to;
  colorId;
  constructor(from, to, colorId) {
    this.from = from | 0;
    this.to = to | 0;
    this.colorId = colorId | 0;
  }
  static compare(a, b) {
    if (a.colorId === b.colorId) {
      if (a.from === b.from) {
        return a.to - b.to;
      }
      return a.from - b.from;
    }
    return a.colorId - b.colorId;
  }
}
class OverviewRulerZone {
  static {
    __name(this, "OverviewRulerZone");
  }
  _overviewRulerZoneBrand = void 0;
  startLineNumber;
  endLineNumber;
  /**
   * If set to 0, the height in lines will be determined based on `endLineNumber`.
   */
  heightInLines;
  color;
  _colorZone;
  constructor(startLineNumber, endLineNumber, heightInLines, color) {
    this.startLineNumber = startLineNumber;
    this.endLineNumber = endLineNumber;
    this.heightInLines = heightInLines;
    this.color = color;
    this._colorZone = null;
  }
  static compare(a, b) {
    if (a.color === b.color) {
      if (a.startLineNumber === b.startLineNumber) {
        if (a.heightInLines === b.heightInLines) {
          return a.endLineNumber - b.endLineNumber;
        }
        return a.heightInLines - b.heightInLines;
      }
      return a.startLineNumber - b.startLineNumber;
    }
    return a.color < b.color ? -1 : 1;
  }
  setColorZone(colorZone) {
    this._colorZone = colorZone;
  }
  getColorZones() {
    return this._colorZone;
  }
}
class OverviewZoneManager {
  static {
    __name(this, "OverviewZoneManager");
  }
  _getVerticalOffsetForLine;
  _zones;
  _colorZonesInvalid;
  _lineHeight;
  _domWidth;
  _domHeight;
  _outerHeight;
  _pixelRatio;
  _lastAssignedId;
  _color2Id;
  _id2Color;
  constructor(getVerticalOffsetForLine) {
    this._getVerticalOffsetForLine = getVerticalOffsetForLine;
    this._zones = [];
    this._colorZonesInvalid = false;
    this._lineHeight = 0;
    this._domWidth = 0;
    this._domHeight = 0;
    this._outerHeight = 0;
    this._pixelRatio = 1;
    this._lastAssignedId = 0;
    this._color2Id = /* @__PURE__ */ Object.create(null);
    this._id2Color = [];
  }
  getId2Color() {
    return this._id2Color;
  }
  setZones(newZones) {
    this._zones = newZones;
    this._zones.sort(OverviewRulerZone.compare);
  }
  setLineHeight(lineHeight) {
    if (this._lineHeight === lineHeight) {
      return false;
    }
    this._lineHeight = lineHeight;
    this._colorZonesInvalid = true;
    return true;
  }
  setPixelRatio(pixelRatio) {
    this._pixelRatio = pixelRatio;
    this._colorZonesInvalid = true;
  }
  getDOMWidth() {
    return this._domWidth;
  }
  getCanvasWidth() {
    return this._domWidth * this._pixelRatio;
  }
  setDOMWidth(width) {
    if (this._domWidth === width) {
      return false;
    }
    this._domWidth = width;
    this._colorZonesInvalid = true;
    return true;
  }
  getDOMHeight() {
    return this._domHeight;
  }
  getCanvasHeight() {
    return this._domHeight * this._pixelRatio;
  }
  setDOMHeight(height) {
    if (this._domHeight === height) {
      return false;
    }
    this._domHeight = height;
    this._colorZonesInvalid = true;
    return true;
  }
  getOuterHeight() {
    return this._outerHeight;
  }
  setOuterHeight(outerHeight) {
    if (this._outerHeight === outerHeight) {
      return false;
    }
    this._outerHeight = outerHeight;
    this._colorZonesInvalid = true;
    return true;
  }
  resolveColorZones() {
    const colorZonesInvalid = this._colorZonesInvalid;
    const lineHeight = Math.floor(this._lineHeight);
    const totalHeight = Math.floor(this.getCanvasHeight());
    const outerHeight = Math.floor(this._outerHeight);
    const heightRatio = totalHeight / outerHeight;
    const halfMinimumHeight = Math.floor(
      4 /* MINIMUM_HEIGHT */ * this._pixelRatio / 2
    );
    const allColorZones = [];
    for (let i = 0, len = this._zones.length; i < len; i++) {
      const zone = this._zones[i];
      if (!colorZonesInvalid) {
        const colorZone2 = zone.getColorZones();
        if (colorZone2) {
          allColorZones.push(colorZone2);
          continue;
        }
      }
      const offset1 = this._getVerticalOffsetForLine(
        zone.startLineNumber
      );
      const offset2 = zone.heightInLines === 0 ? this._getVerticalOffsetForLine(zone.endLineNumber) + lineHeight : offset1 + zone.heightInLines * lineHeight;
      const y1 = Math.floor(heightRatio * offset1);
      const y2 = Math.floor(heightRatio * offset2);
      let ycenter = Math.floor((y1 + y2) / 2);
      let halfHeight = y2 - ycenter;
      if (halfHeight < halfMinimumHeight) {
        halfHeight = halfMinimumHeight;
      }
      if (ycenter - halfHeight < 0) {
        ycenter = halfHeight;
      }
      if (ycenter + halfHeight > totalHeight) {
        ycenter = totalHeight - halfHeight;
      }
      const color = zone.color;
      let colorId = this._color2Id[color];
      if (!colorId) {
        colorId = ++this._lastAssignedId;
        this._color2Id[color] = colorId;
        this._id2Color[colorId] = color;
      }
      const colorZone = new ColorZone(
        ycenter - halfHeight,
        ycenter + halfHeight,
        colorId
      );
      zone.setColorZone(colorZone);
      allColorZones.push(colorZone);
    }
    this._colorZonesInvalid = false;
    allColorZones.sort(ColorZone.compare);
    return allColorZones;
  }
}
export {
  ColorZone,
  OverviewRulerZone,
  OverviewZoneManager
};
//# sourceMappingURL=overviewZoneManager.js.map
