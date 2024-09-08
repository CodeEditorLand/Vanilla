import "./media/singleeditortabscontrol.css";
import { Dimension } from "../../../../base/browser/dom.js";
import { EditorTabsControl } from "./editorTabsControl.js";
class NoEditorTabsControl extends EditorTabsControl {
  activeEditor = null;
  prepareEditorActions(editorActions) {
    return {
      primary: [],
      secondary: []
    };
  }
  openEditor(editor) {
    return this.handleOpenedEditors();
  }
  openEditors(editors) {
    return this.handleOpenedEditors();
  }
  handleOpenedEditors() {
    const didChange = this.activeEditorChanged();
    this.activeEditor = this.tabsModel.activeEditor;
    return didChange;
  }
  activeEditorChanged() {
    if (!this.activeEditor && this.tabsModel.activeEditor || // active editor changed from null => editor
    this.activeEditor && !this.tabsModel.activeEditor || // active editor changed from editor => null
    !this.activeEditor || !this.tabsModel.isActive(this.activeEditor)) {
      return true;
    }
    return false;
  }
  beforeCloseEditor(editor) {
  }
  closeEditor(editor) {
  }
  closeEditors(editors) {
  }
  moveEditor(editor, fromIndex, targetIndex) {
  }
  pinEditor(editor) {
  }
  stickEditor(editor) {
  }
  unstickEditor(editor) {
  }
  setActive(isActive) {
  }
  updateEditorSelections() {
  }
  updateEditorLabel(editor) {
  }
  updateEditorDirty(editor) {
  }
  getHeight() {
    return 0;
  }
  layout(dimensions) {
    return new Dimension(dimensions.container.width, this.getHeight());
  }
}
export {
  NoEditorTabsControl
};
