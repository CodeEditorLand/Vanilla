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
import { ThrottledDelayer } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import {
  pieceToQuery,
  prepareQuery,
  scoreFuzzy2
} from "../../../../base/common/fuzzyScorer.js";
import { Schemas } from "../../../../base/common/network.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { Range } from "../../../../editor/common/core/range.js";
import {
  SymbolKind,
  SymbolKinds,
  SymbolTag
} from "../../../../editor/common/languages.js";
import { getSelectionSearchString } from "../../../../editor/contrib/find/browser/findController.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import {
  PickerQuickAccessProvider,
  TriggerAction
} from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import {
  ACTIVE_GROUP,
  IEditorService,
  SIDE_GROUP
} from "../../../services/editor/common/editorService.js";
import {
  getWorkspaceSymbols
} from "../common/search.js";
let SymbolsQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(labelService, openerService, editorService, configurationService, codeEditorService) {
    super(SymbolsQuickAccessProvider.PREFIX, {
      canAcceptInBackground: true,
      noResultsPick: {
        label: localize(
          "noSymbolResults",
          "No matching workspace symbols"
        )
      }
    });
    this.labelService = labelService;
    this.openerService = openerService;
    this.editorService = editorService;
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
  }
  static PREFIX = "#";
  static TYPING_SEARCH_DELAY = 200;
  // this delay accommodates for the user typing a word and then stops typing to start searching
  static TREAT_AS_GLOBAL_SYMBOL_TYPES = /* @__PURE__ */ new Set([
    SymbolKind.Class,
    SymbolKind.Enum,
    SymbolKind.File,
    SymbolKind.Interface,
    SymbolKind.Namespace,
    SymbolKind.Package,
    SymbolKind.Module
  ]);
  delayer = this._register(
    new ThrottledDelayer(
      SymbolsQuickAccessProvider.TYPING_SEARCH_DELAY
    )
  );
  get defaultFilterValue() {
    const editor = this.codeEditorService.getFocusedCodeEditor();
    if (editor) {
      return getSelectionSearchString(editor) ?? void 0;
    }
    return void 0;
  }
  get configuration() {
    const editorConfig = this.configurationService.getValue().workbench?.editor;
    return {
      openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview,
      openSideBySideDirection: editorConfig?.openSideBySideDirection
    };
  }
  _getPicks(filter, disposables, token) {
    return this.getSymbolPicks(filter, void 0, token);
  }
  async getSymbolPicks(filter, options, token) {
    return this.delayer.trigger(async () => {
      if (token.isCancellationRequested) {
        return [];
      }
      return this.doGetSymbolPicks(prepareQuery(filter), options, token);
    }, options?.delay);
  }
  async doGetSymbolPicks(query, options, token) {
    let symbolQuery;
    let containerQuery;
    if (query.values && query.values.length > 1) {
      symbolQuery = pieceToQuery(query.values[0]);
      containerQuery = pieceToQuery(query.values.slice(1));
    } else {
      symbolQuery = query;
    }
    const workspaceSymbols = await getWorkspaceSymbols(
      symbolQuery.original,
      token
    );
    if (token.isCancellationRequested) {
      return [];
    }
    const symbolPicks = [];
    const openSideBySideDirection = this.configuration.openSideBySideDirection;
    for (const { symbol, provider } of workspaceSymbols) {
      if (options?.skipLocal && !SymbolsQuickAccessProvider.TREAT_AS_GLOBAL_SYMBOL_TYPES.has(
        symbol.kind
      ) && !!symbol.containerName) {
        continue;
      }
      const symbolLabel = symbol.name;
      const symbolLabelWithIcon = `$(${SymbolKinds.toIcon(symbol.kind).id}) ${symbolLabel}`;
      const symbolLabelIconOffset = symbolLabelWithIcon.length - symbolLabel.length;
      let symbolScore;
      let symbolMatches;
      let skipContainerQuery = false;
      if (symbolQuery.original.length > 0) {
        if (symbolQuery !== query) {
          [symbolScore, symbolMatches] = scoreFuzzy2(
            symbolLabelWithIcon,
            {
              ...query,
              values: void 0
            },
            0,
            symbolLabelIconOffset
          );
          if (typeof symbolScore === "number") {
            skipContainerQuery = true;
          }
        }
        if (typeof symbolScore !== "number") {
          [symbolScore, symbolMatches] = scoreFuzzy2(
            symbolLabelWithIcon,
            symbolQuery,
            0,
            symbolLabelIconOffset
          );
          if (typeof symbolScore !== "number") {
            continue;
          }
        }
      }
      const symbolUri = symbol.location.uri;
      let containerLabel;
      if (symbolUri) {
        const containerPath = this.labelService.getUriLabel(symbolUri, {
          relative: true
        });
        if (symbol.containerName) {
          containerLabel = `${symbol.containerName} \u2022 ${containerPath}`;
        } else {
          containerLabel = containerPath;
        }
      }
      let containerScore;
      let containerMatches;
      if (!skipContainerQuery && containerQuery && containerQuery.original.length > 0) {
        if (containerLabel) {
          [containerScore, containerMatches] = scoreFuzzy2(
            containerLabel,
            containerQuery
          );
        }
        if (typeof containerScore !== "number") {
          continue;
        }
        if (typeof symbolScore === "number") {
          symbolScore += containerScore;
        }
      }
      const deprecated = symbol.tags ? symbol.tags.indexOf(SymbolTag.Deprecated) >= 0 : false;
      symbolPicks.push({
        symbol,
        resource: symbolUri,
        score: symbolScore,
        label: symbolLabelWithIcon,
        ariaLabel: symbolLabel,
        highlights: deprecated ? void 0 : {
          label: symbolMatches,
          description: containerMatches
        },
        description: containerLabel,
        strikethrough: deprecated,
        buttons: [
          {
            iconClass: openSideBySideDirection === "right" ? ThemeIcon.asClassName(Codicon.splitHorizontal) : ThemeIcon.asClassName(Codicon.splitVertical),
            tooltip: openSideBySideDirection === "right" ? localize("openToSide", "Open to the Side") : localize(
              "openToBottom",
              "Open to the Bottom"
            )
          }
        ],
        trigger: (buttonIndex, keyMods) => {
          this.openSymbol(provider, symbol, token, {
            keyMods,
            forceOpenSideBySide: true
          });
          return TriggerAction.CLOSE_PICKER;
        },
        accept: async (keyMods, event) => this.openSymbol(provider, symbol, token, {
          keyMods,
          preserveFocus: event.inBackground,
          forcePinned: event.inBackground
        })
      });
    }
    if (!options?.skipSorting) {
      symbolPicks.sort(
        (symbolA, symbolB) => this.compareSymbols(symbolA, symbolB)
      );
    }
    return symbolPicks;
  }
  async openSymbol(provider, symbol, token, options) {
    let symbolToOpen = symbol;
    if (typeof provider.resolveWorkspaceSymbol === "function") {
      symbolToOpen = await provider.resolveWorkspaceSymbol(symbol, token) || symbol;
      if (token.isCancellationRequested) {
        return;
      }
    }
    if (symbolToOpen.location.uri.scheme === Schemas.http || symbolToOpen.location.uri.scheme === Schemas.https) {
      await this.openerService.open(symbolToOpen.location.uri, {
        fromUserGesture: true,
        allowContributedOpeners: true
      });
    } else {
      await this.editorService.openEditor(
        {
          resource: symbolToOpen.location.uri,
          options: {
            preserveFocus: options?.preserveFocus,
            pinned: options.keyMods.ctrlCmd || options.forcePinned || this.configuration.openEditorPinned,
            selection: symbolToOpen.location.range ? Range.collapseToStart(symbolToOpen.location.range) : void 0
          }
        },
        options.keyMods.alt || this.configuration.openEditorPinned && options.keyMods.ctrlCmd || options?.forceOpenSideBySide ? SIDE_GROUP : ACTIVE_GROUP
      );
    }
  }
  compareSymbols(symbolA, symbolB) {
    if (typeof symbolA.score === "number" && typeof symbolB.score === "number") {
      if (symbolA.score > symbolB.score) {
        return -1;
      }
      if (symbolA.score < symbolB.score) {
        return 1;
      }
    }
    if (symbolA.symbol && symbolB.symbol) {
      const symbolAName = symbolA.symbol.name.toLowerCase();
      const symbolBName = symbolB.symbol.name.toLowerCase();
      const res = symbolAName.localeCompare(symbolBName);
      if (res !== 0) {
        return res;
      }
    }
    if (symbolA.symbol && symbolB.symbol) {
      const symbolAKind = SymbolKinds.toIcon(symbolA.symbol.kind).id;
      const symbolBKind = SymbolKinds.toIcon(symbolB.symbol.kind).id;
      return symbolAKind.localeCompare(symbolBKind);
    }
    return 0;
  }
};
SymbolsQuickAccessProvider = __decorateClass([
  __decorateParam(0, ILabelService),
  __decorateParam(1, IOpenerService),
  __decorateParam(2, IEditorService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ICodeEditorService)
], SymbolsQuickAccessProvider);
export {
  SymbolsQuickAccessProvider
};
