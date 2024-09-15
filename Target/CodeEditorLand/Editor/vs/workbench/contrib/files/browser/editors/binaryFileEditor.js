var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { localize } from "../../../../../nls.js";
import {
  EditorResolution
} from "../../../../../platform/editor/common/editor.js";
import { IStorageService } from "../../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import { BaseBinaryResourceEditor } from "../../../../browser/parts/editor/binaryEditor.js";
import { isEditorInputWithOptions } from "../../../../common/editor.js";
import { DiffEditorInput } from "../../../../common/editor/diffEditorInput.js";
import {
  IEditorResolverService,
  ResolvedStatus
} from "../../../../services/editor/common/editorResolverService.js";
import {
  BINARY_FILE_EDITOR_ID,
  BINARY_TEXT_FILE_MODE
} from "../../common/files.js";
import { FileEditorInput } from "./fileEditorInput.js";
let BinaryFileEditor = class extends BaseBinaryResourceEditor {
  constructor(group, telemetryService, themeService, editorResolverService, storageService) {
    super(
      BinaryFileEditor.ID,
      group,
      {
        openInternal: /* @__PURE__ */ __name((input, options) => this.openInternal(input, options), "openInternal")
      },
      telemetryService,
      themeService,
      storageService
    );
    this.editorResolverService = editorResolverService;
  }
  static {
    __name(this, "BinaryFileEditor");
  }
  static ID = BINARY_FILE_EDITOR_ID;
  async openInternal(input, options) {
    if (input instanceof FileEditorInput && this.group.activeEditor) {
      const activeEditor = this.group.activeEditor;
      const untypedActiveEditor = activeEditor?.toUntyped();
      if (!untypedActiveEditor) {
        return;
      }
      let resolvedEditor = await this.editorResolverService.resolveEditor(
        {
          ...untypedActiveEditor,
          options: {
            ...options,
            override: EditorResolution.PICK
          }
        },
        this.group
      );
      if (resolvedEditor === ResolvedStatus.NONE) {
        resolvedEditor = void 0;
      } else if (resolvedEditor === ResolvedStatus.ABORT) {
        return;
      }
      if (isEditorInputWithOptions(resolvedEditor)) {
        for (const editor of resolvedEditor.editor instanceof DiffEditorInput ? [
          resolvedEditor.editor.original,
          resolvedEditor.editor.modified
        ] : [resolvedEditor.editor]) {
          if (editor instanceof FileEditorInput) {
            editor.setForceOpenAsText();
            editor.setPreferredLanguageId(BINARY_TEXT_FILE_MODE);
          }
        }
      }
      await this.group.replaceEditors([
        {
          editor: activeEditor,
          replacement: resolvedEditor?.editor ?? input,
          options: {
            ...resolvedEditor?.options ?? options
          }
        }
      ]);
    }
  }
  getTitle() {
    return this.input ? this.input.getName() : localize("binaryFileEditor", "Binary File Viewer");
  }
};
BinaryFileEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IEditorResolverService),
  __decorateParam(4, IStorageService)
], BinaryFileEditor);
export {
  BinaryFileEditor
};
//# sourceMappingURL=binaryFileEditor.js.map
