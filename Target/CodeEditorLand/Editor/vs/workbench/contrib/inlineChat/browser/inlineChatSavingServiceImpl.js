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
import { Queue, raceCancellation } from "../../../../base/common/async.js";
import { Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import {
  DisposableStore,
  MutableDisposable,
  combinedDisposable,
  dispose
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { compare } from "../../../../base/common/strings.js";
import {
  isCodeEditor
} from "../../../../editor/browser/editorBrowser.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { SaveReason } from "../../../common/editor.js";
import {
  GroupsOrder,
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.js";
import { IWorkingCopyFileService } from "../../../services/workingCopy/common/workingCopyFileService.js";
import { getNotebookEditorFromEditorPane } from "../../notebook/browser/notebookBrowser.js";
import { CellUri } from "../../notebook/common/notebookCommon.js";
import { InlineChatConfigKeys } from "../common/inlineChat.js";
import { InlineChatController } from "./inlineChatController.js";
import { IInlineChatSessionService } from "./inlineChatSessionService.js";
let InlineChatSavingServiceImpl = class {
  constructor(_fileConfigService, _editorGroupService, _textFileService, _editorService, _inlineChatSessionService, _configService, _workingCopyFileService, _logService) {
    this._fileConfigService = _fileConfigService;
    this._editorGroupService = _editorGroupService;
    this._textFileService = _textFileService;
    this._editorService = _editorService;
    this._inlineChatSessionService = _inlineChatSessionService;
    this._configService = _configService;
    this._workingCopyFileService = _workingCopyFileService;
    this._logService = _logService;
    this._store.add(Event.any(_inlineChatSessionService.onDidEndSession, _inlineChatSessionService.onDidStashSession)((e) => {
      this._sessionData.get(e.session)?.dispose();
    }));
  }
  static {
    __name(this, "InlineChatSavingServiceImpl");
  }
  _store = new DisposableStore();
  _saveParticipant = this._store.add(
    new MutableDisposable()
  );
  _sessionData = /* @__PURE__ */ new Map();
  dispose() {
    this._store.dispose();
    dispose(this._sessionData.values());
  }
  markChanged(session) {
    if (!this._sessionData.has(session)) {
      let uri = session.targetUri;
      if (uri.scheme === Schemas.vscodeNotebookCell) {
        const data = CellUri.parse(uri);
        if (!data) {
          return;
        }
        uri = data?.notebook;
      }
      if (this._sessionData.size === 0) {
        this._installSaveParticpant();
      }
      const saveConfigOverride = this._fileConfigService.disableAutoSave(uri);
      this._sessionData.set(session, {
        resourceUri: uri,
        groupCandidate: this._editorGroupService.activeGroup,
        session,
        dispose: /* @__PURE__ */ __name(() => {
          saveConfigOverride.dispose();
          this._sessionData.delete(session);
          if (this._sessionData.size === 0) {
            this._saveParticipant.clear();
          }
        }, "dispose")
      });
    }
  }
  _installSaveParticpant() {
    const queue = new Queue();
    const d1 = this._textFileService.files.addSaveParticipant({
      participate: /* @__PURE__ */ __name((model, ctx, progress, token) => {
        return queue.queue(
          () => this._participate(
            ctx.savedFrom ?? model.textEditorModel?.uri,
            ctx.reason,
            progress,
            token
          )
        );
      }, "participate")
    });
    const d2 = this._workingCopyFileService.addSaveParticipant({
      participate: /* @__PURE__ */ __name((workingCopy, ctx, progress, token) => {
        return queue.queue(
          () => this._participate(
            ctx.savedFrom ?? workingCopy.resource,
            ctx.reason,
            progress,
            token
          )
        );
      }, "participate")
    });
    this._saveParticipant.value = combinedDisposable(d1, d2, queue);
  }
  async _participate(uri, reason, progress, token) {
    if (reason !== SaveReason.EXPLICIT) {
      return;
    }
    if (!this._configService.getValue(
      InlineChatConfigKeys.AcceptedOrDiscardBeforeSave
    )) {
      return;
    }
    const sessions = /* @__PURE__ */ new Map();
    for (const [session, data] of this._sessionData) {
      if (uri?.toString() === data.resourceUri.toString()) {
        sessions.set(session, data);
      }
    }
    if (sessions.size === 0) {
      return;
    }
    progress.report({
      message: sessions.size === 1 ? localize(
        "inlineChat",
        "Waiting for Inline Chat changes to be Accepted or Discarded..."
      ) : localize(
        "inlineChat.N",
        "Waiting for Inline Chat changes in {0} editors to be Accepted or Discarded...",
        sessions.size
      )
    });
    const { groups, orphans } = this._getGroupsAndOrphans(
      sessions.values()
    );
    const editorsOpenedAndSessionsEnded = this._openAndWait(
      groups,
      token
    ).then(() => {
      if (token.isCancellationRequested) {
        return;
      }
      return this._openAndWait(
        Iterable.map(orphans, (s) => [
          this._editorGroupService.activeGroup,
          s
        ]),
        token
      );
    });
    const allSessionsEnded = this._whenSessionsEnded(
      Iterable.concat(
        groups.map((tuple) => tuple[1]),
        orphans
      ),
      token
    );
    await Promise.race([allSessionsEnded, editorsOpenedAndSessionsEnded]);
  }
  _getGroupsAndOrphans(sessions) {
    const groupByEditor = /* @__PURE__ */ new Map();
    for (const group of this._editorGroupService.getGroups(
      GroupsOrder.MOST_RECENTLY_ACTIVE
    )) {
      const candidate = group.activeEditorPane?.getControl();
      if (isCodeEditor(candidate)) {
        groupByEditor.set(candidate, group);
      }
    }
    const groups = [];
    const orphans = /* @__PURE__ */ new Set();
    for (const data of sessions) {
      const editor = this._inlineChatSessionService.getCodeEditor(
        data.session
      );
      const group = groupByEditor.get(editor);
      if (group) {
        groups.push([group, data]);
      } else if (this._editorGroupService.groups.includes(data.groupCandidate)) {
        groups.push([data.groupCandidate, data]);
      } else {
        orphans.add(data);
      }
    }
    return { groups, orphans };
  }
  async _openAndWait(groups, token) {
    const dataByGroup = /* @__PURE__ */ new Map();
    for (const [group, data] of groups) {
      let array = dataByGroup.get(group);
      if (!array) {
        array = [];
        dataByGroup.set(group, array);
      }
      array.push(data);
    }
    for (const [group, array] of dataByGroup) {
      if (token.isCancellationRequested) {
        break;
      }
      array.sort(
        (a, b) => compare(
          a.session.targetUri.toString(),
          b.session.targetUri.toString()
        )
      );
      for (const data of array) {
        const input = {
          resource: data.resourceUri
        };
        const pane = await this._editorService.openEditor(input, group);
        let editor;
        if (data.session.targetUri.scheme === Schemas.vscodeNotebookCell) {
          const notebookEditor = getNotebookEditorFromEditorPane(pane);
          const uriData = CellUri.parse(data.session.targetUri);
          if (notebookEditor && notebookEditor.hasModel() && uriData) {
            const cell = notebookEditor.getCellByHandle(
              uriData.handle
            );
            if (cell) {
              await notebookEditor.revealRangeInCenterIfOutsideViewportAsync(
                cell,
                data.session.wholeRange.value
              );
            }
            const tuple = notebookEditor.codeEditors.find(
              (tuple2) => tuple2[1].getModel()?.uri.toString() === data.session.targetUri.toString()
            );
            editor = tuple?.[1];
          }
        } else if (isCodeEditor(pane?.getControl())) {
          editor = pane.getControl();
        }
        if (!editor) {
          break;
        }
        this._inlineChatSessionService.moveSession(
          data.session,
          editor
        );
        InlineChatController.get(editor)?.showSaveHint();
        this._logService.info(
          "WAIT for session to end",
          editor.getId(),
          data.session.targetUri.toString()
        );
        await this._whenSessionsEnded(Iterable.single(data), token);
      }
    }
  }
  async _whenSessionsEnded(iterable, token) {
    const sessions = /* @__PURE__ */ new Map();
    for (const item of iterable) {
      sessions.set(item.session, item);
    }
    if (sessions.size === 0) {
      return;
    }
    let listener;
    const whenEnded = new Promise((resolve) => {
      listener = Event.any(
        this._inlineChatSessionService.onDidEndSession,
        this._inlineChatSessionService.onDidStashSession
      )((e) => {
        const data = sessions.get(e.session);
        if (data) {
          data.dispose();
          sessions.delete(e.session);
          if (sessions.size === 0) {
            resolve();
          }
        }
      });
    });
    try {
      await raceCancellation(whenEnded, token);
    } finally {
      listener?.dispose();
    }
  }
};
InlineChatSavingServiceImpl = __decorateClass([
  __decorateParam(0, IFilesConfigurationService),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, ITextFileService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IInlineChatSessionService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IWorkingCopyFileService),
  __decorateParam(7, ILogService)
], InlineChatSavingServiceImpl);
export {
  InlineChatSavingServiceImpl
};
//# sourceMappingURL=inlineChatSavingServiceImpl.js.map
