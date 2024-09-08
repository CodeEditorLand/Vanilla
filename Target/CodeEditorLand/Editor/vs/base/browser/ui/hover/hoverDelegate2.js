let baseHoverDelegate = {
  showHover: () => void 0,
  hideHover: () => void 0,
  showAndFocusLastHover: () => void 0,
  setupManagedHover: () => null,
  showManagedHover: () => void 0
};
function setBaseLayerHoverDelegate(hoverDelegate) {
  baseHoverDelegate = hoverDelegate;
}
function getBaseLayerHoverDelegate() {
  return baseHoverDelegate;
}
export {
  getBaseLayerHoverDelegate,
  setBaseLayerHoverDelegate
};
