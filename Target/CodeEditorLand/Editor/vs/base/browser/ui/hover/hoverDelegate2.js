var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
let baseHoverDelegate = {
  showHover: /* @__PURE__ */ __name(() => void 0, "showHover"),
  hideHover: /* @__PURE__ */ __name(() => void 0, "hideHover"),
  showAndFocusLastHover: /* @__PURE__ */ __name(() => void 0, "showAndFocusLastHover"),
  setupManagedHover: /* @__PURE__ */ __name(() => null, "setupManagedHover"),
  showManagedHover: /* @__PURE__ */ __name(() => void 0, "showManagedHover")
};
function setBaseLayerHoverDelegate(hoverDelegate) {
  baseHoverDelegate = hoverDelegate;
}
__name(setBaseLayerHoverDelegate, "setBaseLayerHoverDelegate");
function getBaseLayerHoverDelegate() {
  return baseHoverDelegate;
}
__name(getBaseLayerHoverDelegate, "getBaseLayerHoverDelegate");
export {
  getBaseLayerHoverDelegate,
  setBaseLayerHoverDelegate
};
//# sourceMappingURL=hoverDelegate2.js.map
