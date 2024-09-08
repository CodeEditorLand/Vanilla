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
import * as dom from "../../../../../base/browser/dom.js";
import { Emitter } from "../../../../../base/common/event.js";
import {
  Disposable
} from "../../../../../base/common/lifecycle.js";
import { equalsIgnoreCase } from "../../../../../base/common/strings.js";
import { Range } from "../../../../../editor/common/core/range.js";
import {
  ITextModelService
} from "../../../../../editor/common/services/resolverService.js";
import { MenuId } from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { isRequestVM, isResponseVM } from "../../common/chatViewModel.js";
import { ChatMarkdownDecorationsRenderer } from "../chatMarkdownDecorationsRenderer.js";
import {
  CodeBlockPart,
  localFileLanguageId,
  parseLocalFileData
} from "../codeBlockPart.js";
import { ResourcePool } from "./chatCollections.js";
const $ = dom.$;
let ChatMarkdownContentPart = class extends Disposable {
  constructor(markdown, context, editorPool, fillInIncompleteTokens = false, codeBlockStartIndex = 0, renderer, currentWidth, codeBlockModelCollection, rendererOptions, contextKeyService, textModelService, instantiationService) {
    super();
    this.markdown = markdown;
    this.editorPool = editorPool;
    this.codeBlockModelCollection = codeBlockModelCollection;
    this.textModelService = textModelService;
    const element = context.element;
    const markdownDecorationsRenderer = instantiationService.createInstance(ChatMarkdownDecorationsRenderer);
    const orderedDisposablesList = [];
    let codeBlockIndex = codeBlockStartIndex;
    const result = this._register(renderer.render(markdown, {
      fillInIncompleteTokens,
      codeBlockRendererSync: (languageId, text) => {
        const index = codeBlockIndex++;
        let textModel;
        let range;
        let vulns;
        if (equalsIgnoreCase(languageId, localFileLanguageId)) {
          try {
            const parsedBody = parseLocalFileData(text);
            range = parsedBody.range && Range.lift(parsedBody.range);
            textModel = this.textModelService.createModelReference(parsedBody.uri).then((ref2) => ref2.object);
          } catch (e) {
            return $("div");
          }
        } else {
          if (!isRequestVM(element) && !isResponseVM(element)) {
            console.error("Trying to render code block in welcome", element.id, index);
            return $("div");
          }
          const sessionId = isResponseVM(element) || isRequestVM(element) ? element.sessionId : "";
          const modelEntry = this.codeBlockModelCollection.getOrCreate(sessionId, element, index);
          vulns = modelEntry.vulns;
          textModel = modelEntry.model;
        }
        const hideToolbar = isResponseVM(element) && element.errorDetails?.responseIsFiltered;
        const ref = this.renderCodeBlock({ languageId, textModel, codeBlockIndex: index, element, range, hideToolbar, parentContextKeyService: contextKeyService, vulns }, text, currentWidth, rendererOptions.editableCodeBlock);
        this.allRefs.push(ref);
        this._register(ref.object.onDidChangeContentHeight(() => this._onDidChangeHeight.fire()));
        const info = {
          codeBlockIndex: index,
          element,
          focus() {
            ref.object.focus();
          },
          uri: ref.object.uri
        };
        this.codeblocks.push(info);
        orderedDisposablesList.push(ref);
        return ref.object.element;
      },
      asyncRenderCallback: () => this._onDidChangeHeight.fire()
    }));
    this._register(markdownDecorationsRenderer.walkTreeAndAnnotateReferenceLinks(result.element));
    orderedDisposablesList.reverse().forEach((d) => this._register(d));
    this.domNode = result.element;
  }
  domNode;
  allRefs = [];
  _onDidChangeHeight = this._register(new Emitter());
  onDidChangeHeight = this._onDidChangeHeight.event;
  codeblocks = [];
  renderCodeBlock(data, text, currentWidth, editableCodeBlock) {
    const ref = this.editorPool.get();
    const editorInfo = ref.object;
    if (isResponseVM(data.element)) {
      this.codeBlockModelCollection.update(
        data.element.sessionId,
        data.element,
        data.codeBlockIndex,
        { text, languageId: data.languageId }
      );
    }
    editorInfo.render(data, currentWidth, editableCodeBlock);
    return ref;
  }
  hasSameContent(other) {
    return other.kind === "markdownContent" && other.content.value === this.markdown.value;
  }
  layout(width) {
    this.allRefs.forEach((ref) => ref.object.layout(width));
  }
  addDisposable(disposable) {
    this._register(disposable);
  }
};
ChatMarkdownContentPart = __decorateClass([
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, ITextModelService),
  __decorateParam(11, IInstantiationService)
], ChatMarkdownContentPart);
let EditorPool = class extends Disposable {
  _pool;
  inUse() {
    return this._pool.inUse;
  }
  constructor(options, delegate, overflowWidgetsDomNode, instantiationService) {
    super();
    this._pool = this._register(
      new ResourcePool(() => {
        return instantiationService.createInstance(
          CodeBlockPart,
          options,
          MenuId.ChatCodeBlock,
          delegate,
          overflowWidgetsDomNode
        );
      })
    );
  }
  get() {
    const codeBlock = this._pool.get();
    let stale = false;
    return {
      object: codeBlock,
      isStale: () => stale,
      dispose: () => {
        codeBlock.reset();
        stale = true;
        this._pool.release(codeBlock);
      }
    };
  }
};
EditorPool = __decorateClass([
  __decorateParam(3, IInstantiationService)
], EditorPool);
export {
  ChatMarkdownContentPart,
  EditorPool
};
