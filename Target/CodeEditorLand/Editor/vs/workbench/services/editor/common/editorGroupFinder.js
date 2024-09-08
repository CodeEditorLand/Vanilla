import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { EditorActivation } from "../../../../platform/editor/common/editor.js";
import {
  EditorInputCapabilities,
  isEditorInput,
  isEditorInputWithOptions
} from "../../../common/editor.js";
import {
  GroupsOrder,
  IEditorGroupsService,
  preferredSideBySideGroupDirection
} from "./editorGroupsService.js";
import {
  AUX_WINDOW_GROUP,
  SIDE_GROUP
} from "./editorService.js";
function findGroup(accessor, editor, preferredGroup) {
  const editorGroupService = accessor.get(IEditorGroupsService);
  const configurationService = accessor.get(IConfigurationService);
  const group = doFindGroup(
    editor,
    preferredGroup,
    editorGroupService,
    configurationService
  );
  if (group instanceof Promise) {
    return group.then(
      (group2) => handleGroupActivation(
        group2,
        editor,
        preferredGroup,
        editorGroupService
      )
    );
  }
  return handleGroupActivation(
    group,
    editor,
    preferredGroup,
    editorGroupService
  );
}
function handleGroupActivation(group, editor, preferredGroup, editorGroupService) {
  let activation;
  if (editorGroupService.activeGroup !== group && // only if target group is not already active
  editor.options && !editor.options.inactive && // never for inactive editors
  editor.options.preserveFocus && // only if preserveFocus
  typeof editor.options.activation !== "number" && // only if activation is not already defined (either true or false)
  preferredGroup !== SIDE_GROUP) {
    activation = EditorActivation.ACTIVATE;
  }
  return [group, activation];
}
function doFindGroup(input, preferredGroup, editorGroupService, configurationService) {
  let group;
  const editor = isEditorInputWithOptions(input) ? input.editor : input;
  const options = input.options;
  if (preferredGroup && typeof preferredGroup !== "number") {
    group = preferredGroup;
  } else if (typeof preferredGroup === "number" && preferredGroup >= 0) {
    group = editorGroupService.getGroup(preferredGroup);
  } else if (preferredGroup === SIDE_GROUP) {
    const direction = preferredSideBySideGroupDirection(configurationService);
    let candidateGroup = editorGroupService.findGroup({ direction });
    if (!candidateGroup || isGroupLockedForEditor(candidateGroup, editor)) {
      candidateGroup = editorGroupService.addGroup(
        editorGroupService.activeGroup,
        direction
      );
    }
    group = candidateGroup;
  } else if (preferredGroup === AUX_WINDOW_GROUP) {
    group = editorGroupService.createAuxiliaryEditorPart().then((group2) => group2.activeGroup);
  } else if (!options || typeof options.index !== "number") {
    const groupsByLastActive = editorGroupService.getGroups(
      GroupsOrder.MOST_RECENTLY_ACTIVE
    );
    if (options?.revealIfVisible) {
      for (const lastActiveGroup of groupsByLastActive) {
        if (isActive(lastActiveGroup, editor)) {
          group = lastActiveGroup;
          break;
        }
      }
    }
    if (!group) {
      if (options?.revealIfOpened || configurationService.getValue(
        "workbench.editor.revealIfOpen"
      ) || isEditorInput(editor) && editor.hasCapability(EditorInputCapabilities.Singleton)) {
        let groupWithInputActive;
        let groupWithInputOpened;
        for (const group2 of groupsByLastActive) {
          if (isOpened(group2, editor)) {
            if (!groupWithInputOpened) {
              groupWithInputOpened = group2;
            }
            if (!groupWithInputActive && group2.isActive(editor)) {
              groupWithInputActive = group2;
            }
          }
          if (groupWithInputOpened && groupWithInputActive) {
            break;
          }
        }
        group = groupWithInputActive || groupWithInputOpened;
      }
    }
  }
  if (!group) {
    let candidateGroup = editorGroupService.activeGroup;
    if (isGroupLockedForEditor(candidateGroup, editor)) {
      for (const group2 of editorGroupService.getGroups(
        GroupsOrder.MOST_RECENTLY_ACTIVE
      )) {
        if (isGroupLockedForEditor(group2, editor)) {
          continue;
        }
        candidateGroup = group2;
        break;
      }
      if (isGroupLockedForEditor(candidateGroup, editor)) {
        group = editorGroupService.addGroup(
          candidateGroup,
          preferredSideBySideGroupDirection(configurationService)
        );
      } else {
        group = candidateGroup;
      }
    } else {
      group = candidateGroup;
    }
  }
  return group;
}
function isGroupLockedForEditor(group, editor) {
  if (!group.isLocked) {
    return false;
  }
  if (isOpened(group, editor)) {
    return false;
  }
  return true;
}
function isActive(group, editor) {
  if (!group.activeEditor) {
    return false;
  }
  return group.activeEditor.matches(editor);
}
function isOpened(group, editor) {
  for (const typedEditor of group.editors) {
    if (typedEditor.matches(editor)) {
      return true;
    }
  }
  return false;
}
export {
  findGroup
};
