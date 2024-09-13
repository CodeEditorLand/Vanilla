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
import {
  RunOnceScheduler,
  createCancelablePromise
} from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import * as platform from "../../../../base/common/platform.js";
import * as resources from "../../../../base/common/resources.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { URI } from "../../../../base/common/uri.js";
import "./links.css";
import * as nls from "../../../../nls.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import {
  MouseTargetType
} from "../../../browser/editorBrowser.js";
import {
  EditorAction,
  EditorContributionInstantiation,
  registerEditorAction,
  registerEditorContribution
} from "../../../browser/editorExtensions.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import {
  TrackedRangeStickiness
} from "../../../common/model.js";
import { ModelDecorationOptions } from "../../../common/model/textModel.js";
import {
  ILanguageFeatureDebounceService
} from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import {
  ClickLinkGesture
} from "../../gotoSymbol/browser/link/clickLinkGesture.js";
import { getLinks } from "./getLinks.js";
let LinkDetector = class extends Disposable {
  constructor(editor, openerService, notificationService, languageFeaturesService, languageFeatureDebounceService) {
    super();
    this.editor = editor;
    this.openerService = openerService;
    this.notificationService = notificationService;
    this.languageFeaturesService = languageFeaturesService;
    this.providers = this.languageFeaturesService.linkProvider;
    this.debounceInformation = languageFeatureDebounceService.for(this.providers, "Links", { min: 1e3, max: 4e3 });
    this.computeLinks = this._register(new RunOnceScheduler(() => this.computeLinksNow(), 1e3));
    this.computePromise = null;
    this.activeLinksList = null;
    this.currentOccurrences = {};
    this.activeLinkDecorationId = null;
    const clickLinkGesture = this._register(new ClickLinkGesture(editor));
    this._register(clickLinkGesture.onMouseMoveOrRelevantKeyDown(([mouseEvent, keyboardEvent]) => {
      this._onEditorMouseMove(mouseEvent, keyboardEvent);
    }));
    this._register(clickLinkGesture.onExecute((e) => {
      this.onEditorMouseUp(e);
    }));
    this._register(clickLinkGesture.onCancel((e) => {
      this.cleanUpActiveLinkDecoration();
    }));
    this._register(editor.onDidChangeConfiguration((e) => {
      if (!e.hasChanged(EditorOption.links)) {
        return;
      }
      this.updateDecorations([]);
      this.stop();
      this.computeLinks.schedule(0);
    }));
    this._register(editor.onDidChangeModelContent((e) => {
      if (!this.editor.hasModel()) {
        return;
      }
      this.computeLinks.schedule(this.debounceInformation.get(this.editor.getModel()));
    }));
    this._register(editor.onDidChangeModel((e) => {
      this.currentOccurrences = {};
      this.activeLinkDecorationId = null;
      this.stop();
      this.computeLinks.schedule(0);
    }));
    this._register(editor.onDidChangeModelLanguage((e) => {
      this.stop();
      this.computeLinks.schedule(0);
    }));
    this._register(this.providers.onDidChange((e) => {
      this.stop();
      this.computeLinks.schedule(0);
    }));
    this.computeLinks.schedule(0);
  }
  static {
    __name(this, "LinkDetector");
  }
  static ID = "editor.linkDetector";
  static get(editor) {
    return editor.getContribution(LinkDetector.ID);
  }
  providers;
  debounceInformation;
  computeLinks;
  computePromise;
  activeLinksList;
  activeLinkDecorationId;
  currentOccurrences;
  async computeLinksNow() {
    if (!this.editor.hasModel() || !this.editor.getOption(EditorOption.links)) {
      return;
    }
    const model = this.editor.getModel();
    if (model.isTooLargeForSyncing()) {
      return;
    }
    if (!this.providers.has(model)) {
      return;
    }
    if (this.activeLinksList) {
      this.activeLinksList.dispose();
      this.activeLinksList = null;
    }
    this.computePromise = createCancelablePromise(
      (token) => getLinks(this.providers, model, token)
    );
    try {
      const sw = new StopWatch(false);
      this.activeLinksList = await this.computePromise;
      this.debounceInformation.update(model, sw.elapsed());
      if (model.isDisposed()) {
        return;
      }
      this.updateDecorations(this.activeLinksList.links);
    } catch (err) {
      onUnexpectedError(err);
    } finally {
      this.computePromise = null;
    }
  }
  updateDecorations(links) {
    const useMetaKey = this.editor.getOption(EditorOption.multiCursorModifier) === "altKey";
    const oldDecorations = [];
    const keys = Object.keys(this.currentOccurrences);
    for (const decorationId of keys) {
      const occurence = this.currentOccurrences[decorationId];
      oldDecorations.push(occurence.decorationId);
    }
    const newDecorations = [];
    if (links) {
      for (const link of links) {
        newDecorations.push(
          LinkOccurrence.decoration(link, useMetaKey)
        );
      }
    }
    this.editor.changeDecorations((changeAccessor) => {
      const decorations = changeAccessor.deltaDecorations(
        oldDecorations,
        newDecorations
      );
      this.currentOccurrences = {};
      this.activeLinkDecorationId = null;
      for (let i = 0, len = decorations.length; i < len; i++) {
        const occurence = new LinkOccurrence(links[i], decorations[i]);
        this.currentOccurrences[occurence.decorationId] = occurence;
      }
    });
  }
  _onEditorMouseMove(mouseEvent, withKey) {
    const useMetaKey = this.editor.getOption(EditorOption.multiCursorModifier) === "altKey";
    if (this.isEnabled(mouseEvent, withKey)) {
      this.cleanUpActiveLinkDecoration();
      const occurrence = this.getLinkOccurrence(
        mouseEvent.target.position
      );
      if (occurrence) {
        this.editor.changeDecorations((changeAccessor) => {
          occurrence.activate(changeAccessor, useMetaKey);
          this.activeLinkDecorationId = occurrence.decorationId;
        });
      }
    } else {
      this.cleanUpActiveLinkDecoration();
    }
  }
  cleanUpActiveLinkDecoration() {
    const useMetaKey = this.editor.getOption(EditorOption.multiCursorModifier) === "altKey";
    if (this.activeLinkDecorationId) {
      const occurrence = this.currentOccurrences[this.activeLinkDecorationId];
      if (occurrence) {
        this.editor.changeDecorations((changeAccessor) => {
          occurrence.deactivate(changeAccessor, useMetaKey);
        });
      }
      this.activeLinkDecorationId = null;
    }
  }
  onEditorMouseUp(mouseEvent) {
    if (!this.isEnabled(mouseEvent)) {
      return;
    }
    const occurrence = this.getLinkOccurrence(mouseEvent.target.position);
    if (!occurrence) {
      return;
    }
    this.openLinkOccurrence(
      occurrence,
      mouseEvent.hasSideBySideModifier,
      true
    );
  }
  openLinkOccurrence(occurrence, openToSide, fromUserGesture = false) {
    if (!this.openerService) {
      return;
    }
    const { link } = occurrence;
    link.resolve(CancellationToken.None).then(
      (uri) => {
        if (typeof uri === "string" && this.editor.hasModel()) {
          const modelUri = this.editor.getModel().uri;
          if (modelUri.scheme === Schemas.file && uri.startsWith(`${Schemas.file}:`)) {
            const parsedUri = URI.parse(uri);
            if (parsedUri.scheme === Schemas.file) {
              const fsPath = resources.originalFSPath(parsedUri);
              let relativePath = null;
              if (fsPath.startsWith("/./") || fsPath.startsWith("\\.\\")) {
                relativePath = `.${fsPath.substr(1)}`;
              } else if (fsPath.startsWith("//./") || fsPath.startsWith("\\\\.\\")) {
                relativePath = `.${fsPath.substr(2)}`;
              }
              if (relativePath) {
                uri = resources.joinPath(
                  modelUri,
                  relativePath
                );
              }
            }
          }
        }
        return this.openerService.open(uri, {
          openToSide,
          fromUserGesture,
          allowContributedOpeners: true,
          allowCommands: true,
          fromWorkspace: true
        });
      },
      (err) => {
        const messageOrError = err instanceof Error ? err.message : err;
        if (messageOrError === "invalid") {
          this.notificationService.warn(
            nls.localize(
              "invalid.url",
              "Failed to open this link because it is not well-formed: {0}",
              link.url.toString()
            )
          );
        } else if (messageOrError === "missing") {
          this.notificationService.warn(
            nls.localize(
              "missing.url",
              "Failed to open this link because its target is missing."
            )
          );
        } else {
          onUnexpectedError(err);
        }
      }
    );
  }
  getLinkOccurrence(position) {
    if (!this.editor.hasModel() || !position) {
      return null;
    }
    const decorations = this.editor.getModel().getDecorationsInRange(
      {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      },
      0,
      true
    );
    for (const decoration2 of decorations) {
      const currentOccurrence = this.currentOccurrences[decoration2.id];
      if (currentOccurrence) {
        return currentOccurrence;
      }
    }
    return null;
  }
  isEnabled(mouseEvent, withKey) {
    return Boolean(
      mouseEvent.target.type === MouseTargetType.CONTENT_TEXT && (mouseEvent.hasTriggerModifier || withKey && withKey.keyCodeIsTriggerKey)
    );
  }
  stop() {
    this.computeLinks.cancel();
    if (this.activeLinksList) {
      this.activeLinksList?.dispose();
      this.activeLinksList = null;
    }
    if (this.computePromise) {
      this.computePromise.cancel();
      this.computePromise = null;
    }
  }
  dispose() {
    super.dispose();
    this.stop();
  }
};
LinkDetector = __decorateClass([
  __decorateParam(1, IOpenerService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, ILanguageFeaturesService),
  __decorateParam(4, ILanguageFeatureDebounceService)
], LinkDetector);
const decoration = {
  general: ModelDecorationOptions.register({
    description: "detected-link",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    collapseOnReplaceEdit: true,
    inlineClassName: "detected-link"
  }),
  active: ModelDecorationOptions.register({
    description: "detected-link-active",
    stickiness: TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
    collapseOnReplaceEdit: true,
    inlineClassName: "detected-link-active"
  })
};
class LinkOccurrence {
  static {
    __name(this, "LinkOccurrence");
  }
  static decoration(link, useMetaKey) {
    return {
      range: link.range,
      options: LinkOccurrence._getOptions(link, useMetaKey, false)
    };
  }
  static _getOptions(link, useMetaKey, isActive) {
    const options = {
      ...isActive ? decoration.active : decoration.general
    };
    options.hoverMessage = getHoverMessage(link, useMetaKey);
    return options;
  }
  decorationId;
  link;
  constructor(link, decorationId) {
    this.link = link;
    this.decorationId = decorationId;
  }
  activate(changeAccessor, useMetaKey) {
    changeAccessor.changeDecorationOptions(
      this.decorationId,
      LinkOccurrence._getOptions(this.link, useMetaKey, true)
    );
  }
  deactivate(changeAccessor, useMetaKey) {
    changeAccessor.changeDecorationOptions(
      this.decorationId,
      LinkOccurrence._getOptions(this.link, useMetaKey, false)
    );
  }
}
function getHoverMessage(link, useMetaKey) {
  const executeCmd = link.url && /^command:/i.test(link.url.toString());
  const label = link.tooltip ? link.tooltip : executeCmd ? nls.localize("links.navigate.executeCmd", "Execute command") : nls.localize("links.navigate.follow", "Follow link");
  const kb = useMetaKey ? platform.isMacintosh ? nls.localize("links.navigate.kb.meta.mac", "cmd + click") : nls.localize("links.navigate.kb.meta", "ctrl + click") : platform.isMacintosh ? nls.localize("links.navigate.kb.alt.mac", "option + click") : nls.localize("links.navigate.kb.alt", "alt + click");
  if (link.url) {
    let nativeLabel = "";
    if (/^command:/i.test(link.url.toString())) {
      const match = link.url.toString().match(/^command:([^?#]+)/);
      if (match) {
        const commandId = match[1];
        nativeLabel = nls.localize(
          "tooltip.explanation",
          "Execute command {0}",
          commandId
        );
      }
    }
    const hoverMessage = new MarkdownString("", true).appendLink(
      link.url.toString(true).replace(/ /g, "%20"),
      label,
      nativeLabel
    ).appendMarkdown(` (${kb})`);
    return hoverMessage;
  } else {
    return new MarkdownString().appendText(`${label} (${kb})`);
  }
}
__name(getHoverMessage, "getHoverMessage");
class OpenLinkAction extends EditorAction {
  static {
    __name(this, "OpenLinkAction");
  }
  constructor() {
    super({
      id: "editor.action.openLink",
      label: nls.localize("label", "Open Link"),
      alias: "Open Link",
      precondition: void 0
    });
  }
  run(accessor, editor) {
    const linkDetector = LinkDetector.get(editor);
    if (!linkDetector) {
      return;
    }
    if (!editor.hasModel()) {
      return;
    }
    const selections = editor.getSelections();
    for (const sel of selections) {
      const link = linkDetector.getLinkOccurrence(sel.getEndPosition());
      if (link) {
        linkDetector.openLinkOccurrence(link, false);
      }
    }
  }
}
registerEditorContribution(
  LinkDetector.ID,
  LinkDetector,
  EditorContributionInstantiation.AfterFirstRender
);
registerEditorAction(OpenLinkAction);
export {
  LinkDetector
};
//# sourceMappingURL=links.js.map
