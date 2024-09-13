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
import "./media/editorquickaccess.css";
import { Codicon } from "../../../../base/common/codicons.js";
import {
  compareItemsByFuzzyScore,
  prepareQuery,
  scoreItemFuzzy
} from "../../../../base/common/fuzzyScorer.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { getIconClasses } from "../../../../editor/common/services/getIconClasses.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { localize } from "../../../../nls.js";
import {
  PickerQuickAccessProvider,
  TriggerAction
} from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import {
  quickPickItemScorerAccessor
} from "../../../../platform/quickinput/common/quickInput.js";
import {
  EditorResourceAccessor,
  EditorsOrder,
  SideBySideEditor
} from "../../../common/editor.js";
import {
  GroupsOrder,
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
let BaseEditorQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(prefix, editorGroupService, editorService, modelService, languageService) {
    super(
      prefix,
      {
        canAcceptInBackground: true,
        noResultsPick: {
          label: localize("noViewResults", "No matching editors"),
          groupId: -1
        }
      }
    );
    this.editorGroupService = editorGroupService;
    this.editorService = editorService;
    this.modelService = modelService;
    this.languageService = languageService;
  }
  static {
    __name(this, "BaseEditorQuickAccessProvider");
  }
  pickState = new class {
    scorerCache = /* @__PURE__ */ Object.create(null);
    isQuickNavigating = void 0;
    reset(isQuickNavigating) {
      if (!isQuickNavigating) {
        this.scorerCache = /* @__PURE__ */ Object.create(null);
      }
      this.isQuickNavigating = isQuickNavigating;
    }
  }();
  provide(picker, token) {
    this.pickState.reset(!!picker.quickNavigate);
    return super.provide(picker, token);
  }
  _getPicks(filter) {
    const query = prepareQuery(filter);
    const filteredEditorEntries = this.doGetEditorPickItems().filter(
      (entry) => {
        if (!query.normalized) {
          return true;
        }
        const itemScore = scoreItemFuzzy(
          entry,
          query,
          true,
          quickPickItemScorerAccessor,
          this.pickState.scorerCache
        );
        if (!itemScore.score) {
          return false;
        }
        entry.highlights = {
          label: itemScore.labelMatch,
          description: itemScore.descriptionMatch
        };
        return true;
      }
    );
    if (query.normalized) {
      const groups = this.editorGroupService.getGroups(GroupsOrder.GRID_APPEARANCE).map((group) => group.id);
      filteredEditorEntries.sort((entryA, entryB) => {
        if (entryA.groupId !== entryB.groupId) {
          return groups.indexOf(entryA.groupId) - groups.indexOf(entryB.groupId);
        }
        return compareItemsByFuzzyScore(
          entryA,
          entryB,
          query,
          true,
          quickPickItemScorerAccessor,
          this.pickState.scorerCache
        );
      });
    }
    const filteredEditorEntriesWithSeparators = [];
    if (this.editorGroupService.count > 1) {
      let lastGroupId;
      for (const entry of filteredEditorEntries) {
        if (typeof lastGroupId !== "number" || lastGroupId !== entry.groupId) {
          const group = this.editorGroupService.getGroup(
            entry.groupId
          );
          if (group) {
            filteredEditorEntriesWithSeparators.push({
              type: "separator",
              label: group.label
            });
          }
          lastGroupId = entry.groupId;
        }
        filteredEditorEntriesWithSeparators.push(entry);
      }
    } else {
      filteredEditorEntriesWithSeparators.push(...filteredEditorEntries);
    }
    return filteredEditorEntriesWithSeparators;
  }
  doGetEditorPickItems() {
    const editors = this.doGetEditors();
    const mapGroupIdToGroupAriaLabel = /* @__PURE__ */ new Map();
    for (const { groupId } of editors) {
      if (!mapGroupIdToGroupAriaLabel.has(groupId)) {
        const group = this.editorGroupService.getGroup(groupId);
        if (group) {
          mapGroupIdToGroupAriaLabel.set(groupId, group.ariaLabel);
        }
      }
    }
    return this.doGetEditors().map(
      ({ editor, groupId }) => {
        const resource = EditorResourceAccessor.getOriginalUri(editor, {
          supportSideBySide: SideBySideEditor.PRIMARY
        });
        const isDirty = editor.isDirty() && !editor.isSaving();
        const description = editor.getDescription();
        const nameAndDescription = description ? `${editor.getName()} ${description}` : editor.getName();
        return {
          groupId,
          resource,
          label: editor.getName(),
          ariaLabel: (() => {
            if (mapGroupIdToGroupAriaLabel.size > 1) {
              return isDirty ? localize(
                "entryAriaLabelWithGroupDirty",
                "{0}, unsaved changes, {1}",
                nameAndDescription,
                mapGroupIdToGroupAriaLabel.get(groupId)
              ) : localize(
                "entryAriaLabelWithGroup",
                "{0}, {1}",
                nameAndDescription,
                mapGroupIdToGroupAriaLabel.get(groupId)
              );
            }
            return isDirty ? localize(
              "entryAriaLabelDirty",
              "{0}, unsaved changes",
              nameAndDescription
            ) : nameAndDescription;
          })(),
          description,
          iconClasses: getIconClasses(
            this.modelService,
            this.languageService,
            resource,
            void 0,
            editor.getIcon()
          ).concat(editor.getLabelExtraClasses()),
          italic: !this.editorGroupService.getGroup(groupId)?.isPinned(editor),
          buttons: (() => {
            return [
              {
                iconClass: isDirty ? "dirty-editor " + ThemeIcon.asClassName(
                  Codicon.closeDirty
                ) : ThemeIcon.asClassName(Codicon.close),
                tooltip: localize(
                  "closeEditor",
                  "Close Editor"
                ),
                alwaysVisible: isDirty
              }
            ];
          })(),
          trigger: /* @__PURE__ */ __name(async () => {
            const group = this.editorGroupService.getGroup(groupId);
            if (group) {
              await group.closeEditor(editor, {
                preserveFocus: true
              });
              if (!group.contains(editor)) {
                return TriggerAction.REMOVE_ITEM;
              }
            }
            return TriggerAction.NO_ACTION;
          }, "trigger"),
          accept: /* @__PURE__ */ __name((keyMods, event) => this.editorGroupService.getGroup(groupId)?.openEditor(editor, {
            preserveFocus: event.inBackground
          }), "accept")
        };
      }
    );
  }
};
BaseEditorQuickAccessProvider = __decorateClass([
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IModelService),
  __decorateParam(4, ILanguageService)
], BaseEditorQuickAccessProvider);
let ActiveGroupEditorsByMostRecentlyUsedQuickAccess = class extends BaseEditorQuickAccessProvider {
  static {
    __name(this, "ActiveGroupEditorsByMostRecentlyUsedQuickAccess");
  }
  static PREFIX = "edt active ";
  constructor(editorGroupService, editorService, modelService, languageService) {
    super(
      ActiveGroupEditorsByMostRecentlyUsedQuickAccess.PREFIX,
      editorGroupService,
      editorService,
      modelService,
      languageService
    );
  }
  doGetEditors() {
    const group = this.editorGroupService.activeGroup;
    return group.getEditors(EditorsOrder.MOST_RECENTLY_ACTIVE).map((editor) => ({ editor, groupId: group.id }));
  }
};
ActiveGroupEditorsByMostRecentlyUsedQuickAccess = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService)
], ActiveGroupEditorsByMostRecentlyUsedQuickAccess);
let AllEditorsByAppearanceQuickAccess = class extends BaseEditorQuickAccessProvider {
  static {
    __name(this, "AllEditorsByAppearanceQuickAccess");
  }
  static PREFIX = "edt ";
  constructor(editorGroupService, editorService, modelService, languageService) {
    super(
      AllEditorsByAppearanceQuickAccess.PREFIX,
      editorGroupService,
      editorService,
      modelService,
      languageService
    );
  }
  doGetEditors() {
    const entries = [];
    for (const group of this.editorGroupService.getGroups(
      GroupsOrder.GRID_APPEARANCE
    )) {
      for (const editor of group.getEditors(EditorsOrder.SEQUENTIAL)) {
        entries.push({ editor, groupId: group.id });
      }
    }
    return entries;
  }
};
AllEditorsByAppearanceQuickAccess = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService)
], AllEditorsByAppearanceQuickAccess);
let AllEditorsByMostRecentlyUsedQuickAccess = class extends BaseEditorQuickAccessProvider {
  static {
    __name(this, "AllEditorsByMostRecentlyUsedQuickAccess");
  }
  static PREFIX = "edt mru ";
  constructor(editorGroupService, editorService, modelService, languageService) {
    super(
      AllEditorsByMostRecentlyUsedQuickAccess.PREFIX,
      editorGroupService,
      editorService,
      modelService,
      languageService
    );
  }
  doGetEditors() {
    const entries = [];
    for (const editor of this.editorService.getEditors(
      EditorsOrder.MOST_RECENTLY_ACTIVE
    )) {
      entries.push(editor);
    }
    return entries;
  }
};
AllEditorsByMostRecentlyUsedQuickAccess = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, IEditorService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ILanguageService)
], AllEditorsByMostRecentlyUsedQuickAccess);
export {
  ActiveGroupEditorsByMostRecentlyUsedQuickAccess,
  AllEditorsByAppearanceQuickAccess,
  AllEditorsByMostRecentlyUsedQuickAccess,
  BaseEditorQuickAccessProvider
};
//# sourceMappingURL=editorQuickAccess.js.map
