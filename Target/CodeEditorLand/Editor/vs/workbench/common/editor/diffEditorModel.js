import { EditorModel } from "./editorModel.js";
class DiffEditorModel extends EditorModel {
  _originalModel;
  get originalModel() {
    return this._originalModel;
  }
  _modifiedModel;
  get modifiedModel() {
    return this._modifiedModel;
  }
  constructor(originalModel, modifiedModel) {
    super();
    this._originalModel = originalModel;
    this._modifiedModel = modifiedModel;
  }
  async resolve() {
    await Promise.all([
      this._originalModel?.resolve(),
      this._modifiedModel?.resolve()
    ]);
  }
  isResolved() {
    return !!(this._originalModel?.isResolved() && this._modifiedModel?.isResolved());
  }
  dispose() {
    super.dispose();
  }
}
export {
  DiffEditorModel
};
