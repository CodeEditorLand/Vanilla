var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Promises } from "../../base/common/async.js";
import { Emitter } from "../../base/common/event.js";
import { Iterable } from "../../base/common/iterator.js";
import { toDisposable } from "../../base/common/lifecycle.js";
import { Schemas } from "../../base/common/network.js";
import { localize } from "../../nls.js";
import { Registry } from "../../platform/registry/common/platform.js";
import { IUriIdentityService } from "../../platform/uriIdentity/common/uriIdentity.js";
import {
  EditorCloseContext,
  EditorExtensions,
  EditorResourceAccessor,
  SideBySideEditor
} from "../common/editor.js";
import { IEditorService } from "../services/editor/common/editorService.js";
import { IWorkingCopyService } from "../services/workingCopy/common/workingCopyService.js";
class EditorPaneDescriptor {
  constructor(ctor, typeId, name) {
    this.ctor = ctor;
    this.typeId = typeId;
    this.name = name;
  }
  static {
    __name(this, "EditorPaneDescriptor");
  }
  static instantiatedEditorPanes = /* @__PURE__ */ new Set();
  static didInstantiateEditorPane(typeId) {
    return EditorPaneDescriptor.instantiatedEditorPanes.has(typeId);
  }
  static _onWillInstantiateEditorPane = new Emitter();
  static onWillInstantiateEditorPane = EditorPaneDescriptor._onWillInstantiateEditorPane.event;
  static create(ctor, typeId, name) {
    return new EditorPaneDescriptor(
      ctor,
      typeId,
      name
    );
  }
  instantiate(instantiationService, group) {
    EditorPaneDescriptor._onWillInstantiateEditorPane.fire({
      typeId: this.typeId
    });
    const pane = instantiationService.createInstance(this.ctor, group);
    EditorPaneDescriptor.instantiatedEditorPanes.add(this.typeId);
    return pane;
  }
  describes(editorPane) {
    return editorPane.getId() === this.typeId;
  }
}
class EditorPaneRegistry {
  static {
    __name(this, "EditorPaneRegistry");
  }
  mapEditorPanesToEditors = /* @__PURE__ */ new Map();
  registerEditorPane(editorPaneDescriptor, editorDescriptors) {
    this.mapEditorPanesToEditors.set(
      editorPaneDescriptor,
      editorDescriptors
    );
    return toDisposable(() => {
      this.mapEditorPanesToEditors.delete(editorPaneDescriptor);
    });
  }
  getEditorPane(editor) {
    const descriptors = this.findEditorPaneDescriptors(editor);
    if (descriptors.length === 0) {
      return void 0;
    }
    if (descriptors.length === 1) {
      return descriptors[0];
    }
    return editor.prefersEditorPane(descriptors);
  }
  findEditorPaneDescriptors(editor, byInstanceOf) {
    const matchingEditorPaneDescriptors = [];
    for (const editorPane of this.mapEditorPanesToEditors.keys()) {
      const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane) || [];
      for (const editorDescriptor of editorDescriptors) {
        const editorClass = editorDescriptor.ctor;
        if (!byInstanceOf && editor.constructor === editorClass) {
          matchingEditorPaneDescriptors.push(editorPane);
          break;
        } else if (byInstanceOf && editor instanceof editorClass) {
          matchingEditorPaneDescriptors.push(editorPane);
          break;
        }
      }
    }
    if (!byInstanceOf && matchingEditorPaneDescriptors.length === 0) {
      return this.findEditorPaneDescriptors(editor, true);
    }
    return matchingEditorPaneDescriptors;
  }
  //#region Used for tests only
  getEditorPaneByType(typeId) {
    return Iterable.find(
      this.mapEditorPanesToEditors.keys(),
      (editor) => editor.typeId === typeId
    );
  }
  getEditorPanes() {
    return Array.from(this.mapEditorPanesToEditors.keys());
  }
  getEditors() {
    const editorClasses = [];
    for (const editorPane of this.mapEditorPanesToEditors.keys()) {
      const editorDescriptors = this.mapEditorPanesToEditors.get(editorPane);
      if (editorDescriptors) {
        editorClasses.push(
          ...editorDescriptors.map(
            (editorDescriptor) => editorDescriptor.ctor
          )
        );
      }
    }
    return editorClasses;
  }
  //#endregion
}
Registry.add(EditorExtensions.EditorPane, new EditorPaneRegistry());
function whenEditorClosed(accessor, resources) {
  const editorService = accessor.get(IEditorService);
  const uriIdentityService = accessor.get(IUriIdentityService);
  const workingCopyService = accessor.get(IWorkingCopyService);
  return new Promise((resolve) => {
    let remainingResources = [...resources];
    const listener = editorService.onDidCloseEditor(async (event) => {
      if (event.context === EditorCloseContext.MOVE) {
        return;
      }
      let primaryResource = EditorResourceAccessor.getOriginalUri(
        event.editor,
        { supportSideBySide: SideBySideEditor.PRIMARY }
      );
      let secondaryResource = EditorResourceAccessor.getOriginalUri(
        event.editor,
        { supportSideBySide: SideBySideEditor.SECONDARY }
      );
      if (event.context === EditorCloseContext.REPLACE) {
        const newPrimaryResource = EditorResourceAccessor.getOriginalUri(
          editorService.activeEditor,
          { supportSideBySide: SideBySideEditor.PRIMARY }
        );
        const newSecondaryResource = EditorResourceAccessor.getOriginalUri(
          editorService.activeEditor,
          { supportSideBySide: SideBySideEditor.SECONDARY }
        );
        if (uriIdentityService.extUri.isEqual(
          primaryResource,
          newPrimaryResource
        )) {
          primaryResource = void 0;
        }
        if (uriIdentityService.extUri.isEqual(
          secondaryResource,
          newSecondaryResource
        )) {
          secondaryResource = void 0;
        }
      }
      remainingResources = remainingResources.filter((resource) => {
        if (uriIdentityService.extUri.isEqual(
          resource,
          primaryResource
        ) || uriIdentityService.extUri.isEqual(
          resource,
          secondaryResource
        )) {
          return false;
        }
        if (event.context !== EditorCloseContext.REPLACE) {
          if (primaryResource?.scheme === Schemas.untitled && uriIdentityService.extUri.isEqual(
            resource,
            primaryResource.with({
              scheme: resource.scheme
            })
          ) || secondaryResource?.scheme === Schemas.untitled && uriIdentityService.extUri.isEqual(
            resource,
            secondaryResource.with({
              scheme: resource.scheme
            })
          )) {
            return false;
          }
        }
        return true;
      });
      if (remainingResources.length === 0) {
        const dirtyResources = resources.filter(
          (resource) => workingCopyService.isDirty(resource)
        );
        if (dirtyResources.length > 0) {
          await Promises.settled(
            dirtyResources.map(
              async (resource) => await new Promise((resolve2) => {
                if (!workingCopyService.isDirty(resource)) {
                  return resolve2();
                }
                const listener2 = workingCopyService.onDidChangeDirty(
                  (workingCopy) => {
                    if (!workingCopy.isDirty() && uriIdentityService.extUri.isEqual(
                      resource,
                      workingCopy.resource
                    )) {
                      listener2.dispose();
                      return resolve2();
                    }
                  }
                );
              })
            )
          );
        }
        listener.dispose();
        return resolve();
      }
    });
  });
}
__name(whenEditorClosed, "whenEditorClosed");
function computeEditorAriaLabel(input, index, group, groupCount) {
  let ariaLabel = input.getAriaLabel();
  if (group && !group.isPinned(input)) {
    ariaLabel = localize("preview", "{0}, preview", ariaLabel);
  }
  if (group?.isSticky(index ?? input)) {
    ariaLabel = localize("pinned", "{0}, pinned", ariaLabel);
  }
  if (group && typeof groupCount === "number" && groupCount > 1) {
    ariaLabel = `${ariaLabel}, ${group.ariaLabel}`;
  }
  return ariaLabel;
}
__name(computeEditorAriaLabel, "computeEditorAriaLabel");
export {
  EditorPaneDescriptor,
  EditorPaneRegistry,
  computeEditorAriaLabel,
  whenEditorClosed
};
//# sourceMappingURL=editor.js.map
