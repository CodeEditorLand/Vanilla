import { Disposable } from "../../../../base/common/lifecycle.js";
const NullHoverService = {
  _serviceBrand: void 0,
  hideHover: () => void 0,
  showHover: () => void 0,
  setupManagedHover: () => Disposable.None,
  showAndFocusLastHover: () => void 0,
  showManagedHover: () => void 0
};
export {
  NullHoverService
};
