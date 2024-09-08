class CursorContext {
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
