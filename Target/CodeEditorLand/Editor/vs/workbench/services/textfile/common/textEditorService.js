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
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { Schemas } from "../../../../base/common/network.js";
import { basename } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  createDecorator,
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  DEFAULT_EDITOR_ASSOCIATION,
  EditorExtensions,
  isResourceDiffEditorInput,
  isResourceMergeEditorInput,
  isResourceSideBySideEditorInput
} from "../../../common/editor.js";
import { DiffEditorInput } from "../../../common/editor/diffEditorInput.js";
import { SideBySideEditorInput } from "../../../common/editor/sideBySideEditorInput.js";
import { TextResourceEditorInput } from "../../../common/editor/textResourceEditorInput.js";
import {
  IEditorResolverService,
  RegisteredEditorPriority
} from "../../editor/common/editorResolverService.js";
import { UntitledTextEditorInput } from "../../untitled/common/untitledTextEditorInput.js";
import {
  IUntitledTextEditorService
} from "../../untitled/common/untitledTextEditorService.js";
const ITextEditorService = createDecorator("textEditorService");
let TextEditorService = class extends Disposable {
  constructor(untitledTextEditorService, instantiationService, uriIdentityService, fileService, editorResolverService) {
    super();
    this.untitledTextEditorService = untitledTextEditorService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.editorResolverService = editorResolverService;
    this.registerDefaultEditor();
  }
  editorInputCache = new ResourceMap();
  fileEditorFactory = Registry.as(
    EditorExtensions.EditorFactory
  ).getFileEditorFactory();
  registerDefaultEditor() {
    this._register(
      this.editorResolverService.registerEditor(
        "*",
        {
          id: DEFAULT_EDITOR_ASSOCIATION.id,
          label: DEFAULT_EDITOR_ASSOCIATION.displayName,
          detail: DEFAULT_EDITOR_ASSOCIATION.providerDisplayName,
          priority: RegisteredEditorPriority.builtin
        },
        {},
        {
          createEditorInput: (editor) => ({
            editor: this.createTextEditor(editor)
          }),
          createUntitledEditorInput: (untitledEditor) => ({
            editor: this.createTextEditor(untitledEditor)
          }),
          createDiffEditorInput: (diffEditor) => ({
            editor: this.createTextEditor(diffEditor)
          })
        }
      )
    );
  }
  async resolveTextEditor(input) {
    return this.createTextEditor(input);
  }
  createTextEditor(input) {
    if (isResourceMergeEditorInput(input)) {
      return this.createTextEditor(input.result);
    }
    if (isResourceDiffEditorInput(input)) {
      const original = this.createTextEditor(input.original);
      const modified = this.createTextEditor(input.modified);
      return this.instantiationService.createInstance(
        DiffEditorInput,
        input.label,
        input.description,
        original,
        modified,
        void 0
      );
    }
    if (isResourceSideBySideEditorInput(input)) {
      const primary = this.createTextEditor(input.primary);
      const secondary = this.createTextEditor(input.secondary);
      return this.instantiationService.createInstance(
        SideBySideEditorInput,
        input.label,
        input.description,
        secondary,
        primary
      );
    }
    const untitledInput = input;
    if (untitledInput.forceUntitled || !untitledInput.resource || untitledInput.resource.scheme === Schemas.untitled) {
      const untitledOptions = {
        languageId: untitledInput.languageId,
        initialValue: untitledInput.contents,
        encoding: untitledInput.encoding
      };
      let untitledModel;
      if (untitledInput.resource?.scheme === Schemas.untitled) {
        untitledModel = this.untitledTextEditorService.create({
          untitledResource: untitledInput.resource,
          ...untitledOptions
        });
      } else {
        untitledModel = this.untitledTextEditorService.create({
          associatedResource: untitledInput.resource,
          ...untitledOptions
        });
      }
      return this.createOrGetCached(
        untitledModel.resource,
        () => this.instantiationService.createInstance(
          UntitledTextEditorInput,
          untitledModel
        )
      );
    }
    const textResourceEditorInput = input;
    if (textResourceEditorInput.resource instanceof URI) {
      const label = textResourceEditorInput.label || basename(textResourceEditorInput.resource);
      const preferredResource = textResourceEditorInput.resource;
      const canonicalResource = this.uriIdentityService.asCanonicalUri(preferredResource);
      return this.createOrGetCached(
        canonicalResource,
        () => {
          if (textResourceEditorInput.forceFile || this.fileService.hasProvider(canonicalResource)) {
            return this.fileEditorFactory.createFileEditor(
              canonicalResource,
              preferredResource,
              textResourceEditorInput.label,
              textResourceEditorInput.description,
              textResourceEditorInput.encoding,
              textResourceEditorInput.languageId,
              textResourceEditorInput.contents,
              this.instantiationService
            );
          }
          return this.instantiationService.createInstance(
            TextResourceEditorInput,
            canonicalResource,
            textResourceEditorInput.label,
            textResourceEditorInput.description,
            textResourceEditorInput.languageId,
            textResourceEditorInput.contents
          );
        },
        (cachedInput) => {
          if (cachedInput instanceof UntitledTextEditorInput) {
            return;
          } else if (cachedInput instanceof TextResourceEditorInput) {
            if (label) {
              cachedInput.setName(label);
            }
            if (textResourceEditorInput.description) {
              cachedInput.setDescription(
                textResourceEditorInput.description
              );
            }
            if (textResourceEditorInput.languageId) {
              cachedInput.setPreferredLanguageId(
                textResourceEditorInput.languageId
              );
            }
            if (typeof textResourceEditorInput.contents === "string") {
              cachedInput.setPreferredContents(
                textResourceEditorInput.contents
              );
            }
          } else {
            cachedInput.setPreferredResource(preferredResource);
            if (textResourceEditorInput.label) {
              cachedInput.setPreferredName(
                textResourceEditorInput.label
              );
            }
            if (textResourceEditorInput.description) {
              cachedInput.setPreferredDescription(
                textResourceEditorInput.description
              );
            }
            if (textResourceEditorInput.encoding) {
              cachedInput.setPreferredEncoding(
                textResourceEditorInput.encoding
              );
            }
            if (textResourceEditorInput.languageId) {
              cachedInput.setPreferredLanguageId(
                textResourceEditorInput.languageId
              );
            }
            if (typeof textResourceEditorInput.contents === "string") {
              cachedInput.setPreferredContents(
                textResourceEditorInput.contents
              );
            }
          }
        }
      );
    }
    throw new Error(
      `ITextEditorService: Unable to create texteditor from ${JSON.stringify(input)}`
    );
  }
  createOrGetCached(resource, factoryFn, cachedFn) {
    let input = this.editorInputCache.get(resource);
    if (input) {
      cachedFn?.(input);
      return input;
    }
    input = factoryFn();
    this.editorInputCache.set(resource, input);
    Event.once(input.onWillDispose)(
      () => this.editorInputCache.delete(resource)
    );
    return input;
  }
};
TextEditorService = __decorateClass([
  __decorateParam(0, IUntitledTextEditorService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IFileService),
  __decorateParam(4, IEditorResolverService)
], TextEditorService);
registerSingleton(
  ITextEditorService,
  TextEditorService,
  InstantiationType.Eager
);
export {
  ITextEditorService,
  TextEditorService
};
