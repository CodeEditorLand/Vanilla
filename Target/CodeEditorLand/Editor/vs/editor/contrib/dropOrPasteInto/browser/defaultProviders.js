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
import { coalesce } from "../../../../base/common/arrays.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IReadonlyVSDataTransfer, UriList } from "../../../../base/common/dataTransfer.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Mimes } from "../../../../base/common/mime.js";
import { Schemas } from "../../../../base/common/network.js";
import { relativePath } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { IPosition } from "../../../common/core/position.js";
import { IRange } from "../../../common/core/range.js";
import { DocumentDropEditProvider, DocumentDropEditsSession, DocumentPasteContext, DocumentPasteEdit, DocumentPasteEditProvider, DocumentPasteEditsSession, DocumentPasteTriggerKind } from "../../../common/languages.js";
import { ITextModel } from "../../../common/model.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { localize } from "../../../../nls.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.js";
class SimplePasteAndDropProvider {
  static {
    __name(this, "SimplePasteAndDropProvider");
  }
  async provideDocumentPasteEdits(_model, _ranges, dataTransfer, context, token) {
    const edit = await this.getEdit(dataTransfer, token);
    if (!edit) {
      return void 0;
    }
    return {
      edits: [{ insertText: edit.insertText, title: edit.title, kind: edit.kind, handledMimeType: edit.handledMimeType, yieldTo: edit.yieldTo }],
      dispose() {
      }
    };
  }
  async provideDocumentDropEdits(_model, _position, dataTransfer, token) {
    const edit = await this.getEdit(dataTransfer, token);
    if (!edit) {
      return;
    }
    return {
      edits: [{ insertText: edit.insertText, title: edit.title, kind: edit.kind, handledMimeType: edit.handledMimeType, yieldTo: edit.yieldTo }],
      dispose() {
      }
    };
  }
}
class DefaultTextPasteOrDropEditProvider extends SimplePasteAndDropProvider {
  static {
    __name(this, "DefaultTextPasteOrDropEditProvider");
  }
  static id = "text";
  static kind = new HierarchicalKind("text.plain");
  id = DefaultTextPasteOrDropEditProvider.id;
  kind = DefaultTextPasteOrDropEditProvider.kind;
  dropMimeTypes = [Mimes.text];
  pasteMimeTypes = [Mimes.text];
  async getEdit(dataTransfer, _token) {
    const textEntry = dataTransfer.get(Mimes.text);
    if (!textEntry) {
      return;
    }
    if (dataTransfer.has(Mimes.uriList)) {
      return;
    }
    const insertText = await textEntry.asString();
    return {
      handledMimeType: Mimes.text,
      title: localize("text.label", "Insert Plain Text"),
      insertText,
      kind: this.kind
    };
  }
}
class PathProvider extends SimplePasteAndDropProvider {
  static {
    __name(this, "PathProvider");
  }
  kind = new HierarchicalKind("uri.absolute");
  dropMimeTypes = [Mimes.uriList];
  pasteMimeTypes = [Mimes.uriList];
  async getEdit(dataTransfer, token) {
    const entries = await extractUriList(dataTransfer);
    if (!entries.length || token.isCancellationRequested) {
      return;
    }
    let uriCount = 0;
    const insertText = entries.map(({ uri, originalText }) => {
      if (uri.scheme === Schemas.file) {
        return uri.fsPath;
      } else {
        uriCount++;
        return originalText;
      }
    }).join(" ");
    let label;
    if (uriCount > 0) {
      label = entries.length > 1 ? localize("defaultDropProvider.uriList.uris", "Insert Uris") : localize("defaultDropProvider.uriList.uri", "Insert Uri");
    } else {
      label = entries.length > 1 ? localize("defaultDropProvider.uriList.paths", "Insert Paths") : localize("defaultDropProvider.uriList.path", "Insert Path");
    }
    return {
      handledMimeType: Mimes.uriList,
      insertText,
      title: label,
      kind: this.kind
    };
  }
}
let RelativePathProvider = class extends SimplePasteAndDropProvider {
  constructor(_workspaceContextService) {
    super();
    this._workspaceContextService = _workspaceContextService;
  }
  static {
    __name(this, "RelativePathProvider");
  }
  kind = new HierarchicalKind("uri.relative");
  dropMimeTypes = [Mimes.uriList];
  pasteMimeTypes = [Mimes.uriList];
  async getEdit(dataTransfer, token) {
    const entries = await extractUriList(dataTransfer);
    if (!entries.length || token.isCancellationRequested) {
      return;
    }
    const relativeUris = coalesce(entries.map(({ uri }) => {
      const root = this._workspaceContextService.getWorkspaceFolder(uri);
      return root ? relativePath(root.uri, uri) : void 0;
    }));
    if (!relativeUris.length) {
      return;
    }
    return {
      handledMimeType: Mimes.uriList,
      insertText: relativeUris.join(" "),
      title: entries.length > 1 ? localize("defaultDropProvider.uriList.relativePaths", "Insert Relative Paths") : localize("defaultDropProvider.uriList.relativePath", "Insert Relative Path"),
      kind: this.kind
    };
  }
};
RelativePathProvider = __decorateClass([
  __decorateParam(0, IWorkspaceContextService)
], RelativePathProvider);
class PasteHtmlProvider {
  static {
    __name(this, "PasteHtmlProvider");
  }
  kind = new HierarchicalKind("html");
  pasteMimeTypes = ["text/html"];
  _yieldTo = [{ mimeType: Mimes.text }];
  async provideDocumentPasteEdits(_model, _ranges, dataTransfer, context, token) {
    if (context.triggerKind !== DocumentPasteTriggerKind.PasteAs && !context.only?.contains(this.kind)) {
      return;
    }
    const entry = dataTransfer.get("text/html");
    const htmlText = await entry?.asString();
    if (!htmlText || token.isCancellationRequested) {
      return;
    }
    return {
      dispose() {
      },
      edits: [{
        insertText: htmlText,
        yieldTo: this._yieldTo,
        title: localize("pasteHtmlLabel", "Insert HTML"),
        kind: this.kind
      }]
    };
  }
}
async function extractUriList(dataTransfer) {
  const urlListEntry = dataTransfer.get(Mimes.uriList);
  if (!urlListEntry) {
    return [];
  }
  const strUriList = await urlListEntry.asString();
  const entries = [];
  for (const entry of UriList.parse(strUriList)) {
    try {
      entries.push({ uri: URI.parse(entry), originalText: entry });
    } catch {
    }
  }
  return entries;
}
__name(extractUriList, "extractUriList");
let DefaultDropProvidersFeature = class extends Disposable {
  static {
    __name(this, "DefaultDropProvidersFeature");
  }
  constructor(languageFeaturesService, workspaceContextService) {
    super();
    this._register(languageFeaturesService.documentDropEditProvider.register("*", new DefaultTextPasteOrDropEditProvider()));
    this._register(languageFeaturesService.documentDropEditProvider.register("*", new PathProvider()));
    this._register(languageFeaturesService.documentDropEditProvider.register("*", new RelativePathProvider(workspaceContextService)));
  }
};
DefaultDropProvidersFeature = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IWorkspaceContextService)
], DefaultDropProvidersFeature);
let DefaultPasteProvidersFeature = class extends Disposable {
  static {
    __name(this, "DefaultPasteProvidersFeature");
  }
  constructor(languageFeaturesService, workspaceContextService) {
    super();
    this._register(languageFeaturesService.documentPasteEditProvider.register("*", new DefaultTextPasteOrDropEditProvider()));
    this._register(languageFeaturesService.documentPasteEditProvider.register("*", new PathProvider()));
    this._register(languageFeaturesService.documentPasteEditProvider.register("*", new RelativePathProvider(workspaceContextService)));
    this._register(languageFeaturesService.documentPasteEditProvider.register("*", new PasteHtmlProvider()));
  }
};
DefaultPasteProvidersFeature = __decorateClass([
  __decorateParam(0, ILanguageFeaturesService),
  __decorateParam(1, IWorkspaceContextService)
], DefaultPasteProvidersFeature);
export {
  DefaultDropProvidersFeature,
  DefaultPasteProvidersFeature,
  DefaultTextPasteOrDropEditProvider
};
//# sourceMappingURL=defaultProviders.js.map
