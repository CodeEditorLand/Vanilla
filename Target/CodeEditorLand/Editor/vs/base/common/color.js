var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CharCode } from "./charCode.js";
function roundFloat(number, decimalPoints) {
  const decimal = Math.pow(10, decimalPoints);
  return Math.round(number * decimal) / decimal;
}
__name(roundFloat, "roundFloat");
class RGBA {
  static {
    __name(this, "RGBA");
  }
  _rgbaBrand = void 0;
  /**
   * Red: integer in [0-255]
   */
  r;
  /**
   * Green: integer in [0-255]
   */
  g;
  /**
   * Blue: integer in [0-255]
   */
  b;
  /**
   * Alpha: float in [0-1]
   */
  a;
  constructor(r, g, b, a = 1) {
    this.r = Math.min(255, Math.max(0, r)) | 0;
    this.g = Math.min(255, Math.max(0, g)) | 0;
    this.b = Math.min(255, Math.max(0, b)) | 0;
    this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
  }
  static equals(a, b) {
    return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
  }
}
class HSLA {
  static {
    __name(this, "HSLA");
  }
  _hslaBrand = void 0;
  /**
   * Hue: integer in [0, 360]
   */
  h;
  /**
   * Saturation: float in [0, 1]
   */
  s;
  /**
   * Luminosity: float in [0, 1]
   */
  l;
  /**
   * Alpha: float in [0, 1]
   */
  a;
  constructor(h, s, l, a) {
    this.h = Math.max(Math.min(360, h), 0) | 0;
    this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
    this.l = roundFloat(Math.max(Math.min(1, l), 0), 3);
    this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
  }
  static equals(a, b) {
    return a.h === b.h && a.s === b.s && a.l === b.l && a.a === b.a;
  }
  /**
   * Converts an RGB color value to HSL. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes r, g, and b are contained in the set [0, 255] and
   * returns h in the set [0, 360], s, and l in the set [0, 1].
   */
  static fromRGBA(rgba) {
    const r = rgba.r / 255;
    const g = rgba.g / 255;
    const b = rgba.b / 255;
    const a = rgba.a;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (min + max) / 2;
    const chroma = max - min;
    if (chroma > 0) {
      s = Math.min(l <= 0.5 ? chroma / (2 * l) : chroma / (2 - 2 * l), 1);
      switch (max) {
        case r:
          h = (g - b) / chroma + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / chroma + 2;
          break;
        case b:
          h = (r - g) / chroma + 4;
          break;
      }
      h *= 60;
      h = Math.round(h);
    }
    return new HSLA(h, s, l, a);
  }
  static _hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }
  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h in the set [0, 360] s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   */
  static toRGBA(hsla) {
    const h = hsla.h / 360;
    const { s, l, a } = hsla;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = HSLA._hue2rgb(p, q, h + 1 / 3);
      g = HSLA._hue2rgb(p, q, h);
      b = HSLA._hue2rgb(p, q, h - 1 / 3);
    }
    return new RGBA(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255),
      a
    );
  }
}
class HSVA {
  static {
    __name(this, "HSVA");
  }
  _hsvaBrand = void 0;
  /**
   * Hue: integer in [0, 360]
   */
  h;
  /**
   * Saturation: float in [0, 1]
   */
  s;
  /**
   * Value: float in [0, 1]
   */
  v;
  /**
   * Alpha: float in [0, 1]
   */
  a;
  constructor(h, s, v, a) {
    this.h = Math.max(Math.min(360, h), 0) | 0;
    this.s = roundFloat(Math.max(Math.min(1, s), 0), 3);
    this.v = roundFloat(Math.max(Math.min(1, v), 0), 3);
    this.a = roundFloat(Math.max(Math.min(1, a), 0), 3);
  }
  static equals(a, b) {
    return a.h === b.h && a.s === b.s && a.v === b.v && a.a === b.a;
  }
  // from http://www.rapidtables.com/convert/color/rgb-to-hsv.htm
  static fromRGBA(rgba) {
    const r = rgba.r / 255;
    const g = rgba.g / 255;
    const b = rgba.b / 255;
    const cmax = Math.max(r, g, b);
    const cmin = Math.min(r, g, b);
    const delta = cmax - cmin;
    const s = cmax === 0 ? 0 : delta / cmax;
    let m;
    if (delta === 0) {
      m = 0;
    } else if (cmax === r) {
      m = ((g - b) / delta % 6 + 6) % 6;
    } else if (cmax === g) {
      m = (b - r) / delta + 2;
    } else {
      m = (r - g) / delta + 4;
    }
    return new HSVA(Math.round(m * 60), s, cmax, rgba.a);
  }
  // from http://www.rapidtables.com/convert/color/hsv-to-rgb.htm
  static toRGBA(hsva) {
    const { h, s, v, a } = hsva;
    const c = v * s;
    const x = c * (1 - Math.abs(h / 60 % 2 - 1));
    const m = v - c;
    let [r, g, b] = [0, 0, 0];
    if (h < 60) {
      r = c;
      g = x;
    } else if (h < 120) {
      r = x;
      g = c;
    } else if (h < 180) {
      g = c;
      b = x;
    } else if (h < 240) {
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      b = c;
    } else if (h <= 360) {
      r = c;
      b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return new RGBA(r, g, b, a);
  }
}
class Color {
  static {
    __name(this, "Color");
  }
  static fromHex(hex) {
    return Color.Format.CSS.parseHex(hex) || Color.red;
  }
  static equals(a, b) {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    return a.equals(b);
  }
  rgba;
  _hsla;
  get hsla() {
    if (this._hsla) {
      return this._hsla;
    } else {
      return HSLA.fromRGBA(this.rgba);
    }
  }
  _hsva;
  get hsva() {
    if (this._hsva) {
      return this._hsva;
    }
    return HSVA.fromRGBA(this.rgba);
  }
  constructor(arg) {
    if (!arg) {
      throw new Error("Color needs a value");
    } else if (arg instanceof RGBA) {
      this.rgba = arg;
    } else if (arg instanceof HSLA) {
      this._hsla = arg;
      this.rgba = HSLA.toRGBA(arg);
    } else if (arg instanceof HSVA) {
      this._hsva = arg;
      this.rgba = HSVA.toRGBA(arg);
    } else {
      throw new Error("Invalid color ctor argument");
    }
  }
  equals(other) {
    return !!other && RGBA.equals(this.rgba, other.rgba) && HSLA.equals(this.hsla, other.hsla) && HSVA.equals(this.hsva, other.hsva);
  }
  /**
   * http://www.w3.org/TR/WCAG20/#relativeluminancedef
   * Returns the number in the set [0, 1]. O => Darkest Black. 1 => Lightest white.
   */
  getRelativeLuminance() {
    const R = Color._relativeLuminanceForComponent(this.rgba.r);
    const G = Color._relativeLuminanceForComponent(this.rgba.g);
    const B = Color._relativeLuminanceForComponent(this.rgba.b);
    const luminance = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    return roundFloat(luminance, 4);
  }
  static _relativeLuminanceForComponent(color) {
    const c = color / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }
  /**
   * http://www.w3.org/TR/WCAG20/#contrast-ratiodef
   * Returns the contrast ration number in the set [1, 21].
   */
  getContrastRatio(another) {
    const lum1 = this.getRelativeLuminance();
    const lum2 = another.getRelativeLuminance();
    return lum1 > lum2 ? (lum1 + 0.05) / (lum2 + 0.05) : (lum2 + 0.05) / (lum1 + 0.05);
  }
  /**
   *	http://24ways.org/2010/calculating-color-contrast
   *  Return 'true' if darker color otherwise 'false'
   */
  isDarker() {
    const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1e3;
    return yiq < 128;
  }
  /**
   *	http://24ways.org/2010/calculating-color-contrast
   *  Return 'true' if lighter color otherwise 'false'
   */
  isLighter() {
    const yiq = (this.rgba.r * 299 + this.rgba.g * 587 + this.rgba.b * 114) / 1e3;
    return yiq >= 128;
  }
  isLighterThan(another) {
    const lum1 = this.getRelativeLuminance();
    const lum2 = another.getRelativeLuminance();
    return lum1 > lum2;
  }
  isDarkerThan(another) {
    const lum1 = this.getRelativeLuminance();
    const lum2 = another.getRelativeLuminance();
    return lum1 < lum2;
  }
  lighten(factor) {
    return new Color(
      new HSLA(
        this.hsla.h,
        this.hsla.s,
        this.hsla.l + this.hsla.l * factor,
        this.hsla.a
      )
    );
  }
  darken(factor) {
    return new Color(
      new HSLA(
        this.hsla.h,
        this.hsla.s,
        this.hsla.l - this.hsla.l * factor,
        this.hsla.a
      )
    );
  }
  transparent(factor) {
    const { r, g, b, a } = this.rgba;
    return new Color(new RGBA(r, g, b, a * factor));
  }
  isTransparent() {
    return this.rgba.a === 0;
  }
  isOpaque() {
    return this.rgba.a === 1;
  }
  opposite() {
    return new Color(
      new RGBA(
        255 - this.rgba.r,
        255 - this.rgba.g,
        255 - this.rgba.b,
        this.rgba.a
      )
    );
  }
  blend(c) {
    const rgba = c.rgba;
    const thisA = this.rgba.a;
    const colorA = rgba.a;
    const a = thisA + colorA * (1 - thisA);
    if (a < 1e-6) {
      return Color.transparent;
    }
    const r = this.rgba.r * thisA / a + rgba.r * colorA * (1 - thisA) / a;
    const g = this.rgba.g * thisA / a + rgba.g * colorA * (1 - thisA) / a;
    const b = this.rgba.b * thisA / a + rgba.b * colorA * (1 - thisA) / a;
    return new Color(new RGBA(r, g, b, a));
  }
  makeOpaque(opaqueBackground) {
    if (this.isOpaque() || opaqueBackground.rgba.a !== 1) {
      return this;
    }
    const { r, g, b, a } = this.rgba;
    return new Color(
      new RGBA(
        opaqueBackground.rgba.r - a * (opaqueBackground.rgba.r - r),
        opaqueBackground.rgba.g - a * (opaqueBackground.rgba.g - g),
        opaqueBackground.rgba.b - a * (opaqueBackground.rgba.b - b),
        1
      )
    );
  }
  flatten(...backgrounds) {
    const background = backgrounds.reduceRight((accumulator, color) => {
      return Color._flatten(color, accumulator);
    });
    return Color._flatten(this, background);
  }
  static _flatten(foreground, background) {
    const backgroundAlpha = 1 - foreground.rgba.a;
    return new Color(
      new RGBA(
        backgroundAlpha * background.rgba.r + foreground.rgba.a * foreground.rgba.r,
        backgroundAlpha * background.rgba.g + foreground.rgba.a * foreground.rgba.g,
        backgroundAlpha * background.rgba.b + foreground.rgba.a * foreground.rgba.b
      )
    );
  }
  _toString;
  toString() {
    if (!this._toString) {
      this._toString = Color.Format.CSS.format(this);
    }
    return this._toString;
  }
  static getLighterColor(of, relative, factor) {
    if (of.isLighterThan(relative)) {
      return of;
    }
    factor = factor ? factor : 0.5;
    const lum1 = of.getRelativeLuminance();
    const lum2 = relative.getRelativeLuminance();
    factor = factor * (lum2 - lum1) / lum2;
    return of.lighten(factor);
  }
  static getDarkerColor(of, relative, factor) {
    if (of.isDarkerThan(relative)) {
      return of;
    }
    factor = factor ? factor : 0.5;
    const lum1 = of.getRelativeLuminance();
    const lum2 = relative.getRelativeLuminance();
    factor = factor * (lum1 - lum2) / lum1;
    return of.darken(factor);
  }
  static white = new Color(new RGBA(255, 255, 255, 1));
  static black = new Color(new RGBA(0, 0, 0, 1));
  static red = new Color(new RGBA(255, 0, 0, 1));
  static blue = new Color(new RGBA(0, 0, 255, 1));
  static green = new Color(new RGBA(0, 255, 0, 1));
  static cyan = new Color(new RGBA(0, 255, 255, 1));
  static lightgrey = new Color(new RGBA(211, 211, 211, 1));
  static transparent = new Color(new RGBA(0, 0, 0, 0));
}
((Color2) => {
  let Format;
  ((Format2) => {
    let CSS;
    ((CSS2) => {
      function formatRGB(color) {
        if (color.rgba.a === 1) {
          return `rgb(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b})`;
        }
        return Color2.Format.CSS.formatRGBA(color);
      }
      CSS2.formatRGB = formatRGB;
      __name(formatRGB, "formatRGB");
      function formatRGBA(color) {
        return `rgba(${color.rgba.r}, ${color.rgba.g}, ${color.rgba.b}, ${+color.rgba.a.toFixed(2)})`;
      }
      CSS2.formatRGBA = formatRGBA;
      __name(formatRGBA, "formatRGBA");
      function formatHSL(color) {
        if (color.hsla.a === 1) {
          return `hsl(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%)`;
        }
        return Color2.Format.CSS.formatHSLA(color);
      }
      CSS2.formatHSL = formatHSL;
      __name(formatHSL, "formatHSL");
      function formatHSLA(color) {
        return `hsla(${color.hsla.h}, ${(color.hsla.s * 100).toFixed(2)}%, ${(color.hsla.l * 100).toFixed(2)}%, ${color.hsla.a.toFixed(2)})`;
      }
      CSS2.formatHSLA = formatHSLA;
      __name(formatHSLA, "formatHSLA");
      function _toTwoDigitHex(n) {
        const r = n.toString(16);
        return r.length !== 2 ? "0" + r : r;
      }
      __name(_toTwoDigitHex, "_toTwoDigitHex");
      function formatHex(color) {
        return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}`;
      }
      CSS2.formatHex = formatHex;
      __name(formatHex, "formatHex");
      function formatHexA(color, compact = false) {
        if (compact && color.rgba.a === 1) {
          return Color2.Format.CSS.formatHex(color);
        }
        return `#${_toTwoDigitHex(color.rgba.r)}${_toTwoDigitHex(color.rgba.g)}${_toTwoDigitHex(color.rgba.b)}${_toTwoDigitHex(Math.round(color.rgba.a * 255))}`;
      }
      CSS2.formatHexA = formatHexA;
      __name(formatHexA, "formatHexA");
      function format(color) {
        if (color.isOpaque()) {
          return Color2.Format.CSS.formatHex(color);
        }
        return Color2.Format.CSS.formatRGBA(color);
      }
      CSS2.format = format;
      __name(format, "format");
      function parseHex(hex) {
        const length = hex.length;
        if (length === 0) {
          return null;
        }
        if (hex.charCodeAt(0) !== CharCode.Hash) {
          return null;
        }
        if (length === 7) {
          const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
          const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
          const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
          return new Color2(new RGBA(r, g, b, 1));
        }
        if (length === 9) {
          const r = 16 * _parseHexDigit(hex.charCodeAt(1)) + _parseHexDigit(hex.charCodeAt(2));
          const g = 16 * _parseHexDigit(hex.charCodeAt(3)) + _parseHexDigit(hex.charCodeAt(4));
          const b = 16 * _parseHexDigit(hex.charCodeAt(5)) + _parseHexDigit(hex.charCodeAt(6));
          const a = 16 * _parseHexDigit(hex.charCodeAt(7)) + _parseHexDigit(hex.charCodeAt(8));
          return new Color2(new RGBA(r, g, b, a / 255));
        }
        if (length === 4) {
          const r = _parseHexDigit(hex.charCodeAt(1));
          const g = _parseHexDigit(hex.charCodeAt(2));
          const b = _parseHexDigit(hex.charCodeAt(3));
          return new Color2(
            new RGBA(16 * r + r, 16 * g + g, 16 * b + b)
          );
        }
        if (length === 5) {
          const r = _parseHexDigit(hex.charCodeAt(1));
          const g = _parseHexDigit(hex.charCodeAt(2));
          const b = _parseHexDigit(hex.charCodeAt(3));
          const a = _parseHexDigit(hex.charCodeAt(4));
          return new Color2(
            new RGBA(
              16 * r + r,
              16 * g + g,
              16 * b + b,
              (16 * a + a) / 255
            )
          );
        }
        return null;
      }
      CSS2.parseHex = parseHex;
      __name(parseHex, "parseHex");
      function _parseHexDigit(charCode) {
        switch (charCode) {
          case CharCode.Digit0:
            return 0;
          case CharCode.Digit1:
            return 1;
          case CharCode.Digit2:
            return 2;
          case CharCode.Digit3:
            return 3;
          case CharCode.Digit4:
            return 4;
          case CharCode.Digit5:
            return 5;
          case CharCode.Digit6:
            return 6;
          case CharCode.Digit7:
            return 7;
          case CharCode.Digit8:
            return 8;
          case CharCode.Digit9:
            return 9;
          case CharCode.a:
            return 10;
          case CharCode.A:
            return 10;
          case CharCode.b:
            return 11;
          case CharCode.B:
            return 11;
          case CharCode.c:
            return 12;
          case CharCode.C:
            return 12;
          case CharCode.d:
            return 13;
          case CharCode.D:
            return 13;
          case CharCode.e:
            return 14;
          case CharCode.E:
            return 14;
          case CharCode.f:
            return 15;
          case CharCode.F:
            return 15;
        }
        return 0;
      }
      __name(_parseHexDigit, "_parseHexDigit");
    })(CSS = Format2.CSS || (Format2.CSS = {}));
  })(Format = Color2.Format || (Color2.Format = {}));
})(Color || (Color = {}));
export {
  Color,
  HSLA,
  HSVA,
  RGBA
};
//# sourceMappingURL=color.js.map
