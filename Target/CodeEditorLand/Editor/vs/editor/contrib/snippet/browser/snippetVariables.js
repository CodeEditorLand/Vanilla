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
import { normalizeDriveLetter } from "../../../../base/common/labels.js";
import * as path from "../../../../base/common/path.js";
import { dirname } from "../../../../base/common/resources.js";
import {
  commonPrefixLength,
  getLeadingWhitespace,
  isFalsyOrWhitespace,
  splitLines
} from "../../../../base/common/strings.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import * as nls from "../../../../nls.js";
import {
  WORKSPACE_EXTENSION,
  isEmptyWorkspaceIdentifier,
  isSingleFolderWorkspaceIdentifier,
  toWorkspaceIdentifier
} from "../../../../platform/workspace/common/workspace.js";
import { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import { Text } from "./snippetParser.js";
const KnownSnippetVariableNames = Object.freeze(
  {
    CURRENT_YEAR: true,
    CURRENT_YEAR_SHORT: true,
    CURRENT_MONTH: true,
    CURRENT_DATE: true,
    CURRENT_HOUR: true,
    CURRENT_MINUTE: true,
    CURRENT_SECOND: true,
    CURRENT_DAY_NAME: true,
    CURRENT_DAY_NAME_SHORT: true,
    CURRENT_MONTH_NAME: true,
    CURRENT_MONTH_NAME_SHORT: true,
    CURRENT_SECONDS_UNIX: true,
    CURRENT_TIMEZONE_OFFSET: true,
    SELECTION: true,
    CLIPBOARD: true,
    TM_SELECTED_TEXT: true,
    TM_CURRENT_LINE: true,
    TM_CURRENT_WORD: true,
    TM_LINE_INDEX: true,
    TM_LINE_NUMBER: true,
    TM_FILENAME: true,
    TM_FILENAME_BASE: true,
    TM_DIRECTORY: true,
    TM_FILEPATH: true,
    CURSOR_INDEX: true,
    // 0-offset
    CURSOR_NUMBER: true,
    // 1-offset
    RELATIVE_FILEPATH: true,
    BLOCK_COMMENT_START: true,
    BLOCK_COMMENT_END: true,
    LINE_COMMENT: true,
    WORKSPACE_NAME: true,
    WORKSPACE_FOLDER: true,
    RANDOM: true,
    RANDOM_HEX: true,
    UUID: true
  }
);
class CompositeSnippetVariableResolver {
  constructor(_delegates) {
    this._delegates = _delegates;
  }
  static {
    __name(this, "CompositeSnippetVariableResolver");
  }
  resolve(variable) {
    for (const delegate of this._delegates) {
      const value = delegate.resolve(variable);
      if (value !== void 0) {
        return value;
      }
    }
    return void 0;
  }
}
class SelectionBasedVariableResolver {
  constructor(_model, _selection, _selectionIdx, _overtypingCapturer) {
    this._model = _model;
    this._selection = _selection;
    this._selectionIdx = _selectionIdx;
    this._overtypingCapturer = _overtypingCapturer;
  }
  static {
    __name(this, "SelectionBasedVariableResolver");
  }
  resolve(variable) {
    const { name } = variable;
    if (name === "SELECTION" || name === "TM_SELECTED_TEXT") {
      let value = this._model.getValueInRange(this._selection) || void 0;
      let isMultiline = this._selection.startLineNumber !== this._selection.endLineNumber;
      if (!value && this._overtypingCapturer) {
        const info = this._overtypingCapturer.getLastOvertypedInfo(
          this._selectionIdx
        );
        if (info) {
          value = info.value;
          isMultiline = info.multiline;
        }
      }
      if (value && isMultiline && variable.snippet) {
        const line = this._model.getLineContent(
          this._selection.startLineNumber
        );
        const lineLeadingWhitespace = getLeadingWhitespace(
          line,
          0,
          this._selection.startColumn - 1
        );
        let varLeadingWhitespace = lineLeadingWhitespace;
        variable.snippet.walk((marker) => {
          if (marker === variable) {
            return false;
          }
          if (marker instanceof Text) {
            varLeadingWhitespace = getLeadingWhitespace(
              splitLines(marker.value).pop()
            );
          }
          return true;
        });
        const whitespaceCommonLength = commonPrefixLength(
          varLeadingWhitespace,
          lineLeadingWhitespace
        );
        value = value.replace(
          /(\r\n|\r|\n)(.*)/g,
          (m, newline, rest) => `${newline}${varLeadingWhitespace.substr(whitespaceCommonLength)}${rest}`
        );
      }
      return value;
    } else if (name === "TM_CURRENT_LINE") {
      return this._model.getLineContent(
        this._selection.positionLineNumber
      );
    } else if (name === "TM_CURRENT_WORD") {
      const info = this._model.getWordAtPosition({
        lineNumber: this._selection.positionLineNumber,
        column: this._selection.positionColumn
      });
      return info && info.word || void 0;
    } else if (name === "TM_LINE_INDEX") {
      return String(this._selection.positionLineNumber - 1);
    } else if (name === "TM_LINE_NUMBER") {
      return String(this._selection.positionLineNumber);
    } else if (name === "CURSOR_INDEX") {
      return String(this._selectionIdx);
    } else if (name === "CURSOR_NUMBER") {
      return String(this._selectionIdx + 1);
    }
    return void 0;
  }
}
class ModelBasedVariableResolver {
  constructor(_labelService, _model) {
    this._labelService = _labelService;
    this._model = _model;
  }
  static {
    __name(this, "ModelBasedVariableResolver");
  }
  resolve(variable) {
    const { name } = variable;
    if (name === "TM_FILENAME") {
      return path.basename(this._model.uri.fsPath);
    } else if (name === "TM_FILENAME_BASE") {
      const name2 = path.basename(this._model.uri.fsPath);
      const idx = name2.lastIndexOf(".");
      if (idx <= 0) {
        return name2;
      } else {
        return name2.slice(0, idx);
      }
    } else if (name === "TM_DIRECTORY") {
      if (path.dirname(this._model.uri.fsPath) === ".") {
        return "";
      }
      return this._labelService.getUriLabel(dirname(this._model.uri));
    } else if (name === "TM_FILEPATH") {
      return this._labelService.getUriLabel(this._model.uri);
    } else if (name === "RELATIVE_FILEPATH") {
      return this._labelService.getUriLabel(this._model.uri, {
        relative: true,
        noPrefix: true
      });
    }
    return void 0;
  }
}
class ClipboardBasedVariableResolver {
  constructor(_readClipboardText, _selectionIdx, _selectionCount, _spread) {
    this._readClipboardText = _readClipboardText;
    this._selectionIdx = _selectionIdx;
    this._selectionCount = _selectionCount;
    this._spread = _spread;
  }
  static {
    __name(this, "ClipboardBasedVariableResolver");
  }
  resolve(variable) {
    if (variable.name !== "CLIPBOARD") {
      return void 0;
    }
    const clipboardText = this._readClipboardText();
    if (!clipboardText) {
      return void 0;
    }
    if (this._spread) {
      const lines = clipboardText.split(/\r\n|\n|\r/).filter((s) => !isFalsyOrWhitespace(s));
      if (lines.length === this._selectionCount) {
        return lines[this._selectionIdx];
      }
    }
    return clipboardText;
  }
}
let CommentBasedVariableResolver = class {
  constructor(_model, _selection, _languageConfigurationService) {
    this._model = _model;
    this._selection = _selection;
    this._languageConfigurationService = _languageConfigurationService;
  }
  static {
    __name(this, "CommentBasedVariableResolver");
  }
  resolve(variable) {
    const { name } = variable;
    const langId = this._model.getLanguageIdAtPosition(
      this._selection.selectionStartLineNumber,
      this._selection.selectionStartColumn
    );
    const config = this._languageConfigurationService.getLanguageConfiguration(
      langId
    ).comments;
    if (!config) {
      return void 0;
    }
    if (name === "LINE_COMMENT") {
      return config.lineCommentToken || void 0;
    } else if (name === "BLOCK_COMMENT_START") {
      return config.blockCommentStartToken || void 0;
    } else if (name === "BLOCK_COMMENT_END") {
      return config.blockCommentEndToken || void 0;
    }
    return void 0;
  }
};
CommentBasedVariableResolver = __decorateClass([
  __decorateParam(2, ILanguageConfigurationService)
], CommentBasedVariableResolver);
class TimeBasedVariableResolver {
  static {
    __name(this, "TimeBasedVariableResolver");
  }
  static dayNames = [
    nls.localize("Sunday", "Sunday"),
    nls.localize("Monday", "Monday"),
    nls.localize("Tuesday", "Tuesday"),
    nls.localize("Wednesday", "Wednesday"),
    nls.localize("Thursday", "Thursday"),
    nls.localize("Friday", "Friday"),
    nls.localize("Saturday", "Saturday")
  ];
  static dayNamesShort = [
    nls.localize("SundayShort", "Sun"),
    nls.localize("MondayShort", "Mon"),
    nls.localize("TuesdayShort", "Tue"),
    nls.localize("WednesdayShort", "Wed"),
    nls.localize("ThursdayShort", "Thu"),
    nls.localize("FridayShort", "Fri"),
    nls.localize("SaturdayShort", "Sat")
  ];
  static monthNames = [
    nls.localize("January", "January"),
    nls.localize("February", "February"),
    nls.localize("March", "March"),
    nls.localize("April", "April"),
    nls.localize("May", "May"),
    nls.localize("June", "June"),
    nls.localize("July", "July"),
    nls.localize("August", "August"),
    nls.localize("September", "September"),
    nls.localize("October", "October"),
    nls.localize("November", "November"),
    nls.localize("December", "December")
  ];
  static monthNamesShort = [
    nls.localize("JanuaryShort", "Jan"),
    nls.localize("FebruaryShort", "Feb"),
    nls.localize("MarchShort", "Mar"),
    nls.localize("AprilShort", "Apr"),
    nls.localize("MayShort", "May"),
    nls.localize("JuneShort", "Jun"),
    nls.localize("JulyShort", "Jul"),
    nls.localize("AugustShort", "Aug"),
    nls.localize("SeptemberShort", "Sep"),
    nls.localize("OctoberShort", "Oct"),
    nls.localize("NovemberShort", "Nov"),
    nls.localize("DecemberShort", "Dec")
  ];
  _date = /* @__PURE__ */ new Date();
  resolve(variable) {
    const { name } = variable;
    if (name === "CURRENT_YEAR") {
      return String(this._date.getFullYear());
    } else if (name === "CURRENT_YEAR_SHORT") {
      return String(this._date.getFullYear()).slice(-2);
    } else if (name === "CURRENT_MONTH") {
      return String(this._date.getMonth().valueOf() + 1).padStart(2, "0");
    } else if (name === "CURRENT_DATE") {
      return String(this._date.getDate().valueOf()).padStart(2, "0");
    } else if (name === "CURRENT_HOUR") {
      return String(this._date.getHours().valueOf()).padStart(2, "0");
    } else if (name === "CURRENT_MINUTE") {
      return String(this._date.getMinutes().valueOf()).padStart(2, "0");
    } else if (name === "CURRENT_SECOND") {
      return String(this._date.getSeconds().valueOf()).padStart(2, "0");
    } else if (name === "CURRENT_DAY_NAME") {
      return TimeBasedVariableResolver.dayNames[this._date.getDay()];
    } else if (name === "CURRENT_DAY_NAME_SHORT") {
      return TimeBasedVariableResolver.dayNamesShort[this._date.getDay()];
    } else if (name === "CURRENT_MONTH_NAME") {
      return TimeBasedVariableResolver.monthNames[this._date.getMonth()];
    } else if (name === "CURRENT_MONTH_NAME_SHORT") {
      return TimeBasedVariableResolver.monthNamesShort[this._date.getMonth()];
    } else if (name === "CURRENT_SECONDS_UNIX") {
      return String(Math.floor(this._date.getTime() / 1e3));
    } else if (name === "CURRENT_TIMEZONE_OFFSET") {
      const rawTimeOffset = this._date.getTimezoneOffset();
      const sign = rawTimeOffset > 0 ? "-" : "+";
      const hours = Math.trunc(Math.abs(rawTimeOffset / 60));
      const hoursString = hours < 10 ? "0" + hours : hours;
      const minutes = Math.abs(rawTimeOffset) - hours * 60;
      const minutesString = minutes < 10 ? "0" + minutes : minutes;
      return sign + hoursString + ":" + minutesString;
    }
    return void 0;
  }
}
class WorkspaceBasedVariableResolver {
  constructor(_workspaceService) {
    this._workspaceService = _workspaceService;
  }
  static {
    __name(this, "WorkspaceBasedVariableResolver");
  }
  resolve(variable) {
    if (!this._workspaceService) {
      return void 0;
    }
    const workspaceIdentifier = toWorkspaceIdentifier(
      this._workspaceService.getWorkspace()
    );
    if (isEmptyWorkspaceIdentifier(workspaceIdentifier)) {
      return void 0;
    }
    if (variable.name === "WORKSPACE_NAME") {
      return this._resolveWorkspaceName(workspaceIdentifier);
    } else if (variable.name === "WORKSPACE_FOLDER") {
      return this._resoveWorkspacePath(workspaceIdentifier);
    }
    return void 0;
  }
  _resolveWorkspaceName(workspaceIdentifier) {
    if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return path.basename(workspaceIdentifier.uri.path);
    }
    let filename = path.basename(workspaceIdentifier.configPath.path);
    if (filename.endsWith(WORKSPACE_EXTENSION)) {
      filename = filename.substr(
        0,
        filename.length - WORKSPACE_EXTENSION.length - 1
      );
    }
    return filename;
  }
  _resoveWorkspacePath(workspaceIdentifier) {
    if (isSingleFolderWorkspaceIdentifier(workspaceIdentifier)) {
      return normalizeDriveLetter(workspaceIdentifier.uri.fsPath);
    }
    const filename = path.basename(workspaceIdentifier.configPath.path);
    let folderpath = workspaceIdentifier.configPath.fsPath;
    if (folderpath.endsWith(filename)) {
      folderpath = folderpath.substr(
        0,
        folderpath.length - filename.length - 1
      );
    }
    return folderpath ? normalizeDriveLetter(folderpath) : "/";
  }
}
class RandomBasedVariableResolver {
  static {
    __name(this, "RandomBasedVariableResolver");
  }
  resolve(variable) {
    const { name } = variable;
    if (name === "RANDOM") {
      return Math.random().toString().slice(-6);
    } else if (name === "RANDOM_HEX") {
      return Math.random().toString(16).slice(-6);
    } else if (name === "UUID") {
      return generateUuid();
    }
    return void 0;
  }
}
export {
  ClipboardBasedVariableResolver,
  CommentBasedVariableResolver,
  CompositeSnippetVariableResolver,
  KnownSnippetVariableNames,
  ModelBasedVariableResolver,
  RandomBasedVariableResolver,
  SelectionBasedVariableResolver,
  TimeBasedVariableResolver,
  WorkspaceBasedVariableResolver
};
//# sourceMappingURL=snippetVariables.js.map
