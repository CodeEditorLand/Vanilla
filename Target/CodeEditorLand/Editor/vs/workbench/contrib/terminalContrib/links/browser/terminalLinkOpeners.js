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
import { Schemas } from "../../../../../base/common/network.js";
import { OperatingSystem } from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ITextEditorSelection } from "../../../../../platform/editor/common/editor.js";
import { IFileService } from "../../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../../platform/opener/common/opener.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { ITerminalLinkOpener, ITerminalSimpleLink } from "./links.js";
import { osPathModule, updateLinkWithRelativeCwd } from "./terminalLinkHelpers.js";
import { ITerminalCapabilityStore, TerminalCapability } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../../services/environment/common/environmentService.js";
import { IHostService } from "../../../../services/host/browser/host.js";
import { QueryBuilder } from "../../../../services/search/common/queryBuilder.js";
import { ISearchService } from "../../../../services/search/common/search.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { detectLinks, getLinkSuffix } from "./terminalLinkParsing.js";
import { ITerminalLogService } from "../../../../../platform/terminal/common/terminal.js";
let TerminalLocalFileLinkOpener = class {
  constructor(_editorService) {
    this._editorService = _editorService;
  }
  static {
    __name(this, "TerminalLocalFileLinkOpener");
  }
  async open(link) {
    if (!link.uri) {
      throw new Error("Tried to open file link without a resolved URI");
    }
    const linkSuffix = link.parsedLink ? link.parsedLink.suffix : getLinkSuffix(link.text);
    let selection = link.selection;
    if (!selection) {
      selection = linkSuffix?.row === void 0 ? void 0 : {
        startLineNumber: linkSuffix.row ?? 1,
        startColumn: linkSuffix.col ?? 1,
        endLineNumber: linkSuffix.rowEnd,
        endColumn: linkSuffix.colEnd
      };
    }
    await this._editorService.openEditor({
      resource: link.uri,
      options: { pinned: true, selection, revealIfOpened: true }
    });
  }
};
TerminalLocalFileLinkOpener = __decorateClass([
  __decorateParam(0, IEditorService)
], TerminalLocalFileLinkOpener);
let TerminalLocalFolderInWorkspaceLinkOpener = class {
  constructor(_commandService) {
    this._commandService = _commandService;
  }
  static {
    __name(this, "TerminalLocalFolderInWorkspaceLinkOpener");
  }
  async open(link) {
    if (!link.uri) {
      throw new Error("Tried to open folder in workspace link without a resolved URI");
    }
    await this._commandService.executeCommand("revealInExplorer", link.uri);
  }
};
TerminalLocalFolderInWorkspaceLinkOpener = __decorateClass([
  __decorateParam(0, ICommandService)
], TerminalLocalFolderInWorkspaceLinkOpener);
let TerminalLocalFolderOutsideWorkspaceLinkOpener = class {
  constructor(_hostService) {
    this._hostService = _hostService;
  }
  static {
    __name(this, "TerminalLocalFolderOutsideWorkspaceLinkOpener");
  }
  async open(link) {
    if (!link.uri) {
      throw new Error("Tried to open folder in workspace link without a resolved URI");
    }
    this._hostService.openWindow([{ folderUri: link.uri }], { forceNewWindow: true });
  }
};
TerminalLocalFolderOutsideWorkspaceLinkOpener = __decorateClass([
  __decorateParam(0, IHostService)
], TerminalLocalFolderOutsideWorkspaceLinkOpener);
let TerminalSearchLinkOpener = class {
  constructor(_capabilities, _initialCwd, _localFileOpener, _localFolderInWorkspaceOpener, _getOS, _fileService, _instantiationService, _logService, _quickInputService, _searchService, _workspaceContextService, _workbenchEnvironmentService) {
    this._capabilities = _capabilities;
    this._initialCwd = _initialCwd;
    this._localFileOpener = _localFileOpener;
    this._localFolderInWorkspaceOpener = _localFolderInWorkspaceOpener;
    this._getOS = _getOS;
    this._fileService = _fileService;
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._quickInputService = _quickInputService;
    this._searchService = _searchService;
    this._workspaceContextService = _workspaceContextService;
    this._workbenchEnvironmentService = _workbenchEnvironmentService;
  }
  static {
    __name(this, "TerminalSearchLinkOpener");
  }
  _fileQueryBuilder = this._instantiationService.createInstance(QueryBuilder);
  async open(link) {
    const osPath = osPathModule(this._getOS());
    const pathSeparator = osPath.sep;
    let text = link.text.replace(/^file:\/\/\/?/, "");
    text = osPath.normalize(text).replace(/^(\.+[\\/])+/, "");
    if (link.contextLine) {
      const parsedLinks = detectLinks(link.contextLine, this._getOS());
      const matchingParsedLink = parsedLinks.find((parsedLink) => parsedLink.suffix && link.text.startsWith(parsedLink.path.text));
      if (matchingParsedLink) {
        if (matchingParsedLink.suffix?.row !== void 0) {
          text = matchingParsedLink.path.text;
          text += `:${matchingParsedLink.suffix.row}`;
          if (matchingParsedLink.suffix?.col !== void 0) {
            text += `:${matchingParsedLink.suffix.col}`;
          }
        }
      }
    }
    text = text.replace(/:[^\\/\d][^\d]*$/, "");
    text = text.replace(/\.$/, "");
    this._workspaceContextService.getWorkspace().folders.forEach((folder) => {
      if (text.substring(0, folder.name.length + 1) === folder.name + pathSeparator) {
        text = text.substring(folder.name.length + 1);
        return;
      }
    });
    let cwdResolvedText = text;
    if (this._capabilities.has(TerminalCapability.CommandDetection)) {
      cwdResolvedText = updateLinkWithRelativeCwd(this._capabilities, link.bufferRange.start.y, text, osPath, this._logService)?.[0] || text;
    }
    if (await this._tryOpenExactLink(cwdResolvedText, link)) {
      return;
    }
    if (text !== cwdResolvedText) {
      if (await this._tryOpenExactLink(text, link)) {
        return;
      }
    }
    return this._quickInputService.quickAccess.show(text);
  }
  async _getExactMatch(sanitizedLink) {
    const os = this._getOS();
    const pathModule = osPathModule(os);
    const isAbsolute = pathModule.isAbsolute(sanitizedLink);
    let absolutePath = isAbsolute ? sanitizedLink : void 0;
    if (!isAbsolute && this._initialCwd.length > 0) {
      absolutePath = pathModule.join(this._initialCwd, sanitizedLink);
    }
    let resourceMatch;
    if (absolutePath) {
      let normalizedAbsolutePath = absolutePath;
      if (os === OperatingSystem.Windows) {
        normalizedAbsolutePath = absolutePath.replace(/\\/g, "/");
        if (normalizedAbsolutePath.match(/[a-z]:/i)) {
          normalizedAbsolutePath = `/${normalizedAbsolutePath}`;
        }
      }
      let uri;
      if (this._workbenchEnvironmentService.remoteAuthority) {
        uri = URI.from({
          scheme: Schemas.vscodeRemote,
          authority: this._workbenchEnvironmentService.remoteAuthority,
          path: normalizedAbsolutePath
        });
      } else {
        uri = URI.file(normalizedAbsolutePath);
      }
      try {
        const fileStat = await this._fileService.stat(uri);
        resourceMatch = { uri, isDirectory: fileStat.isDirectory };
      } catch {
      }
    }
    if (!resourceMatch) {
      const results = await this._searchService.fileSearch(
        this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
          filePattern: sanitizedLink,
          maxResults: 2
        })
      );
      if (results.results.length > 0) {
        if (results.results.length === 1) {
          resourceMatch = { uri: results.results[0].resource };
        } else if (!isAbsolute) {
          const results2 = await this._searchService.fileSearch(
            this._fileQueryBuilder.file(this._workspaceContextService.getWorkspace().folders, {
              filePattern: `**/${sanitizedLink}`
            })
          );
          const exactMatches = results2.results.filter((e) => e.resource.toString().endsWith(sanitizedLink));
          if (exactMatches.length === 1) {
            resourceMatch = { uri: exactMatches[0].resource };
          }
        }
      }
    }
    return resourceMatch;
  }
  async _tryOpenExactLink(text, link) {
    const sanitizedLink = text.replace(/:\d+(:\d+)?$/, "");
    try {
      const result = await this._getExactMatch(sanitizedLink);
      if (result) {
        const { uri, isDirectory } = result;
        const linkToOpen = {
          // Use the absolute URI's path here so the optional line/col get detected
          text: result.uri.path + (text.match(/:\d+(:\d+)?$/)?.[0] || ""),
          uri,
          bufferRange: link.bufferRange,
          type: link.type
        };
        if (uri) {
          await (isDirectory ? this._localFolderInWorkspaceOpener.open(linkToOpen) : this._localFileOpener.open(linkToOpen));
          return true;
        }
      }
    } catch {
      return false;
    }
    return false;
  }
};
TerminalSearchLinkOpener = __decorateClass([
  __decorateParam(5, IFileService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ITerminalLogService),
  __decorateParam(8, IQuickInputService),
  __decorateParam(9, ISearchService),
  __decorateParam(10, IWorkspaceContextService),
  __decorateParam(11, IWorkbenchEnvironmentService)
], TerminalSearchLinkOpener);
let TerminalUrlLinkOpener = class {
  constructor(_isRemote, _openerService, _configurationService) {
    this._isRemote = _isRemote;
    this._openerService = _openerService;
    this._configurationService = _configurationService;
  }
  static {
    __name(this, "TerminalUrlLinkOpener");
  }
  async open(link) {
    if (!link.uri) {
      throw new Error("Tried to open a url without a resolved URI");
    }
    this._openerService.open(link.text, {
      allowTunneling: this._isRemote && this._configurationService.getValue("remote.forwardOnOpen"),
      allowContributedOpeners: true,
      openExternal: true
    });
  }
};
TerminalUrlLinkOpener = __decorateClass([
  __decorateParam(1, IOpenerService),
  __decorateParam(2, IConfigurationService)
], TerminalUrlLinkOpener);
export {
  TerminalLocalFileLinkOpener,
  TerminalLocalFolderInWorkspaceLinkOpener,
  TerminalLocalFolderOutsideWorkspaceLinkOpener,
  TerminalSearchLinkOpener,
  TerminalUrlLinkOpener
};
//# sourceMappingURL=terminalLinkOpeners.js.map
