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
import { Emitter, Event } from "../../../../base/common/event.js";
import { Iterable } from "../../../../base/common/iterator.js";
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  derived,
  observableFromEvent
} from "../../../../base/common/observable.js";
import { basename } from "../../../../base/common/resources.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { observableConfigValue } from "../../../../platform/observable/common/platformObservableUtils.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { EditorResourceAccessor } from "../../../common/editor.js";
import {
  IActivityService,
  NumberBadge
} from "../../../services/activity/common/activity.js";
import {
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
import {
  IStatusbarService,
  StatusbarAlignment as MainThreadStatusBarAlignment
} from "../../../services/statusbar/browser/statusbar.js";
import { ITitleService } from "../../../services/title/browser/titleService.js";
import {
  ISCMService,
  ISCMViewService,
  VIEW_PANE_ID
} from "../common/scm.js";
import { getRepositoryResourceCount } from "./util.js";
const ActiveRepositoryContextKeys = {
  ActiveRepositoryName: new RawContextKey(
    "scmActiveRepositoryName",
    ""
  ),
  ActiveRepositoryBranchName: new RawContextKey(
    "scmActiveRepositoryBranchName",
    ""
  )
};
let SCMActiveRepositoryController = class extends Disposable {
  constructor(activityService, configurationService, contextKeyService, scmService, scmViewService, statusbarService, titleService) {
    super();
    this.activityService = activityService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.scmService = scmService;
    this.scmViewService = scmViewService;
    this.statusbarService = statusbarService;
    this.titleService = titleService;
    this._activeRepositoryNameContextKey = ActiveRepositoryContextKeys.ActiveRepositoryName.bindTo(this.contextKeyService);
    this._activeRepositoryBranchNameContextKey = ActiveRepositoryContextKeys.ActiveRepositoryBranchName.bindTo(this.contextKeyService);
    this.titleService.registerVariables([
      { name: "activeRepositoryName", contextKey: ActiveRepositoryContextKeys.ActiveRepositoryName.key },
      { name: "activeRepositoryBranchName", contextKey: ActiveRepositoryContextKeys.ActiveRepositoryBranchName.key }
    ]);
    this._register(autorunWithStore((reader, store) => {
      this._updateActivityCountBadge(this._countBadge.read(reader), store);
    }));
    this._register(autorunWithStore((reader, store) => {
      const repository = this.scmViewService.activeRepository.read(reader);
      const commands = repository?.provider.statusBarCommands.read(reader);
      this._updateStatusBar(repository, commands ?? [], store);
    }));
    this._register(autorun((reader) => {
      const repository = this.scmViewService.activeRepository.read(reader);
      const historyItemRefName = this._activeRepositoryHistoryItemRefName.read(reader);
      this._updateActiveRepositoryContextKeys(repository?.provider.name, historyItemRefName);
    }));
  }
  static {
    __name(this, "SCMActiveRepositoryController");
  }
  _countBadgeConfig = observableConfigValue("scm.countBadge", "all", this.configurationService);
  _repositories = observableFromEvent(
    this,
    Event.any(
      this.scmService.onDidAddRepository,
      this.scmService.onDidRemoveRepository
    ),
    () => this.scmService.repositories
  );
  _activeRepositoryHistoryItemRefName = derived((reader) => {
    const repository = this.scmViewService.activeRepository.read(reader);
    const historyProvider = repository?.provider.historyProvider.read(reader);
    const historyItemRef = historyProvider?.historyItemRef.read(reader);
    return historyItemRef?.name;
  });
  _countBadgeRepositories = derived(this, (reader) => {
    switch (this._countBadgeConfig.read(reader)) {
      case "all": {
        const repositories = this._repositories.read(reader);
        return [
          ...Iterable.map(repositories, (r) => ({
            provider: r.provider,
            resourceCount: this._getRepositoryResourceCount(r)
          }))
        ];
      }
      case "focused": {
        const repository = this.scmViewService.activeRepository.read(reader);
        return repository ? [
          {
            provider: repository.provider,
            resourceCount: this._getRepositoryResourceCount(
              repository
            )
          }
        ] : [];
      }
      case "off":
        return [];
      default:
        throw new Error("Invalid countBadge setting");
    }
  });
  _countBadge = derived(this, (reader) => {
    let total = 0;
    for (const repository of this._countBadgeRepositories.read(reader)) {
      const count = repository.provider.count?.read(reader);
      const resourceCount = repository.resourceCount.read(reader);
      total = total + (count ?? resourceCount);
    }
    return total;
  });
  _activeRepositoryNameContextKey;
  _activeRepositoryBranchNameContextKey;
  _getRepositoryResourceCount(repository) {
    return observableFromEvent(
      this,
      repository.provider.onDidChangeResources,
      () => (
        /** @description repositoryResourceCount */
        getRepositoryResourceCount(
          repository.provider
        )
      )
    );
  }
  _updateActivityCountBadge(count, store) {
    if (count === 0) {
      return;
    }
    const badge = new NumberBadge(
      count,
      (num) => localize("scmPendingChangesBadge", "{0} pending changes", num)
    );
    store.add(
      this.activityService.showViewActivity(VIEW_PANE_ID, { badge })
    );
  }
  _updateStatusBar(repository, commands, store) {
    if (!repository) {
      return;
    }
    const label = repository.provider.rootUri ? `${basename(repository.provider.rootUri)} (${repository.provider.label})` : repository.provider.label;
    for (let index = 0; index < commands.length; index++) {
      const command = commands[index];
      const tooltip = `${label}${command.tooltip ? ` - ${command.tooltip}` : ""}`;
      let repoAgnosticActionName = command.arguments?.[0];
      if (repoAgnosticActionName && typeof repoAgnosticActionName === "string") {
        repoAgnosticActionName = repoAgnosticActionName.substring(0, repoAgnosticActionName.lastIndexOf("/")).replace(/^git\./, "");
        if (repoAgnosticActionName.length > 1) {
          repoAgnosticActionName = repoAgnosticActionName[0].toLocaleUpperCase() + repoAgnosticActionName.slice(1);
        }
      } else {
        repoAgnosticActionName = "";
      }
      const statusbarEntry = {
        name: localize("status.scm", "Source Control") + (repoAgnosticActionName ? ` ${repoAgnosticActionName}` : ""),
        text: command.title,
        ariaLabel: tooltip,
        tooltip,
        command: command.id ? command : void 0
      };
      store.add(
        index === 0 ? this.statusbarService.addEntry(
          statusbarEntry,
          `status.scm.${index}`,
          MainThreadStatusBarAlignment.LEFT,
          1e4
        ) : this.statusbarService.addEntry(
          statusbarEntry,
          `status.scm.${index}`,
          MainThreadStatusBarAlignment.LEFT,
          {
            id: `status.scm.${index - 1}`,
            alignment: MainThreadStatusBarAlignment.RIGHT,
            compact: true
          }
        )
      );
    }
  }
  _updateActiveRepositoryContextKeys(repositoryName, branchName) {
    this._activeRepositoryNameContextKey.set(repositoryName ?? "");
    this._activeRepositoryBranchNameContextKey.set(branchName ?? "");
  }
};
SCMActiveRepositoryController = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ISCMService),
  __decorateParam(4, ISCMViewService),
  __decorateParam(5, IStatusbarService),
  __decorateParam(6, ITitleService)
], SCMActiveRepositoryController);
let SCMActiveResourceContextKeyController = class extends Disposable {
  constructor(editorGroupsService, scmService, uriIdentityService) {
    super();
    this.scmService = scmService;
    this.uriIdentityService = uriIdentityService;
    const activeResourceHasChangesContextKey = new RawContextKey("scmActiveResourceHasChanges", false, localize("scmActiveResourceHasChanges", "Whether the active resource has changes"));
    const activeResourceRepositoryContextKey = new RawContextKey("scmActiveResourceRepository", void 0, localize("scmActiveResourceRepository", "The active resource's repository"));
    this._store.add(autorunWithStore((reader, store) => {
      for (const repository of this._repositories.read(reader)) {
        store.add(Event.runAndSubscribe(repository.provider.onDidChangeResources, () => {
          this._onDidRepositoryChange.fire();
        }));
      }
    }));
    const hasChangesContextKeyProvider = {
      contextKey: activeResourceHasChangesContextKey,
      getGroupContextKeyValue: /* @__PURE__ */ __name((group) => this._getEditorHasChanges(group.activeEditor), "getGroupContextKeyValue"),
      onDidChange: this._onDidRepositoryChange.event
    };
    const repositoryContextKeyProvider = {
      contextKey: activeResourceRepositoryContextKey,
      getGroupContextKeyValue: /* @__PURE__ */ __name((group) => this._getEditorRepositoryId(group.activeEditor), "getGroupContextKeyValue"),
      onDidChange: this._onDidRepositoryChange.event
    };
    this._store.add(editorGroupsService.registerContextKeyProvider(hasChangesContextKeyProvider));
    this._store.add(editorGroupsService.registerContextKeyProvider(repositoryContextKeyProvider));
  }
  static {
    __name(this, "SCMActiveResourceContextKeyController");
  }
  _repositories = observableFromEvent(
    this,
    Event.any(
      this.scmService.onDidAddRepository,
      this.scmService.onDidRemoveRepository
    ),
    () => this.scmService.repositories
  );
  _onDidRepositoryChange = new Emitter();
  _getEditorHasChanges(activeEditor) {
    const activeResource = EditorResourceAccessor.getOriginalUri(activeEditor);
    if (!activeResource) {
      return false;
    }
    const activeResourceRepository = this.scmService.getRepository(activeResource);
    for (const resourceGroup of activeResourceRepository?.provider.groups ?? []) {
      if (resourceGroup.resources.some(
        (scmResource) => this.uriIdentityService.extUri.isEqual(
          activeResource,
          scmResource.sourceUri
        )
      )) {
        return true;
      }
    }
    return false;
  }
  _getEditorRepositoryId(activeEditor) {
    const activeResource = EditorResourceAccessor.getOriginalUri(activeEditor);
    if (!activeResource) {
      return void 0;
    }
    const activeResourceRepository = this.scmService.getRepository(activeResource);
    return activeResourceRepository?.id;
  }
  dispose() {
    this._onDidRepositoryChange.dispose();
    super.dispose();
  }
};
SCMActiveResourceContextKeyController = __decorateClass([
  __decorateParam(0, IEditorGroupsService),
  __decorateParam(1, ISCMService),
  __decorateParam(2, IUriIdentityService)
], SCMActiveResourceContextKeyController);
export {
  SCMActiveRepositoryController,
  SCMActiveResourceContextKeyController
};
//# sourceMappingURL=activity.js.map
