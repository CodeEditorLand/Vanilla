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
import * as dom from "../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore
} from "../../../../../base/common/lifecycle.js";
import { basename, dirname } from "../../../../../base/common/path.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { localize } from "../../../../../nls.js";
import { FileKind } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { ResourceLabels } from "../../../../browser/labels.js";
import {
  ChatResponseReferencePartStatusKind
} from "../../common/chatService.js";
let ChatAttachmentsContentPart = class extends Disposable {
  constructor(variables, contentReferences = [], domNode = dom.$(".chat-attached-context"), instantiationService, openerService) {
    super();
    this.variables = variables;
    this.contentReferences = contentReferences;
    this.domNode = domNode;
    this.instantiationService = instantiationService;
    this.openerService = openerService;
    this.initAttachedContext(domNode);
  }
  static {
    __name(this, "ChatAttachmentsContentPart");
  }
  attachedContextDisposables = this._register(
    new DisposableStore()
  );
  _onDidChangeVisibility = this._register(
    new Emitter()
  );
  _contextResourceLabels = this.instantiationService.createInstance(ResourceLabels, {
    onDidChangeVisibility: this._onDidChangeVisibility.event
  });
  initAttachedContext(container) {
    dom.clearNode(container);
    this.attachedContextDisposables.clear();
    dom.setVisibility(Boolean(this.variables.length), this.domNode);
    this.variables.forEach((attachment) => {
      const widget = dom.append(
        container,
        dom.$(".chat-attached-context-attachment.show-file-icons")
      );
      const label = this._contextResourceLabels.create(widget, {
        supportIcons: true
      });
      const file = URI.isUri(attachment.value) ? attachment.value : attachment.value && typeof attachment.value === "object" && "uri" in attachment.value && URI.isUri(attachment.value.uri) ? attachment.value.uri : void 0;
      const range = attachment.value && typeof attachment.value === "object" && "range" in attachment.value && Range.isIRange(attachment.value.range) ? attachment.value.range : void 0;
      const correspondingContentReference = this.contentReferences.find(
        (ref) => typeof ref.reference === "object" && "variableName" in ref.reference && ref.reference.variableName === attachment.name
      );
      const isAttachmentOmitted = correspondingContentReference?.options?.status?.kind === ChatResponseReferencePartStatusKind.Omitted;
      const isAttachmentPartialOrOmitted = isAttachmentOmitted || correspondingContentReference?.options?.status?.kind === ChatResponseReferencePartStatusKind.Partial;
      if (file) {
        const fileBasename = basename(file.path);
        const fileDirname = dirname(file.path);
        const friendlyName = `${fileBasename} ${fileDirname}`;
        let ariaLabel;
        if (isAttachmentOmitted) {
          ariaLabel = range ? localize(
            "chat.omittedFileAttachmentWithRange",
            "Omitted: {0}, line {1} to line {2}.",
            friendlyName,
            range.startLineNumber,
            range.endLineNumber
          ) : localize(
            "chat.omittedFileAttachment",
            "Omitted: {0}.",
            friendlyName
          );
        } else if (isAttachmentPartialOrOmitted) {
          ariaLabel = range ? localize(
            "chat.partialFileAttachmentWithRange",
            "Partially attached: {0}, line {1} to line {2}.",
            friendlyName,
            range.startLineNumber,
            range.endLineNumber
          ) : localize(
            "chat.partialFileAttachment",
            "Partially attached: {0}.",
            friendlyName
          );
        } else {
          ariaLabel = range ? localize(
            "chat.fileAttachmentWithRange3",
            "Attached: {0}, line {1} to line {2}.",
            friendlyName,
            range.startLineNumber,
            range.endLineNumber
          ) : localize(
            "chat.fileAttachment3",
            "Attached: {0}.",
            friendlyName
          );
        }
        label.setFile(file, {
          fileKind: FileKind.FILE,
          hidePath: true,
          range,
          title: correspondingContentReference?.options?.status?.description
        });
        widget.ariaLabel = ariaLabel;
        widget.tabIndex = 0;
        widget.style.cursor = "pointer";
        this.attachedContextDisposables.add(
          dom.addDisposableListener(
            widget,
            dom.EventType.CLICK,
            async (e) => {
              dom.EventHelper.stop(e, true);
              if (file) {
                this.openerService.open(file, {
                  fromUserGesture: true,
                  editorOptions: {
                    selection: range
                  }
                });
              }
            }
          )
        );
      } else {
        const attachmentLabel = attachment.fullName ?? attachment.name;
        const withIcon = attachment.icon?.id ? `$(${attachment.icon.id}) ${attachmentLabel}` : attachmentLabel;
        label.setLabel(
          withIcon,
          correspondingContentReference?.options?.status?.description
        );
        widget.ariaLabel = localize(
          "chat.attachment3",
          "Attached context: {0}.",
          attachment.name
        );
        widget.tabIndex = 0;
      }
      if (isAttachmentPartialOrOmitted) {
        widget.classList.add("warning");
      }
      const description = correspondingContentReference?.options?.status?.description;
      if (isAttachmentPartialOrOmitted) {
        widget.ariaLabel = `${widget.ariaLabel}${description ? ` ${description}` : ""}`;
        for (const selector of [
          ".monaco-icon-suffix-container",
          ".monaco-icon-name-container"
        ]) {
          const element = label.element.querySelector(selector);
          if (element) {
            element.classList.add("warning");
          }
        }
      }
    });
  }
};
ChatAttachmentsContentPart = __decorateClass([
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IOpenerService)
], ChatAttachmentsContentPart);
export {
  ChatAttachmentsContentPart
};
//# sourceMappingURL=chatAttachmentsContentPart.js.map
