class TreeViewsDnDService {
  _serviceBrand;
  _dragOperations = /* @__PURE__ */ new Map();
  removeDragOperationTransfer(uuid) {
    if (uuid && this._dragOperations.has(uuid)) {
      const operation = this._dragOperations.get(uuid);
      this._dragOperations.delete(uuid);
      return operation;
    }
    return void 0;
  }
  addDragOperationTransfer(uuid, transferPromise) {
    this._dragOperations.set(uuid, transferPromise);
  }
}
class DraggedTreeItemsIdentifier {
  constructor(identifier) {
    this.identifier = identifier;
  }
}
export {
  DraggedTreeItemsIdentifier,
  TreeViewsDnDService
};
