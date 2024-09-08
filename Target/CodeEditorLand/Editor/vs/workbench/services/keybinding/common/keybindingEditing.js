var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import { Queue } from "../../../../base/common/async.js";
import * as json from "../../../../base/common/json.js";
import { setProperty } from "../../../../base/common/jsonEdit.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import * as objects from "../../../../base/common/objects.js";
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import { Range } from "../../../../editor/common/core/range.js";
import { Selection } from "../../../../editor/common/core/selection.js";
import {
  ITextModelService
} from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
import { ITextFileService } from "../../textfile/common/textfiles.js";
import { IUserDataProfileService } from "../../userDataProfile/common/userDataProfile.js";
const IKeybindingEditingService = createDecorator("keybindingEditingService");
let KeybindingsEditingService = class extends Disposable {
  constructor(textModelResolverService, textFileService, fileService, userDataProfileService) {
    super();
    this.textModelResolverService = textModelResolverService;
    this.textFileService = textFileService;
    this.fileService = fileService;
    this.userDataProfileService = userDataProfileService;
    this.queue = new Queue();
  }
  _serviceBrand;
  queue;
  addKeybinding(keybindingItem, key, when) {
    return this.queue.queue(
      () => this.doEditKeybinding(keybindingItem, key, when, true)
    );
  }
  editKeybinding(keybindingItem, key, when) {
    return this.queue.queue(
      () => this.doEditKeybinding(keybindingItem, key, when, false)
    );
  }
  resetKeybinding(keybindingItem) {
    return this.queue.queue(() => this.doResetKeybinding(keybindingItem));
  }
  removeKeybinding(keybindingItem) {
    return this.queue.queue(() => this.doRemoveKeybinding(keybindingItem));
  }
  async doEditKeybinding(keybindingItem, key, when, add) {
    const reference = await this.resolveAndValidate();
    const model = reference.object.textEditorModel;
    if (add) {
      this.updateKeybinding(keybindingItem, key, when, model, -1);
    } else {
      const userKeybindingEntries = json.parse(model.getValue());
      const userKeybindingEntryIndex = this.findUserKeybindingEntryIndex(
        keybindingItem,
        userKeybindingEntries
      );
      this.updateKeybinding(
        keybindingItem,
        key,
        when,
        model,
        userKeybindingEntryIndex
      );
      if (keybindingItem.isDefault && keybindingItem.resolvedKeybinding) {
        this.removeDefaultKeybinding(keybindingItem, model);
      }
    }
    try {
      await this.save();
    } finally {
      reference.dispose();
    }
  }
  async doRemoveKeybinding(keybindingItem) {
    const reference = await this.resolveAndValidate();
    const model = reference.object.textEditorModel;
    if (keybindingItem.isDefault) {
      this.removeDefaultKeybinding(keybindingItem, model);
    } else {
      this.removeUserKeybinding(keybindingItem, model);
    }
    try {
      return await this.save();
    } finally {
      reference.dispose();
    }
  }
  async doResetKeybinding(keybindingItem) {
    const reference = await this.resolveAndValidate();
    const model = reference.object.textEditorModel;
    if (!keybindingItem.isDefault) {
      this.removeUserKeybinding(keybindingItem, model);
      this.removeUnassignedDefaultKeybinding(keybindingItem, model);
    }
    try {
      return await this.save();
    } finally {
      reference.dispose();
    }
  }
  save() {
    return this.textFileService.save(
      this.userDataProfileService.currentProfile.keybindingsResource
    );
  }
  updateKeybinding(keybindingItem, newKey, when, model, userKeybindingEntryIndex) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    if (userKeybindingEntryIndex !== -1) {
      this.applyEditsToBuffer(
        setProperty(
          model.getValue(),
          [userKeybindingEntryIndex, "key"],
          newKey,
          { tabSize, insertSpaces, eol }
        )[0],
        model
      );
      const edits = setProperty(
        model.getValue(),
        [userKeybindingEntryIndex, "when"],
        when,
        { tabSize, insertSpaces, eol }
      );
      if (edits.length > 0) {
        this.applyEditsToBuffer(edits[0], model);
      }
    } else {
      this.applyEditsToBuffer(
        setProperty(
          model.getValue(),
          [-1],
          this.asObject(newKey, keybindingItem.command, when, false),
          { tabSize, insertSpaces, eol }
        )[0],
        model
      );
    }
  }
  removeUserKeybinding(keybindingItem, model) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    const userKeybindingEntries = json.parse(model.getValue());
    const userKeybindingEntryIndex = this.findUserKeybindingEntryIndex(
      keybindingItem,
      userKeybindingEntries
    );
    if (userKeybindingEntryIndex !== -1) {
      this.applyEditsToBuffer(
        setProperty(
          model.getValue(),
          [userKeybindingEntryIndex],
          void 0,
          { tabSize, insertSpaces, eol }
        )[0],
        model
      );
    }
  }
  removeDefaultKeybinding(keybindingItem, model) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    const key = keybindingItem.resolvedKeybinding ? keybindingItem.resolvedKeybinding.getUserSettingsLabel() : null;
    if (key) {
      const entry = this.asObject(
        key,
        keybindingItem.command,
        keybindingItem.when ? keybindingItem.when.serialize() : void 0,
        true
      );
      const userKeybindingEntries = json.parse(model.getValue());
      if (userKeybindingEntries.every((e) => !this.areSame(e, entry))) {
        this.applyEditsToBuffer(
          setProperty(model.getValue(), [-1], entry, {
            tabSize,
            insertSpaces,
            eol
          })[0],
          model
        );
      }
    }
  }
  removeUnassignedDefaultKeybinding(keybindingItem, model) {
    const { tabSize, insertSpaces } = model.getOptions();
    const eol = model.getEOL();
    const userKeybindingEntries = json.parse(model.getValue());
    const indices = this.findUnassignedDefaultKeybindingEntryIndex(
      keybindingItem,
      userKeybindingEntries
    ).reverse();
    for (const index of indices) {
      this.applyEditsToBuffer(
        setProperty(model.getValue(), [index], void 0, {
          tabSize,
          insertSpaces,
          eol
        })[0],
        model
      );
    }
  }
  findUserKeybindingEntryIndex(keybindingItem, userKeybindingEntries) {
    for (let index = 0; index < userKeybindingEntries.length; index++) {
      const keybinding = userKeybindingEntries[index];
      if (keybinding.command === keybindingItem.command) {
        if (!keybinding.when && !keybindingItem.when) {
          return index;
        }
        if (keybinding.when && keybindingItem.when) {
          const contextKeyExpr = ContextKeyExpr.deserialize(
            keybinding.when
          );
          if (contextKeyExpr && contextKeyExpr.serialize() === keybindingItem.when.serialize()) {
            return index;
          }
        }
      }
    }
    return -1;
  }
  findUnassignedDefaultKeybindingEntryIndex(keybindingItem, userKeybindingEntries) {
    const indices = [];
    for (let index = 0; index < userKeybindingEntries.length; index++) {
      if (userKeybindingEntries[index].command === `-${keybindingItem.command}`) {
        indices.push(index);
      }
    }
    return indices;
  }
  asObject(key, command, when, negate) {
    const object = { key };
    if (command) {
      object["command"] = negate ? `-${command}` : command;
    }
    if (when) {
      object["when"] = when;
    }
    return object;
  }
  areSame(a, b) {
    if (a.command !== b.command) {
      return false;
    }
    if (a.key !== b.key) {
      return false;
    }
    const whenA = ContextKeyExpr.deserialize(a.when);
    const whenB = ContextKeyExpr.deserialize(b.when);
    if (whenA && !whenB || !whenA && whenB) {
      return false;
    }
    if (whenA && whenB && !whenA.equals(whenB)) {
      return false;
    }
    if (!objects.equals(a.args, b.args)) {
      return false;
    }
    return true;
  }
  applyEditsToBuffer(edit, model) {
    const startPosition = model.getPositionAt(edit.offset);
    const endPosition = model.getPositionAt(edit.offset + edit.length);
    const range = new Range(
      startPosition.lineNumber,
      startPosition.column,
      endPosition.lineNumber,
      endPosition.column
    );
    const currentText = model.getValueInRange(range);
    const editOperation = currentText ? EditOperation.replace(range, edit.content) : EditOperation.insert(startPosition, edit.content);
    model.pushEditOperations(
      [
        new Selection(
          startPosition.lineNumber,
          startPosition.column,
          startPosition.lineNumber,
          startPosition.column
        )
      ],
      [editOperation],
      () => []
    );
  }
  async resolveModelReference() {
    const exists = await this.fileService.exists(
      this.userDataProfileService.currentProfile.keybindingsResource
    );
    if (!exists) {
      await this.textFileService.write(
        this.userDataProfileService.currentProfile.keybindingsResource,
        this.getEmptyContent(),
        { encoding: "utf8" }
      );
    }
    return this.textModelResolverService.createModelReference(
      this.userDataProfileService.currentProfile.keybindingsResource
    );
  }
  async resolveAndValidate() {
    if (this.textFileService.isDirty(
      this.userDataProfileService.currentProfile.keybindingsResource
    )) {
      throw new Error(
        localize(
          "errorKeybindingsFileDirty",
          "Unable to write because the keybindings configuration file has unsaved changes. Please save it first and then try again."
        )
      );
    }
    const reference = await this.resolveModelReference();
    const model = reference.object.textEditorModel;
    const EOL = model.getEOL();
    if (model.getValue()) {
      const parsed = this.parse(model);
      if (parsed.parseErrors.length) {
        reference.dispose();
        throw new Error(
          localize(
            "parseErrors",
            "Unable to write to the keybindings configuration file. Please open it to correct errors/warnings in the file and try again."
          )
        );
      }
      if (parsed.result) {
        if (!Array.isArray(parsed.result)) {
          reference.dispose();
          throw new Error(
            localize(
              "errorInvalidConfiguration",
              "Unable to write to the keybindings configuration file. It has an object which is not of type Array. Please open the file to clean up and try again."
            )
          );
        }
      } else {
        const content = EOL + "[]";
        this.applyEditsToBuffer(
          {
            content,
            length: content.length,
            offset: model.getValue().length
          },
          model
        );
      }
    } else {
      const content = this.getEmptyContent();
      this.applyEditsToBuffer(
        { content, length: content.length, offset: 0 },
        model
      );
    }
    return reference;
  }
  parse(model) {
    const parseErrors = [];
    const result = json.parse(model.getValue(), parseErrors, {
      allowTrailingComma: true,
      allowEmptyContent: true
    });
    return { result, parseErrors };
  }
  getEmptyContent() {
    return "// " + localize(
      "emptyKeybindingsHeader",
      "Place your key bindings in this file to override the defaults"
    ) + "\n[\n]";
  }
};
KeybindingsEditingService = __decorateClass([
  __decorateParam(0, ITextModelService),
  __decorateParam(1, ITextFileService),
  __decorateParam(2, IFileService),
  __decorateParam(3, IUserDataProfileService)
], KeybindingsEditingService);
registerSingleton(
  IKeybindingEditingService,
  KeybindingsEditingService,
  InstantiationType.Delayed
);
export {
  IKeybindingEditingService,
  KeybindingsEditingService
};
