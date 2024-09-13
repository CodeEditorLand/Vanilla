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
import { coalesce } from "../../../../base/common/arrays.js";
import { memoize } from "../../../../base/common/decorators.js";
import { Emitter } from "../../../../base/common/event.js";
import { isEqual } from "../../../../base/common/extpath.js";
import {
  dispose
} from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { posix } from "../../../../base/common/path.js";
import {
  basenameOrAuthority,
  isEqualOrParent,
  joinPath
} from "../../../../base/common/resources.js";
import {
  equalsIgnoreCase,
  rtrim,
  startsWithIgnoreCase
} from "../../../../base/common/strings.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import {
  FileSystemProviderCapabilities
} from "../../../../platform/files/common/files.js";
import { ExplorerFileNestingTrie } from "./explorerFileNestingTrie.js";
import { SortOrder } from "./files.js";
class ExplorerModel {
  constructor(contextService, uriIdentityService, fileService, configService, filesConfigService) {
    this.contextService = contextService;
    this.uriIdentityService = uriIdentityService;
    const setRoots = /* @__PURE__ */ __name(() => this._roots = this.contextService.getWorkspace().folders.map(
      (folder) => new ExplorerItem(
        folder.uri,
        fileService,
        configService,
        filesConfigService,
        void 0,
        true,
        false,
        false,
        false,
        folder.name
      )
    ), "setRoots");
    setRoots();
    this._listener = this.contextService.onDidChangeWorkspaceFolders(() => {
      setRoots();
      this._onDidChangeRoots.fire();
    });
  }
  static {
    __name(this, "ExplorerModel");
  }
  _roots;
  _listener;
  _onDidChangeRoots = new Emitter();
  get roots() {
    return this._roots;
  }
  get onDidChangeRoots() {
    return this._onDidChangeRoots.event;
  }
  /**
   * Returns an array of child stat from this stat that matches with the provided path.
   * Starts matching from the first root.
   * Will return empty array in case the FileStat does not exist.
   */
  findAll(resource) {
    return coalesce(this.roots.map((root) => root.find(resource)));
  }
  /**
   * Returns a FileStat that matches the passed resource.
   * In case multiple FileStat are matching the resource (same folder opened multiple times) returns the FileStat that has the closest root.
   * Will return undefined in case the FileStat does not exist.
   */
  findClosest(resource) {
    const folder = this.contextService.getWorkspaceFolder(resource);
    if (folder) {
      const root = this.roots.find(
        (r) => this.uriIdentityService.extUri.isEqual(r.resource, folder.uri)
      );
      if (root) {
        return root.find(resource);
      }
    }
    return null;
  }
  dispose() {
    dispose(this._listener);
  }
}
const _ExplorerItem = class _ExplorerItem {
  constructor(resource, fileService, configService, filesConfigService, _parent, _isDirectory, _isSymbolicLink, _readonly, _locked, _name = basenameOrAuthority(resource), _mtime, _unknown = false) {
    this.resource = resource;
    this.fileService = fileService;
    this.configService = configService;
    this.filesConfigService = filesConfigService;
    this._parent = _parent;
    this._isDirectory = _isDirectory;
    this._isSymbolicLink = _isSymbolicLink;
    this._readonly = _readonly;
    this._locked = _locked;
    this._name = _name;
    this._mtime = _mtime;
    this._unknown = _unknown;
    this._isDirectoryResolved = false;
  }
  static {
    __name(this, "ExplorerItem");
  }
  _isDirectoryResolved;
  // used in tests
  error = void 0;
  _isExcluded = false;
  nestedParent;
  nestedChildren;
  get isExcluded() {
    if (this._isExcluded) {
      return true;
    }
    if (!this._parent) {
      return false;
    }
    return this._parent.isExcluded;
  }
  set isExcluded(value) {
    this._isExcluded = value;
  }
  hasChildren(filter) {
    if (this.hasNests) {
      return this.nestedChildren?.some((c) => filter(c)) ?? false;
    } else {
      return this.isDirectory;
    }
  }
  get hasNests() {
    return !!this.nestedChildren?.length;
  }
  get isDirectoryResolved() {
    return this._isDirectoryResolved;
  }
  get isSymbolicLink() {
    return !!this._isSymbolicLink;
  }
  get isDirectory() {
    return !!this._isDirectory;
  }
  get isReadonly() {
    return this.filesConfigService.isReadonly(this.resource, {
      resource: this.resource,
      name: this.name,
      readonly: this._readonly,
      locked: this._locked
    });
  }
  get mtime() {
    return this._mtime;
  }
  get name() {
    return this._name;
  }
  get isUnknown() {
    return this._unknown;
  }
  get parent() {
    return this._parent;
  }
  get root() {
    if (!this._parent) {
      return this;
    }
    return this._parent.root;
  }
  get children() {
    return /* @__PURE__ */ new Map();
  }
  updateName(value) {
    this._parent?.removeChild(this);
    this._name = value;
    this._parent?.addChild(this);
  }
  getId() {
    return this.root.resource.toString() + "::" + this.resource.toString();
  }
  toString() {
    return `ExplorerItem: ${this.name}`;
  }
  get isRoot() {
    return this === this.root;
  }
  static create(fileService, configService, filesConfigService, raw, parent, resolveTo) {
    const stat = new _ExplorerItem(
      raw.resource,
      fileService,
      configService,
      filesConfigService,
      parent,
      raw.isDirectory,
      raw.isSymbolicLink,
      raw.readonly,
      raw.locked,
      raw.name,
      raw.mtime,
      !raw.isFile && !raw.isDirectory
    );
    if (stat.isDirectory) {
      stat._isDirectoryResolved = !!raw.children || !!resolveTo && resolveTo.some((r) => {
        return isEqualOrParent(r, stat.resource);
      });
      if (raw.children) {
        for (let i = 0, len = raw.children.length; i < len; i++) {
          const child = _ExplorerItem.create(
            fileService,
            configService,
            filesConfigService,
            raw.children[i],
            stat,
            resolveTo
          );
          stat.addChild(child);
        }
      }
    }
    return stat;
  }
  /**
   * Merges the stat which was resolved from the disk with the local stat by copying over properties
   * and children. The merge will only consider resolved stat elements to avoid overwriting data which
   * exists locally.
   */
  static mergeLocalWithDisk(disk, local) {
    if (disk.resource.toString() !== local.resource.toString()) {
      return;
    }
    const mergingDirectories = disk.isDirectory || local.isDirectory;
    if (mergingDirectories && local._isDirectoryResolved && !disk._isDirectoryResolved) {
      return;
    }
    local.resource = disk.resource;
    if (!local.isRoot) {
      local.updateName(disk.name);
    }
    local._isDirectory = disk.isDirectory;
    local._mtime = disk.mtime;
    local._isDirectoryResolved = disk._isDirectoryResolved;
    local._isSymbolicLink = disk.isSymbolicLink;
    local.error = disk.error;
    if (mergingDirectories && disk._isDirectoryResolved) {
      const oldLocalChildren = new ResourceMap();
      local.children.forEach((child) => {
        oldLocalChildren.set(child.resource, child);
      });
      local.children.clear();
      disk.children.forEach((diskChild) => {
        const formerLocalChild = oldLocalChildren.get(
          diskChild.resource
        );
        if (formerLocalChild) {
          _ExplorerItem.mergeLocalWithDisk(
            diskChild,
            formerLocalChild
          );
          local.addChild(formerLocalChild);
          oldLocalChildren.delete(diskChild.resource);
        } else {
          local.addChild(diskChild);
        }
      });
      oldLocalChildren.forEach((oldChild) => {
        if (oldChild instanceof NewExplorerItem) {
          local.addChild(oldChild);
        }
      });
    }
  }
  /**
   * Adds a child element to this folder.
   */
  addChild(child) {
    child._parent = this;
    child.updateResource(false);
    this.children.set(this.getPlatformAwareName(child.name), child);
  }
  getChild(name) {
    return this.children.get(this.getPlatformAwareName(name));
  }
  fetchChildren(sortOrder) {
    const nestingConfig = this.configService.getValue({
      resource: this.root.resource
    }).explorer.fileNesting;
    if (nestingConfig.enabled && this.nestedChildren) {
      return this.nestedChildren;
    }
    return (async () => {
      if (!this._isDirectoryResolved) {
        const resolveMetadata = sortOrder === SortOrder.Modified;
        this.error = void 0;
        try {
          const stat = await this.fileService.resolve(this.resource, {
            resolveSingleChildDescendants: true,
            resolveMetadata
          });
          const resolved = _ExplorerItem.create(
            this.fileService,
            this.configService,
            this.filesConfigService,
            stat,
            this
          );
          _ExplorerItem.mergeLocalWithDisk(resolved, this);
        } catch (e) {
          this.error = e;
          throw e;
        }
        this._isDirectoryResolved = true;
      }
      const items = [];
      if (nestingConfig.enabled) {
        const fileChildren = [];
        const dirChildren = [];
        for (const child of this.children.entries()) {
          child[1].nestedParent = void 0;
          if (child[1].isDirectory) {
            dirChildren.push(child);
          } else {
            fileChildren.push(child);
          }
        }
        const nested = this.fileNester.nest(
          fileChildren.map(([name]) => name),
          this.getPlatformAwareName(this.name)
        );
        for (const [fileEntryName, fileEntryItem] of fileChildren) {
          const nestedItems = nested.get(fileEntryName);
          if (nestedItems !== void 0) {
            fileEntryItem.nestedChildren = [];
            for (const name of nestedItems.keys()) {
              const child = assertIsDefined(
                this.children.get(name)
              );
              fileEntryItem.nestedChildren.push(child);
              child.nestedParent = fileEntryItem;
            }
            items.push(fileEntryItem);
          } else {
            fileEntryItem.nestedChildren = void 0;
          }
        }
        for (const [_, dirEntryItem] of dirChildren.values()) {
          items.push(dirEntryItem);
        }
      } else {
        this.children.forEach((child) => {
          items.push(child);
        });
      }
      return items;
    })();
  }
  _fileNester;
  get fileNester() {
    if (!this.root._fileNester) {
      const nestingConfig = this.configService.getValue({
        resource: this.root.resource
      }).explorer.fileNesting;
      const patterns = Object.entries(nestingConfig.patterns).filter(
        (entry) => typeof entry[0] === "string" && typeof entry[1] === "string" && entry[0] && entry[1]
      ).map(
        ([parentPattern, childrenPatterns]) => [
          this.getPlatformAwareName(parentPattern.trim()),
          childrenPatterns.split(",").map(
            (p) => this.getPlatformAwareName(
              p.trim().replace(/\u200b/g, "").trim()
            )
          ).filter((p) => p !== "")
        ]
      );
      this.root._fileNester = new ExplorerFileNestingTrie(patterns);
    }
    return this.root._fileNester;
  }
  /**
   * Removes a child element from this folder.
   */
  removeChild(child) {
    this.nestedChildren = void 0;
    this.children.delete(this.getPlatformAwareName(child.name));
  }
  forgetChildren() {
    this.children.clear();
    this.nestedChildren = void 0;
    this._isDirectoryResolved = false;
    this._fileNester = void 0;
  }
  getPlatformAwareName(name) {
    return this.fileService.hasCapability(
      this.resource,
      FileSystemProviderCapabilities.PathCaseSensitive
    ) ? name : name.toLowerCase();
  }
  /**
   * Moves this element under a new parent element.
   */
  move(newParent) {
    this.nestedParent?.removeChild(this);
    this._parent?.removeChild(this);
    newParent.removeChild(this);
    newParent.addChild(this);
    this.updateResource(true);
  }
  updateResource(recursive) {
    if (this._parent) {
      this.resource = joinPath(this._parent.resource, this.name);
    }
    if (recursive) {
      if (this.isDirectory) {
        this.children.forEach((child) => {
          child.updateResource(true);
        });
      }
    }
  }
  /**
   * Tells this stat that it was renamed. This requires changes to all children of this stat (if any)
   * so that the path property can be updated properly.
   */
  rename(renamedStat) {
    this.updateName(renamedStat.name);
    this._mtime = renamedStat.mtime;
    this.updateResource(true);
  }
  /**
   * Returns a child stat from this stat that matches with the provided path.
   * Will return "null" in case the child does not exist.
   */
  find(resource) {
    const ignoreCase = !this.fileService.hasCapability(
      resource,
      FileSystemProviderCapabilities.PathCaseSensitive
    );
    if (resource && this.resource.scheme === resource.scheme && equalsIgnoreCase(this.resource.authority, resource.authority) && (ignoreCase ? startsWithIgnoreCase(resource.path, this.resource.path) : resource.path.startsWith(this.resource.path))) {
      return this.findByPath(
        rtrim(resource.path, posix.sep),
        this.resource.path.length,
        ignoreCase
      );
    }
    return null;
  }
  findByPath(path, index, ignoreCase) {
    if (isEqual(rtrim(this.resource.path, posix.sep), path, ignoreCase)) {
      return this;
    }
    if (this.isDirectory) {
      while (index < path.length && path[index] === posix.sep) {
        index++;
      }
      let indexOfNextSep = path.indexOf(posix.sep, index);
      if (indexOfNextSep === -1) {
        indexOfNextSep = path.length;
      }
      const name = path.substring(index, indexOfNextSep);
      const child = this.children.get(this.getPlatformAwareName(name));
      if (child) {
        return child.findByPath(path, indexOfNextSep, ignoreCase);
      }
    }
    return null;
  }
};
__decorateClass([
  memoize
], _ExplorerItem.prototype, "children", 1);
let ExplorerItem = _ExplorerItem;
class NewExplorerItem extends ExplorerItem {
  static {
    __name(this, "NewExplorerItem");
  }
  constructor(fileService, configService, filesConfigService, parent, isDirectory) {
    super(
      URI.file(""),
      fileService,
      configService,
      filesConfigService,
      parent,
      isDirectory
    );
    this._isDirectoryResolved = true;
  }
}
export {
  ExplorerItem,
  ExplorerModel,
  NewExplorerItem
};
//# sourceMappingURL=explorerModel.js.map
