var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { ViewEventHandler } from "../../common/viewEventHandler.js";
class ViewPart extends ViewEventHandler {
  static {
    __name(this, "ViewPart");
  }
  _context;
  constructor(context) {
    super();
    this._context = context;
    this._context.addEventHandler(this);
  }
  dispose() {
    this._context.removeEventHandler(this);
    super.dispose();
  }
}
var PartFingerprint = /* @__PURE__ */ ((PartFingerprint2) => {
  PartFingerprint2[PartFingerprint2["None"] = 0] = "None";
  PartFingerprint2[PartFingerprint2["ContentWidgets"] = 1] = "ContentWidgets";
  PartFingerprint2[PartFingerprint2["OverflowingContentWidgets"] = 2] = "OverflowingContentWidgets";
  PartFingerprint2[PartFingerprint2["OverflowGuard"] = 3] = "OverflowGuard";
  PartFingerprint2[PartFingerprint2["OverlayWidgets"] = 4] = "OverlayWidgets";
  PartFingerprint2[PartFingerprint2["OverflowingOverlayWidgets"] = 5] = "OverflowingOverlayWidgets";
  PartFingerprint2[PartFingerprint2["ScrollableElement"] = 6] = "ScrollableElement";
  PartFingerprint2[PartFingerprint2["TextArea"] = 7] = "TextArea";
  PartFingerprint2[PartFingerprint2["ViewLines"] = 8] = "ViewLines";
  PartFingerprint2[PartFingerprint2["Minimap"] = 9] = "Minimap";
  return PartFingerprint2;
})(PartFingerprint || {});
class PartFingerprints {
  static {
    __name(this, "PartFingerprints");
  }
  static write(target, partId) {
    target.setAttribute("data-mprt", String(partId));
  }
  static read(target) {
    const r = target.getAttribute("data-mprt");
    if (r === null) {
      return 0 /* None */;
    }
    return Number.parseInt(r, 10);
  }
  static collect(child, stopAt) {
    const result = [];
    let resultLen = 0;
    while (child && child !== child.ownerDocument.body) {
      if (child === stopAt) {
        break;
      }
      if (child.nodeType === child.ELEMENT_NODE) {
        result[resultLen++] = this.read(child);
      }
      child = child.parentElement;
    }
    const r = new Uint8Array(resultLen);
    for (let i = 0; i < resultLen; i++) {
      r[i] = result[resultLen - i - 1];
    }
    return r;
  }
}
export {
  PartFingerprint,
  PartFingerprints,
  ViewPart
};
//# sourceMappingURL=viewPart.js.map
