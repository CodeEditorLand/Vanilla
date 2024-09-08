import { EditorTheme } from "../editorTheme.js";
class ViewContext {
  configuration;
  viewModel;
  viewLayout;
  theme;
  constructor(configuration, theme, model) {
    this.configuration = configuration;
    this.theme = new EditorTheme(theme);
    this.viewModel = model;
    this.viewLayout = model.viewLayout;
  }
  addEventHandler(eventHandler) {
    this.viewModel.addViewEventHandler(eventHandler);
  }
  removeEventHandler(eventHandler) {
    this.viewModel.removeViewEventHandler(eventHandler);
  }
}
export {
  ViewContext
};
