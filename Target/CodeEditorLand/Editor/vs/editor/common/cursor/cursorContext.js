var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class CursorContext {
  static {
    __name(this, "CursorContext");
  }
  _cursorContextBrand = void 0;
  model;
  viewModel;
  coordinatesConverter;
  cursorConfig;
  constructor(model, viewModel, coordinatesConverter, cursorConfig) {
    this.model = model;
    this.viewModel = viewModel;
    this.coordinatesConverter = coordinatesConverter;
    this.cursorConfig = cursorConfig;
  }
}
export {
  CursorContext
};
//# sourceMappingURL=cursorContext.js.map
