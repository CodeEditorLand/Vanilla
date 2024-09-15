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
  $,
  addDisposableListener,
  append,
  clearNode,
  reset
} from "../../../../base/browser/dom.js";
import { renderFormattedText } from "../../../../base/browser/formattedTextRenderer.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { renderLabelWithIcons } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Toggle } from "../../../../base/browser/ui/toggle/toggle.js";
import { coalesce, equals } from "../../../../base/common/arrays.js";
import { Delayer, Throttler } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { splitRecentLabel } from "../../../../base/common/labels.js";
import {
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { parse } from "../../../../base/common/marshalling.js";
import { Schemas, matchesScheme } from "../../../../base/common/network.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { assertIsDefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import "./media/gettingStarted.css";
import { MarkdownRenderer } from "../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { localize } from "../../../../nls.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import {
  ConfigurationTarget,
  IConfigurationService
} from "../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import {
  ILabelService,
  Verbosity
} from "../../../../platform/label/common/label.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { Link } from "../../../../platform/opener/browser/link.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget,
  WillSaveStateReason
} from "../../../../platform/storage/common/storage.js";
import {
  ITelemetryService,
  TelemetryLevel,
  firstSessionDateStorageKey
} from "../../../../platform/telemetry/common/telemetry.js";
import { getTelemetryLevel } from "../../../../platform/telemetry/common/telemetryUtils.js";
import {
  defaultButtonStyles,
  defaultToggleStyles
} from "../../../../platform/theme/browser/defaultStyles.js";
import {
  IWorkspaceContextService,
  UNKNOWN_EMPTY_WINDOW_WORKSPACE
} from "../../../../platform/workspace/common/workspace.js";
import {
  IWorkspacesService,
  isRecentFolder,
  isRecentWorkspace
} from "../../../../platform/workspaces/common/workspaces.js";
import { OpenRecentAction } from "../../../browser/actions/windowActions.js";
import {
  OpenFileFolderAction,
  OpenFolderAction,
  OpenFolderViaWorkspaceAction
} from "../../../browser/actions/workspaceActions.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { WorkbenchStateContext } from "../../../common/contextkeys.js";
import {
  IWebviewService
} from "../../webview/browser/webview.js";
import "./gettingStartedColors.js";
import {
  GroupDirection,
  GroupsOrder,
  IEditorGroupsService
} from "../../../services/editor/common/editorGroupsService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IWorkbenchThemeService } from "../../../services/themes/common/workbenchThemeService.js";
import { startEntries } from "../common/gettingStartedContent.js";
import { GettingStartedDetailsRenderer } from "./gettingStartedDetailsRenderer.js";
import {
  gettingStartedCheckedCodicon,
  gettingStartedUncheckedCodicon
} from "./gettingStartedIcons.js";
import { GettingStartedInput } from "./gettingStartedInput.js";
import { GettingStartedIndexList } from "./gettingStartedList.js";
import {
  IWalkthroughsService,
  hiddenEntriesConfigurationKey,
  parseDescription
} from "./gettingStartedService.js";
import {
  restoreWalkthroughsConfigurationKey
} from "./startupPage.js";
const SLIDE_TRANSITION_TIME_MS = 250;
const configurationKey = "workbench.startupEditor";
const allWalkthroughsHiddenContext = new RawContextKey(
  "allWalkthroughsHidden",
  false
);
const inWelcomeContext = new RawContextKey("inWelcome", false);
const parsedStartEntries = startEntries.map(
  (e, i) => ({
    command: e.content.command,
    description: e.description,
    icon: { type: "icon", icon: e.icon },
    id: e.id,
    order: i,
    title: e.title,
    when: ContextKeyExpr.deserialize(e.when) ?? ContextKeyExpr.true()
  })
);
const REDUCED_MOTION_KEY = "workbench.welcomePage.preferReducedMotion";
let GettingStartedPage = class extends EditorPane {
  constructor(group, commandService, productService, keybindingService, gettingStartedService, configurationService, telemetryService, languageService, fileService, openerService, themeService, storageService, extensionService, instantiationService, notificationService, groupsService, contextService, quickInputService, workspacesService, labelService, hostService, webviewService, workspaceContextService, accessibilityService) {
    super(
      GettingStartedPage.ID,
      group,
      telemetryService,
      themeService,
      storageService
    );
    this.commandService = commandService;
    this.productService = productService;
    this.keybindingService = keybindingService;
    this.gettingStartedService = gettingStartedService;
    this.configurationService = configurationService;
    this.languageService = languageService;
    this.fileService = fileService;
    this.openerService = openerService;
    this.themeService = themeService;
    this.storageService = storageService;
    this.extensionService = extensionService;
    this.instantiationService = instantiationService;
    this.notificationService = notificationService;
    this.groupsService = groupsService;
    this.quickInputService = quickInputService;
    this.workspacesService = workspacesService;
    this.labelService = labelService;
    this.hostService = hostService;
    this.webviewService = webviewService;
    this.workspaceContextService = workspaceContextService;
    this.accessibilityService = accessibilityService;
    this.container = $(".gettingStartedContainer", {
      role: "document",
      tabindex: 0,
      "aria-label": localize(
        "welcomeAriaLabel",
        "Overview of how to get up to speed with your editor."
      )
    });
    this.stepMediaComponent = $(".getting-started-media");
    this.stepMediaComponent.id = generateUuid();
    this.categoriesSlideDisposables = this._register(new DisposableStore());
    this.detailsRenderer = new GettingStartedDetailsRenderer(
      this.fileService,
      this.notificationService,
      this.extensionService,
      this.languageService
    );
    this.contextService = this._register(
      contextService.createScoped(this.container)
    );
    inWelcomeContext.bindTo(this.contextService).set(true);
    this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
    this._register(this.dispatchListeners);
    this.buildSlideThrottle = new Throttler();
    const rerender = /* @__PURE__ */ __name(() => {
      this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
      if (this.currentWalkthrough) {
        const existingSteps = this.currentWalkthrough.steps.map(
          (step) => step.id
        );
        const newCategory = this.gettingStartedCategories.find(
          (category) => this.currentWalkthrough?.id === category.id
        );
        if (newCategory) {
          const newSteps = newCategory.steps.map((step) => step.id);
          if (!equals(newSteps, existingSteps)) {
            this.buildSlideThrottle.queue(
              () => this.buildCategoriesSlide()
            );
          }
        }
      } else {
        this.buildSlideThrottle.queue(
          () => this.buildCategoriesSlide()
        );
      }
    }, "rerender");
    this._register(
      this.gettingStartedService.onDidAddWalkthrough(rerender)
    );
    this._register(
      this.gettingStartedService.onDidRemoveWalkthrough(rerender)
    );
    this.recentlyOpened = this.workspacesService.getRecentlyOpened();
    this._register(
      workspacesService.onDidChangeRecentlyOpened(() => {
        this.recentlyOpened = workspacesService.getRecentlyOpened();
        rerender();
      })
    );
    this._register(
      this.gettingStartedService.onDidChangeWalkthrough((category) => {
        const ourCategory = this.gettingStartedCategories.find(
          (c) => c.id === category.id
        );
        if (!ourCategory) {
          return;
        }
        ourCategory.title = category.title;
        ourCategory.description = category.description;
        this.container.querySelectorAll(
          `[x-category-title-for="${category.id}"]`
        ).forEach(
          (step) => step.innerText = ourCategory.title
        );
        this.container.querySelectorAll(
          `[x-category-description-for="${category.id}"]`
        ).forEach(
          (step) => step.innerText = ourCategory.description
        );
      })
    );
    this._register(
      this.gettingStartedService.onDidProgressStep((step) => {
        const category = this.gettingStartedCategories.find(
          (category2) => category2.id === step.category
        );
        if (!category) {
          throw Error(
            "Could not find category with ID: " + step.category
          );
        }
        const ourStep = category.steps.find(
          (_step) => _step.id === step.id
        );
        if (!ourStep) {
          throw Error("Could not find step with ID: " + step.id);
        }
        const stats = this.getWalkthroughCompletionStats(category);
        if (!ourStep.done && stats.stepsComplete === stats.stepsTotal - 1) {
          this.hideCategory(category.id);
        }
        this._register(
          this.configurationService.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(REDUCED_MOTION_KEY)) {
              this.container.classList.toggle(
                "animatable",
                this.shouldAnimate()
              );
            }
          })
        );
        ourStep.done = step.done;
        if (category.id === this.currentWalkthrough?.id) {
          const badgeelements = assertIsDefined(
            this.window.document.querySelectorAll(
              `[data-done-step-id="${step.id}"]`
            )
          );
          badgeelements.forEach((badgeelement) => {
            if (step.done) {
              badgeelement.setAttribute("aria-checked", "true");
              badgeelement.parentElement?.setAttribute(
                "aria-checked",
                "true"
              );
              badgeelement.classList.remove(
                ...ThemeIcon.asClassNameArray(
                  gettingStartedUncheckedCodicon
                )
              );
              badgeelement.classList.add(
                "complete",
                ...ThemeIcon.asClassNameArray(
                  gettingStartedCheckedCodicon
                )
              );
            } else {
              badgeelement.setAttribute("aria-checked", "false");
              badgeelement.parentElement?.setAttribute(
                "aria-checked",
                "false"
              );
              badgeelement.classList.remove(
                "complete",
                ...ThemeIcon.asClassNameArray(
                  gettingStartedCheckedCodicon
                )
              );
              badgeelement.classList.add(
                ...ThemeIcon.asClassNameArray(
                  gettingStartedUncheckedCodicon
                )
              );
            }
          });
        }
        this.updateCategoryProgress();
      })
    );
    this._register(
      this.storageService.onWillSaveState((e) => {
        if (e.reason !== WillSaveStateReason.SHUTDOWN) {
          return;
        }
        if (this.workspaceContextService.getWorkspace().folders.length !== 0) {
          return;
        }
        if (!this.editorInput || !this.currentWalkthrough || !this.editorInput.selectedCategory || !this.editorInput.selectedStep) {
          return;
        }
        const restoreData = {
          folder: UNKNOWN_EMPTY_WINDOW_WORKSPACE.id,
          category: this.editorInput.selectedCategory,
          step: this.editorInput.selectedStep
        };
        this.storageService.store(
          restoreWalkthroughsConfigurationKey,
          JSON.stringify(restoreData),
          StorageScope.PROFILE,
          StorageTarget.MACHINE
        );
      })
    );
  }
  static {
    __name(this, "GettingStartedPage");
  }
  static ID = "gettingStartedPage";
  editorInput;
  inProgressScroll = Promise.resolve();
  dispatchListeners = new DisposableStore();
  stepDisposables = new DisposableStore();
  detailsPageDisposables = new DisposableStore();
  mediaDisposables = new DisposableStore();
  // Ensure that the these are initialized before use.
  // Currently initialized before use in buildCategoriesSlide and scrollToCategory
  recentlyOpened;
  gettingStartedCategories;
  currentWalkthrough;
  categoriesPageScrollbar;
  detailsPageScrollbar;
  detailsScrollbar;
  buildSlideThrottle = new Throttler();
  container;
  contextService;
  hasScrolledToFirstCategory = false;
  recentlyOpenedList;
  startList;
  gettingStartedList;
  stepsSlide;
  categoriesSlide;
  stepsContent;
  stepMediaComponent;
  webview;
  layoutMarkdown;
  detailsRenderer;
  categoriesSlideDisposables;
  showFeaturedWalkthrough = true;
  // remove when 'workbench.welcomePage.preferReducedMotion' deprecated
  shouldAnimate() {
    if (this.configurationService.getValue(REDUCED_MOTION_KEY)) {
      return false;
    }
    if (this.accessibilityService.isMotionReduced()) {
      return false;
    }
    return true;
  }
  getWalkthroughCompletionStats(walkthrough) {
    const activeSteps = walkthrough.steps.filter(
      (s) => this.contextService.contextMatchesRules(s.when)
    );
    return {
      stepsComplete: activeSteps.filter((s) => s.done).length,
      stepsTotal: activeSteps.length
    };
  }
  async setInput(newInput, options, context, token) {
    this.container.classList.remove("animatable");
    this.editorInput = newInput;
    await super.setInput(newInput, options, context, token);
    await this.buildCategoriesSlide();
    if (this.shouldAnimate()) {
      setTimeout(() => this.container.classList.add("animatable"), 0);
    }
  }
  async makeCategoryVisibleWhenAvailable(categoryID, stepId) {
    this.scrollToCategory(categoryID, stepId);
  }
  registerDispatchListeners() {
    this.dispatchListeners.clear();
    this.container.querySelectorAll("[x-dispatch]").forEach((element) => {
      const dispatch = element.getAttribute("x-dispatch") ?? "";
      let command, argument;
      if (dispatch.startsWith("openLink:https")) {
        [command, argument] = [
          "openLink",
          dispatch.replace("openLink:", "")
        ];
      } else {
        [command, argument] = dispatch.split(":");
      }
      if (command) {
        this.dispatchListeners.add(
          addDisposableListener(element, "click", (e) => {
            e.stopPropagation();
            this.runDispatchCommand(command, argument);
          })
        );
        this.dispatchListeners.add(
          addDisposableListener(element, "keyup", (e) => {
            const keyboardEvent = new StandardKeyboardEvent(e);
            e.stopPropagation();
            switch (keyboardEvent.keyCode) {
              case KeyCode.Enter:
              case KeyCode.Space:
                this.runDispatchCommand(command, argument);
                return;
            }
          })
        );
      }
    });
  }
  async runDispatchCommand(command, argument) {
    this.commandService.executeCommand("workbench.action.keepEditor");
    this.telemetryService.publicLog2("gettingStarted.ActionExecuted", {
      command,
      argument,
      walkthroughId: this.currentWalkthrough?.id
    });
    switch (command) {
      case "scrollPrev": {
        this.scrollPrev();
        break;
      }
      case "skip": {
        this.runSkip();
        break;
      }
      case "showMoreRecents": {
        this.commandService.executeCommand(OpenRecentAction.ID);
        break;
      }
      case "seeAllWalkthroughs": {
        await this.openWalkthroughSelector();
        break;
      }
      case "openFolder": {
        if (this.contextService.contextMatchesRules(
          ContextKeyExpr.and(
            WorkbenchStateContext.isEqualTo("workspace")
          )
        )) {
          this.commandService.executeCommand(
            OpenFolderViaWorkspaceAction.ID
          );
        } else {
          this.commandService.executeCommand(
            isMacintosh ? "workbench.action.files.openFileFolder" : "workbench.action.files.openFolder"
          );
        }
        break;
      }
      case "selectCategory": {
        this.scrollToCategory(argument);
        this.gettingStartedService.markWalkthroughOpened(argument);
        break;
      }
      case "selectStartEntry": {
        const selected = startEntries.find((e) => e.id === argument);
        if (selected) {
          this.runStepCommand(selected.content.command);
        } else {
          throw Error(
            "could not find start entry with id: " + argument
          );
        }
        break;
      }
      case "hideCategory": {
        this.hideCategory(argument);
        break;
      }
      // Use selectTask over selectStep to keep telemetry consistant:https://github.com/microsoft/vscode/issues/122256
      case "selectTask": {
        this.selectStep(argument);
        break;
      }
      case "toggleStepCompletion": {
        this.toggleStepCompletion(argument);
        break;
      }
      case "allDone": {
        this.markAllStepsComplete();
        break;
      }
      case "nextSection": {
        const next = this.currentWalkthrough?.next;
        if (next) {
          this.scrollToCategory(next);
        } else {
          console.error(
            "Error scrolling to next section of",
            this.currentWalkthrough
          );
        }
        break;
      }
      case "openLink": {
        this.openerService.open(argument);
        break;
      }
      default: {
        console.error("Dispatch to", command, argument, "not defined");
        break;
      }
    }
  }
  hideCategory(categoryId) {
    const selectedCategory = this.gettingStartedCategories.find(
      (category) => category.id === categoryId
    );
    if (!selectedCategory) {
      throw Error("Could not find category with ID " + categoryId);
    }
    this.setHiddenCategories([
      ...this.getHiddenCategories().add(categoryId)
    ]);
    this.gettingStartedList?.rerender();
  }
  markAllStepsComplete() {
    if (this.currentWalkthrough) {
      this.currentWalkthrough?.steps.forEach((step) => {
        if (!step.done) {
          this.gettingStartedService.progressStep(step.id);
        }
      });
      this.hideCategory(this.currentWalkthrough?.id);
      this.scrollPrev();
    } else {
      throw Error("No walkthrough opened");
    }
  }
  toggleStepCompletion(argument) {
    const stepToggle = assertIsDefined(
      this.currentWalkthrough?.steps.find((step) => step.id === argument)
    );
    if (stepToggle.done) {
      this.gettingStartedService.deprogressStep(argument);
    } else {
      this.gettingStartedService.progressStep(argument);
    }
  }
  async openWalkthroughSelector() {
    const selection = await this.quickInputService.pick(
      this.gettingStartedCategories.filter((c) => this.contextService.contextMatchesRules(c.when)).map((x) => ({
        id: x.id,
        label: x.title,
        detail: x.description,
        description: x.source
      })),
      {
        canPickMany: false,
        matchOnDescription: true,
        matchOnDetail: true,
        title: localize("pickWalkthroughs", "Open Walkthrough...")
      }
    );
    if (selection) {
      this.runDispatchCommand("selectCategory", selection.id);
    }
  }
  getHiddenCategories() {
    return new Set(
      JSON.parse(
        this.storageService.get(
          hiddenEntriesConfigurationKey,
          StorageScope.PROFILE,
          "[]"
        )
      )
    );
  }
  setHiddenCategories(hidden) {
    this.storageService.store(
      hiddenEntriesConfigurationKey,
      JSON.stringify(hidden),
      StorageScope.PROFILE,
      StorageTarget.USER
    );
  }
  currentMediaComponent = void 0;
  currentMediaType = void 0;
  async buildMediaComponent(stepId, forceRebuild = false) {
    if (!this.currentWalkthrough) {
      throw Error("no walkthrough selected");
    }
    const stepToExpand = assertIsDefined(
      this.currentWalkthrough.steps.find((step) => step.id === stepId)
    );
    if (!forceRebuild && this.currentMediaComponent === stepId) {
      return;
    }
    this.currentMediaComponent = stepId;
    this.stepDisposables.clear();
    this.stepDisposables.add({
      dispose: /* @__PURE__ */ __name(() => {
        this.currentMediaComponent = void 0;
      }, "dispose")
    });
    if (this.currentMediaType !== stepToExpand.media.type) {
      this.currentMediaType = stepToExpand.media.type;
      this.mediaDisposables.add(
        toDisposable(() => {
          this.currentMediaType = void 0;
        })
      );
      clearNode(this.stepMediaComponent);
      if (stepToExpand.media.type === "svg") {
        this.webview = this.mediaDisposables.add(
          this.webviewService.createWebviewElement({
            title: void 0,
            options: { disableServiceWorker: true },
            contentOptions: {},
            extension: void 0
          })
        );
        this.webview.mountTo(this.stepMediaComponent, this.window);
      } else if (stepToExpand.media.type === "markdown") {
        this.webview = this.mediaDisposables.add(
          this.webviewService.createWebviewElement({
            options: {},
            contentOptions: {
              localResourceRoots: [stepToExpand.media.root],
              allowScripts: true
            },
            title: "",
            extension: void 0
          })
        );
        this.webview.mountTo(this.stepMediaComponent, this.window);
      }
    }
    if (stepToExpand.media.type === "image") {
      this.stepsContent.classList.add("image");
      this.stepsContent.classList.remove("markdown");
      const media = stepToExpand.media;
      const mediaElement = $("img");
      clearNode(this.stepMediaComponent);
      this.stepMediaComponent.appendChild(mediaElement);
      mediaElement.setAttribute("alt", media.altText);
      this.updateMediaSourceForColorMode(mediaElement, media.path);
      this.stepDisposables.add(
        addDisposableListener(this.stepMediaComponent, "click", () => {
          const hrefs = stepToExpand.description.flatMap(
            (lt) => lt.nodes.filter(
              (node) => typeof node !== "string"
            ).map((node) => node.href)
          );
          if (hrefs.length === 1) {
            const href = hrefs[0];
            if (href.startsWith("http")) {
              this.telemetryService.publicLog2("gettingStarted.ActionExecuted", {
                command: "runStepAction",
                argument: href,
                walkthroughId: this.currentWalkthrough?.id
              });
              this.openerService.open(href);
            }
          }
        })
      );
      this.stepDisposables.add(
        this.themeService.onDidColorThemeChange(
          () => this.updateMediaSourceForColorMode(
            mediaElement,
            media.path
          )
        )
      );
    } else if (stepToExpand.media.type === "svg") {
      this.stepsContent.classList.add("image");
      this.stepsContent.classList.remove("markdown");
      const media = stepToExpand.media;
      this.webview.setHtml(
        await this.detailsRenderer.renderSVG(media.path)
      );
      let isDisposed = false;
      this.stepDisposables.add(
        toDisposable(() => {
          isDisposed = true;
        })
      );
      this.stepDisposables.add(
        this.themeService.onDidColorThemeChange(async () => {
          const body = await this.detailsRenderer.renderSVG(
            media.path
          );
          if (!isDisposed) {
            this.webview.setHtml(body);
          }
        })
      );
      this.stepDisposables.add(
        addDisposableListener(this.stepMediaComponent, "click", () => {
          const hrefs = stepToExpand.description.flatMap(
            (lt) => lt.nodes.filter(
              (node) => typeof node !== "string"
            ).map((node) => node.href)
          );
          if (hrefs.length === 1) {
            const href = hrefs[0];
            if (href.startsWith("http")) {
              this.telemetryService.publicLog2("gettingStarted.ActionExecuted", {
                command: "runStepAction",
                argument: href,
                walkthroughId: this.currentWalkthrough?.id
              });
              this.openerService.open(href);
            }
          }
        })
      );
      this.stepDisposables.add(
        this.webview.onDidClickLink((link) => {
          if (matchesScheme(link, Schemas.https) || matchesScheme(link, Schemas.http) || matchesScheme(link, Schemas.command)) {
            this.openerService.open(link, { allowCommands: true });
          }
        })
      );
    } else if (stepToExpand.media.type === "markdown") {
      this.stepsContent.classList.remove("image");
      this.stepsContent.classList.add("markdown");
      const media = stepToExpand.media;
      const rawHTML = await this.detailsRenderer.renderMarkdown(
        media.path,
        media.base
      );
      this.webview.setHtml(rawHTML);
      const serializedContextKeyExprs = rawHTML.match(/checked-on="([^'][^"]*)"/g)?.map(
        (attr) => attr.slice('checked-on="'.length, -1).replace(/&#39;/g, "'").replace(/&amp;/g, "&")
      );
      const postTrueKeysMessage = /* @__PURE__ */ __name(() => {
        const enabledContextKeys = serializedContextKeyExprs?.filter(
          (expr) => this.contextService.contextMatchesRules(
            ContextKeyExpr.deserialize(expr)
          )
        );
        if (enabledContextKeys) {
          this.webview.postMessage({
            enabledContextKeys
          });
        }
      }, "postTrueKeysMessage");
      if (serializedContextKeyExprs) {
        const contextKeyExprs = coalesce(
          serializedContextKeyExprs.map(
            (expr) => ContextKeyExpr.deserialize(expr)
          )
        );
        const watchingKeys = new Set(
          contextKeyExprs.flatMap((expr) => expr.keys())
        );
        this.stepDisposables.add(
          this.contextService.onDidChangeContext((e) => {
            if (e.affectsSome(watchingKeys)) {
              postTrueKeysMessage();
            }
          })
        );
      }
      let isDisposed = false;
      this.stepDisposables.add(
        toDisposable(() => {
          isDisposed = true;
        })
      );
      this.stepDisposables.add(
        this.webview.onDidClickLink((link) => {
          if (matchesScheme(link, Schemas.https) || matchesScheme(link, Schemas.http) || matchesScheme(link, Schemas.command)) {
            const toSide = link.startsWith("command:toSide:");
            if (toSide) {
              link = link.replace("command:toSide:", "command:");
              this.focusSideEditorGroup();
            }
            this.openerService.open(link, {
              allowCommands: true,
              openToSide: toSide
            });
          }
        })
      );
      if (rawHTML.indexOf("<code>") >= 0) {
        this.stepDisposables.add(
          this.themeService.onDidColorThemeChange(async () => {
            const body = await this.detailsRenderer.renderMarkdown(
              media.path,
              media.base
            );
            if (!isDisposed) {
              this.webview.setHtml(body);
              postTrueKeysMessage();
            }
          })
        );
      }
      const layoutDelayer = new Delayer(50);
      this.layoutMarkdown = () => {
        layoutDelayer.trigger(() => {
          this.webview.postMessage({ layoutMeNow: true });
        });
      };
      this.stepDisposables.add(layoutDelayer);
      this.stepDisposables.add({
        dispose: /* @__PURE__ */ __name(() => this.layoutMarkdown = void 0, "dispose")
      });
      postTrueKeysMessage();
      this.stepDisposables.add(
        this.webview.onMessage(async (e) => {
          const message = e.message;
          if (message.startsWith("command:")) {
            this.openerService.open(message, {
              allowCommands: true
            });
          } else if (message.startsWith("setTheme:")) {
            const themeId = message.slice("setTheme:".length);
            const theme = (await this.themeService.getColorThemes()).find((theme2) => theme2.settingsId === themeId);
            if (theme) {
              this.themeService.setColorTheme(
                theme.id,
                ConfigurationTarget.USER
              );
            }
          } else {
            console.error("Unexpected message", message);
          }
        })
      );
    }
  }
  async selectStepLoose(id) {
    if (id.startsWith(`${this.editorInput.selectedCategory}#`)) {
      this.selectStep(id);
    } else {
      const toSelect = this.editorInput.selectedCategory + "#" + id;
      this.selectStep(toSelect);
    }
  }
  async selectStep(id, delayFocus = true) {
    if (id) {
      let stepElement = this.container.querySelector(
        `[data-step-id="${id}"]`
      );
      if (!stepElement) {
        stepElement = this.container.querySelector(
          `[data-step-id]`
        );
        if (!stepElement) {
          return;
        }
        id = assertIsDefined(stepElement.getAttribute("data-step-id"));
      }
      stepElement.parentElement?.querySelectorAll(".expanded").forEach((node) => {
        if (node.getAttribute("data-step-id") !== id) {
          node.classList.remove("expanded");
          node.setAttribute("aria-expanded", "false");
        }
      });
      setTimeout(
        () => stepElement.focus(),
        delayFocus && this.shouldAnimate() ? SLIDE_TRANSITION_TIME_MS : 0
      );
      this.editorInput.selectedStep = id;
      stepElement.classList.add("expanded");
      stepElement.setAttribute("aria-expanded", "true");
      this.buildMediaComponent(id, true);
      this.gettingStartedService.progressByEvent("stepSelected:" + id);
    } else {
      this.editorInput.selectedStep = void 0;
    }
    this.detailsPageScrollbar?.scanDomNode();
    this.detailsScrollbar?.scanDomNode();
  }
  updateMediaSourceForColorMode(element, sources) {
    const themeType = this.themeService.getColorTheme().type;
    const src = sources[themeType].toString(true).replace(/ /g, "%20");
    element.srcset = src.toLowerCase().endsWith(".svg") ? src : src + " 1.5x";
  }
  createEditor(parent) {
    if (this.detailsPageScrollbar) {
      this.detailsPageScrollbar.dispose();
    }
    if (this.categoriesPageScrollbar) {
      this.categoriesPageScrollbar.dispose();
    }
    this.categoriesSlide = $(
      ".gettingStartedSlideCategories.gettingStartedSlide"
    );
    const prevButton = $(
      "button.prev-button.button-link",
      { "x-dispatch": "scrollPrev" },
      $("span.scroll-button.codicon.codicon-chevron-left"),
      $("span.moreText", {}, localize("welcome", "Welcome"))
    );
    this.stepsSlide = $(
      ".gettingStartedSlideDetails.gettingStartedSlide",
      {},
      prevButton
    );
    this.stepsContent = $(".gettingStartedDetailsContent", {});
    this.detailsPageScrollbar = this._register(
      new DomScrollableElement(this.stepsContent, {
        className: "full-height-scrollable"
      })
    );
    this.categoriesPageScrollbar = this._register(
      new DomScrollableElement(this.categoriesSlide, {
        className: "full-height-scrollable categoriesScrollbar"
      })
    );
    this.stepsSlide.appendChild(this.detailsPageScrollbar.getDomNode());
    const gettingStartedPage = $(
      ".gettingStarted",
      {},
      this.categoriesPageScrollbar.getDomNode(),
      this.stepsSlide
    );
    this.container.appendChild(gettingStartedPage);
    this.categoriesPageScrollbar.scanDomNode();
    this.detailsPageScrollbar.scanDomNode();
    parent.appendChild(this.container);
  }
  async buildCategoriesSlide() {
    this.categoriesSlideDisposables.clear();
    const showOnStartupCheckbox = new Toggle({
      icon: Codicon.check,
      actionClassName: "getting-started-checkbox",
      isChecked: this.configurationService.getValue(configurationKey) === "welcomePage",
      title: localize(
        "checkboxTitle",
        "When checked, this page will be shown on startup."
      ),
      ...defaultToggleStyles
    });
    showOnStartupCheckbox.domNode.id = "showOnStartup";
    const showOnStartupLabel = $(
      "label.caption",
      { for: "showOnStartup" },
      localize(
        "welcomePage.showOnStartup",
        "Show welcome page on startup"
      )
    );
    const onShowOnStartupChanged = /* @__PURE__ */ __name(() => {
      if (showOnStartupCheckbox.checked) {
        this.telemetryService.publicLog2("gettingStarted.ActionExecuted", {
          command: "showOnStartupChecked",
          argument: void 0,
          walkthroughId: this.currentWalkthrough?.id
        });
        this.configurationService.updateValue(
          configurationKey,
          "welcomePage"
        );
      } else {
        this.telemetryService.publicLog2("gettingStarted.ActionExecuted", {
          command: "showOnStartupUnchecked",
          argument: void 0,
          walkthroughId: this.currentWalkthrough?.id
        });
        this.configurationService.updateValue(configurationKey, "none");
      }
    }, "onShowOnStartupChanged");
    this.categoriesSlideDisposables.add(showOnStartupCheckbox);
    this.categoriesSlideDisposables.add(
      showOnStartupCheckbox.onChange(() => {
        onShowOnStartupChanged();
      })
    );
    this.categoriesSlideDisposables.add(
      addDisposableListener(showOnStartupLabel, "click", () => {
        showOnStartupCheckbox.checked = !showOnStartupCheckbox.checked;
        onShowOnStartupChanged();
      })
    );
    const header = $(
      ".header",
      {},
      $("h1.product-name.caption", {}, this.productService.nameLong),
      $(
        "p.subtitle.description",
        {},
        localize(
          {
            key: "gettingStarted.editingEvolved",
            comment: ["Shown as subtitle on the Welcome page."]
          },
          "Editing evolved"
        )
      )
    );
    const leftColumn = $(".categories-column.categories-column-left", {});
    const rightColumn = $(".categories-column.categories-column-right", {});
    const startList = this.buildStartList();
    const recentList = this.buildRecentlyOpenedList();
    const gettingStartedList = this.buildGettingStartedWalkthroughsList();
    const footer = $(
      ".footer",
      {},
      $(
        "p.showOnStartup",
        {},
        showOnStartupCheckbox.domNode,
        showOnStartupLabel
      )
    );
    const layoutLists = /* @__PURE__ */ __name(() => {
      if (gettingStartedList.itemCount) {
        this.container.classList.remove("noWalkthroughs");
        reset(rightColumn, gettingStartedList.getDomElement());
      } else {
        this.container.classList.add("noWalkthroughs");
        reset(rightColumn);
      }
      setTimeout(() => this.categoriesPageScrollbar?.scanDomNode(), 50);
      layoutRecentList();
    }, "layoutLists");
    const layoutRecentList = /* @__PURE__ */ __name(() => {
      if (this.container.classList.contains("noWalkthroughs")) {
        recentList.setLimit(10);
        reset(leftColumn, startList.getDomElement());
        reset(rightColumn, recentList.getDomElement());
      } else {
        recentList.setLimit(5);
        reset(
          leftColumn,
          startList.getDomElement(),
          recentList.getDomElement()
        );
      }
    }, "layoutRecentList");
    gettingStartedList.onDidChange(layoutLists);
    layoutLists();
    reset(
      this.categoriesSlide,
      $(
        ".gettingStartedCategoriesContainer",
        {},
        header,
        leftColumn,
        rightColumn,
        footer
      )
    );
    this.categoriesPageScrollbar?.scanDomNode();
    this.updateCategoryProgress();
    this.registerDispatchListeners();
    if (this.editorInput.selectedCategory) {
      this.currentWalkthrough = this.gettingStartedCategories.find(
        (category) => category.id === this.editorInput.selectedCategory
      );
      if (this.currentWalkthrough) {
        this.buildCategorySlide(
          this.editorInput.selectedCategory,
          this.editorInput.selectedStep
        );
        this.setSlide("details");
        return;
      } else {
        this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
        this.currentWalkthrough = this.gettingStartedCategories.find(
          (category) => category.id === this.editorInput.selectedCategory
        );
        if (this.currentWalkthrough) {
          this.buildCategorySlide(
            this.editorInput.selectedCategory,
            this.editorInput.selectedStep
          );
          this.setSlide("details");
          return;
        }
      }
    }
    const someStepsComplete = this.gettingStartedCategories.some(
      (category) => category.steps.find((s) => s.done)
    );
    if (this.editorInput.showTelemetryNotice && this.productService.openToWelcomeMainPage) {
      const telemetryNotice = $("p.telemetry-notice");
      this.buildTelemetryFooter(telemetryNotice);
      footer.appendChild(telemetryNotice);
    } else if (!this.productService.openToWelcomeMainPage && !someStepsComplete && !this.hasScrolledToFirstCategory && this.showFeaturedWalkthrough) {
      const firstSessionDateString = this.storageService.get(
        firstSessionDateStorageKey,
        StorageScope.APPLICATION
      ) || (/* @__PURE__ */ new Date()).toUTCString();
      const daysSinceFirstSession = (+/* @__PURE__ */ new Date() - +new Date(firstSessionDateString)) / 1e3 / 60 / 60 / 24;
      const fistContentBehaviour = daysSinceFirstSession < 1 ? "openToFirstCategory" : "index";
      if (fistContentBehaviour === "openToFirstCategory") {
        const first = this.gettingStartedCategories.filter(
          (c) => !c.when || this.contextService.contextMatchesRules(c.when)
        )[0];
        if (first) {
          this.hasScrolledToFirstCategory = true;
          this.currentWalkthrough = first;
          this.editorInput.selectedCategory = this.currentWalkthrough?.id;
          this.buildCategorySlide(
            this.editorInput.selectedCategory,
            void 0
          );
          this.setSlide("details");
          return;
        }
      }
    }
    this.setSlide("categories");
  }
  buildRecentlyOpenedList() {
    const renderRecent = /* @__PURE__ */ __name((recent) => {
      let fullPath;
      let windowOpenable;
      if (isRecentFolder(recent)) {
        windowOpenable = { folderUri: recent.folderUri };
        fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.folderUri, {
          verbose: Verbosity.LONG
        });
      } else {
        fullPath = recent.label || this.labelService.getWorkspaceLabel(recent.workspace, {
          verbose: Verbosity.LONG
        });
        windowOpenable = { workspaceUri: recent.workspace.configPath };
      }
      const { name, parentPath } = splitRecentLabel(fullPath);
      const li = $("li");
      const link = $("button.button-link");
      link.innerText = name;
      link.title = fullPath;
      link.setAttribute(
        "aria-label",
        localize(
          "welcomePage.openFolderWithPath",
          "Open folder {0} with path {1}",
          name,
          parentPath
        )
      );
      link.addEventListener("click", (e) => {
        this.telemetryService.publicLog2("gettingStarted.ActionExecuted", {
          command: "openRecent",
          argument: void 0,
          walkthroughId: this.currentWalkthrough?.id
        });
        this.hostService.openWindow([windowOpenable], {
          forceNewWindow: e.ctrlKey || e.metaKey,
          remoteAuthority: recent.remoteAuthority || null
          // local window if remoteAuthority is not set or can not be deducted from the openable
        });
        e.preventDefault();
        e.stopPropagation();
      });
      li.appendChild(link);
      const span = $("span");
      span.classList.add("path");
      span.classList.add("detail");
      span.innerText = parentPath;
      span.title = fullPath;
      li.appendChild(span);
      return li;
    }, "renderRecent");
    if (this.recentlyOpenedList) {
      this.recentlyOpenedList.dispose();
    }
    const recentlyOpenedList = this.recentlyOpenedList = new GettingStartedIndexList({
      title: localize("recent", "Recent"),
      klass: "recently-opened",
      limit: 5,
      empty: $(
        ".empty-recent",
        {},
        localize("noRecents", "You have no recent folders,"),
        $(
          "button.button-link",
          { "x-dispatch": "openFolder" },
          localize("openFolder", "open a folder")
        ),
        localize("toStart", "to start.")
      ),
      more: $(
        ".more",
        {},
        $(
          "button.button-link",
          {
            "x-dispatch": "showMoreRecents",
            title: localize(
              "show more recents",
              "Show All Recent Folders {0}",
              this.getKeybindingLabel(OpenRecentAction.ID)
            )
          },
          localize("showAll", "More...")
        )
      ),
      renderElement: renderRecent,
      contextService: this.contextService
    });
    recentlyOpenedList.onDidChange(() => this.registerDispatchListeners());
    this.recentlyOpened.then(({ workspaces }) => {
      const workspacesWithID = workspaces.filter(
        (recent) => !this.workspaceContextService.isCurrentWorkspace(
          isRecentWorkspace(recent) ? recent.workspace : recent.folderUri
        )
      ).map((recent) => ({
        ...recent,
        id: isRecentWorkspace(recent) ? recent.workspace.id : recent.folderUri.toString()
      }));
      const updateEntries = /* @__PURE__ */ __name(() => {
        recentlyOpenedList.setEntries(workspacesWithID);
      }, "updateEntries");
      updateEntries();
      recentlyOpenedList.register(
        this.labelService.onDidChangeFormatters(
          () => updateEntries()
        )
      );
    }).catch(onUnexpectedError);
    return recentlyOpenedList;
  }
  buildStartList() {
    const renderStartEntry = /* @__PURE__ */ __name((entry) => $(
      "li",
      {},
      $(
        "button.button-link",
        {
          "x-dispatch": "selectStartEntry:" + entry.id,
          title: entry.description + " " + this.getKeybindingLabel(entry.command)
        },
        this.iconWidgetFor(entry),
        $("span", {}, entry.title)
      )
    ), "renderStartEntry");
    if (this.startList) {
      this.startList.dispose();
    }
    const startList = this.startList = new GettingStartedIndexList({
      title: localize("start", "Start"),
      klass: "start-container",
      limit: 10,
      renderElement: renderStartEntry,
      rankElement: /* @__PURE__ */ __name((e) => -e.order, "rankElement"),
      contextService: this.contextService
    });
    startList.setEntries(parsedStartEntries);
    startList.onDidChange(() => this.registerDispatchListeners());
    return startList;
  }
  buildGettingStartedWalkthroughsList() {
    const renderGetttingStaredWalkthrough = /* @__PURE__ */ __name((category) => {
      const renderNewBadge = (category.newItems || category.newEntry) && !category.isFeatured;
      const newBadge = $(".new-badge", {});
      if (category.newEntry) {
        reset(newBadge, $(".new-category", {}, localize("new", "New")));
      } else if (category.newItems) {
        reset(
          newBadge,
          $(
            ".new-items",
            {},
            localize(
              {
                key: "newItems",
                comment: [
                  "Shown when a list of items has changed based on an update from a remote source"
                ]
              },
              "Updated"
            )
          )
        );
      }
      const featuredBadge = $(".featured-badge", {});
      const descriptionContent = $(".description-content", {});
      if (category.isFeatured && this.showFeaturedWalkthrough) {
        reset(
          featuredBadge,
          $(
            ".featured",
            {},
            $("span.featured-icon.codicon.codicon-star-full")
          )
        );
        reset(
          descriptionContent,
          ...renderLabelWithIcons(category.description)
        );
      }
      const titleContent = $("h3.category-title.max-lines-3", {
        "x-category-title-for": category.id
      });
      reset(titleContent, ...renderLabelWithIcons(category.title));
      return $(
        "button.getting-started-category" + (category.isFeatured && this.showFeaturedWalkthrough ? ".featured" : ""),
        {
          "x-dispatch": "selectCategory:" + category.id,
          title: category.description
        },
        featuredBadge,
        $(
          ".main-content",
          {},
          this.iconWidgetFor(category),
          titleContent,
          renderNewBadge ? newBadge : $(".no-badge"),
          $("a.codicon.codicon-close.hide-category-button", {
            tabindex: 0,
            "x-dispatch": "hideCategory:" + category.id,
            title: localize("close", "Hide"),
            role: "button",
            "aria-label": localize("closeAriaLabel", "Hide")
          })
        ),
        descriptionContent,
        $(
          ".category-progress",
          { "x-data-category-id": category.id },
          $(
            ".progress-bar-outer",
            { role: "progressbar" },
            $(".progress-bar-inner")
          )
        )
      );
    }, "renderGetttingStaredWalkthrough");
    if (this.gettingStartedList) {
      this.gettingStartedList.dispose();
    }
    const rankWalkthrough = /* @__PURE__ */ __name((e) => {
      let rank = e.order;
      if (e.isFeatured) {
        rank += 7;
      }
      if (e.newEntry) {
        rank += 3;
      }
      if (e.newItems) {
        rank += 2;
      }
      if (e.recencyBonus) {
        rank += 4 * e.recencyBonus;
      }
      if (this.getHiddenCategories().has(e.id)) {
        rank = null;
      }
      return rank;
    }, "rankWalkthrough");
    const gettingStartedList = this.gettingStartedList = new GettingStartedIndexList({
      title: localize("walkthroughs", "Walkthroughs"),
      klass: "getting-started",
      limit: 5,
      footer: $(
        "span.button-link.see-all-walkthroughs",
        { "x-dispatch": "seeAllWalkthroughs", tabindex: 0 },
        localize("showAll", "More...")
      ),
      renderElement: renderGetttingStaredWalkthrough,
      rankElement: rankWalkthrough,
      contextService: this.contextService
    });
    gettingStartedList.onDidChange(() => {
      const hidden = this.getHiddenCategories();
      const someWalkthroughsHidden = hidden.size || gettingStartedList.itemCount < this.gettingStartedCategories.filter(
        (c) => this.contextService.contextMatchesRules(c.when)
      ).length;
      this.container.classList.toggle(
        "someWalkthroughsHidden",
        !!someWalkthroughsHidden
      );
      this.registerDispatchListeners();
      allWalkthroughsHiddenContext.bindTo(this.contextService).set(gettingStartedList.itemCount === 0);
      this.updateCategoryProgress();
    });
    gettingStartedList.setEntries(this.gettingStartedCategories);
    allWalkthroughsHiddenContext.bindTo(this.contextService).set(gettingStartedList.itemCount === 0);
    return gettingStartedList;
  }
  layout(size) {
    this.detailsScrollbar?.scanDomNode();
    this.categoriesPageScrollbar?.scanDomNode();
    this.detailsPageScrollbar?.scanDomNode();
    this.startList?.layout(size);
    this.gettingStartedList?.layout(size);
    this.recentlyOpenedList?.layout(size);
    if (this.editorInput?.selectedStep && this.currentMediaType) {
      this.mediaDisposables.clear();
      this.stepDisposables.clear();
      this.buildMediaComponent(this.editorInput.selectedStep);
    }
    this.layoutMarkdown?.();
    this.container.classList.toggle(
      "height-constrained",
      size.height <= 600
    );
    this.container.classList.toggle("width-constrained", size.width <= 400);
    this.container.classList.toggle(
      "width-semi-constrained",
      size.width <= 800
    );
    this.categoriesPageScrollbar?.scanDomNode();
    this.detailsPageScrollbar?.scanDomNode();
    this.detailsScrollbar?.scanDomNode();
  }
  updateCategoryProgress() {
    this.window.document.querySelectorAll(".category-progress").forEach((element) => {
      const categoryID = element.getAttribute("x-data-category-id");
      const category = this.gettingStartedCategories.find(
        (category2) => category2.id === categoryID
      );
      if (!category) {
        throw Error(
          "Could not find category with ID " + categoryID
        );
      }
      const stats = this.getWalkthroughCompletionStats(category);
      const bar = assertIsDefined(
        element.querySelector(".progress-bar-inner")
      );
      bar.setAttribute("aria-valuemin", "0");
      bar.setAttribute("aria-valuenow", "" + stats.stepsComplete);
      bar.setAttribute("aria-valuemax", "" + stats.stepsTotal);
      const progress = stats.stepsComplete / stats.stepsTotal * 100;
      bar.style.width = `${progress}%`;
      element.parentElement.classList.toggle(
        "no-progress",
        stats.stepsComplete === 0
      );
      if (stats.stepsTotal === stats.stepsComplete) {
        bar.title = localize(
          "gettingStarted.allStepsComplete",
          "All {0} steps complete!",
          stats.stepsComplete
        );
      } else {
        bar.title = localize(
          "gettingStarted.someStepsComplete",
          "{0} of {1} steps complete",
          stats.stepsComplete,
          stats.stepsTotal
        );
      }
    });
  }
  async scrollToCategory(categoryID, stepId) {
    if (!this.gettingStartedCategories.some((c) => c.id === categoryID)) {
      this.gettingStartedCategories = this.gettingStartedService.getWalkthroughs();
    }
    const ourCategory = this.gettingStartedCategories.find(
      (c) => c.id === categoryID
    );
    if (!ourCategory) {
      throw Error("Could not find category with ID: " + categoryID);
    }
    this.inProgressScroll = this.inProgressScroll.then(async () => {
      reset(this.stepsContent);
      this.editorInput.selectedCategory = categoryID;
      this.editorInput.selectedStep = stepId;
      this.currentWalkthrough = ourCategory;
      this.buildCategorySlide(categoryID, stepId);
      this.setSlide("details");
    });
  }
  iconWidgetFor(category) {
    const widget = category.icon.type === "icon" ? $(ThemeIcon.asCSSSelector(category.icon.icon)) : $("img.category-icon", { src: category.icon.path });
    widget.classList.add("icon-widget");
    return widget;
  }
  focusSideEditorGroup() {
    const fullSize = this.groupsService.getPart(
      this.group
    ).contentDimension;
    if (!fullSize || fullSize.width <= 700) {
      return;
    }
    if (this.groupsService.count === 1) {
      const sideGroup = this.groupsService.addGroup(
        this.groupsService.groups[0],
        GroupDirection.RIGHT
      );
      this.groupsService.activateGroup(sideGroup);
      const gettingStartedSize = Math.floor(fullSize.width / 2);
      const gettingStartedGroup = this.groupsService.getGroups(GroupsOrder.MOST_RECENTLY_ACTIVE).find(
        (group) => group.activeEditor instanceof GettingStartedInput
      );
      this.groupsService.setSize(assertIsDefined(gettingStartedGroup), {
        width: gettingStartedSize,
        height: fullSize.height
      });
    }
    const nonGettingStartedGroup = this.groupsService.getGroups(GroupsOrder.MOST_RECENTLY_ACTIVE).find(
      (group) => !(group.activeEditor instanceof GettingStartedInput)
    );
    if (nonGettingStartedGroup) {
      this.groupsService.activateGroup(nonGettingStartedGroup);
      nonGettingStartedGroup.focus();
    }
  }
  runStepCommand(href) {
    const isCommand = href.startsWith("command:");
    const toSide = href.startsWith("command:toSide:");
    const command = href.replace(/command:(toSide:)?/, "command:");
    this.telemetryService.publicLog2("gettingStarted.ActionExecuted", {
      command: "runStepAction",
      argument: href,
      walkthroughId: this.currentWalkthrough?.id
    });
    if (toSide) {
      this.focusSideEditorGroup();
    }
    if (isCommand) {
      const commandURI = URI.parse(command);
      let args = [];
      try {
        args = parse(decodeURIComponent(commandURI.query));
      } catch {
        try {
          args = parse(commandURI.query);
        } catch {
        }
      }
      if (!Array.isArray(args)) {
        args = [args];
      }
      if ((commandURI.path === OpenFileFolderAction.ID.toString() || commandURI.path === OpenFolderAction.ID.toString()) && this.workspaceContextService.getWorkspace().folders.length === 0) {
        const selectedStepIndex = this.currentWalkthrough?.steps.findIndex(
          (step) => step.id === this.editorInput.selectedStep
        );
        if (selectedStepIndex !== void 0 && selectedStepIndex > -1 && this.currentWalkthrough?.steps.slice(selectedStepIndex + 1).some((step) => !step.done)) {
          const restoreData = {
            folder: UNKNOWN_EMPTY_WINDOW_WORKSPACE.id,
            category: this.editorInput.selectedCategory,
            step: this.editorInput.selectedStep
          };
          this.storageService.store(
            restoreWalkthroughsConfigurationKey,
            JSON.stringify(restoreData),
            StorageScope.PROFILE,
            StorageTarget.MACHINE
          );
        }
      }
      this.commandService.executeCommand(commandURI.path, ...args).then((result) => {
        const toOpen = result?.openFolder;
        if (toOpen) {
          if (!URI.isUri(toOpen)) {
            console.warn(
              "Warn: Running walkthrough command",
              href,
              "yielded non-URI `openFolder` result",
              toOpen,
              ". It will be disregarded."
            );
            return;
          }
          const restoreData = {
            folder: toOpen.toString(),
            category: this.editorInput.selectedCategory,
            step: this.editorInput.selectedStep
          };
          this.storageService.store(
            restoreWalkthroughsConfigurationKey,
            JSON.stringify(restoreData),
            StorageScope.PROFILE,
            StorageTarget.MACHINE
          );
          this.hostService.openWindow([{ folderUri: toOpen }]);
        }
      });
    } else {
      this.openerService.open(command, { allowCommands: true });
    }
    if (!isCommand && (href.startsWith("https://") || href.startsWith("http://"))) {
      this.gettingStartedService.progressByEvent("onLink:" + href);
    }
  }
  buildMarkdownDescription(container, text) {
    while (container.firstChild) {
      container.firstChild.remove();
    }
    for (const linkedText of text) {
      if (linkedText.nodes.length === 1 && typeof linkedText.nodes[0] !== "string") {
        const node = linkedText.nodes[0];
        const buttonContainer = append(
          container,
          $(".button-container")
        );
        const button = new Button(buttonContainer, {
          title: node.title,
          supportIcons: true,
          ...defaultButtonStyles
        });
        const isCommand = node.href.startsWith("command:");
        const command = node.href.replace(
          /command:(toSide:)?/,
          "command:"
        );
        button.label = node.label;
        button.onDidClick(
          (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.runStepCommand(node.href);
          },
          null,
          this.detailsPageDisposables
        );
        if (isCommand) {
          const keybindingLabel = this.getKeybindingLabel(command);
          if (keybindingLabel) {
            container.appendChild(
              $(
                "span.shortcut-message",
                {},
                localize(
                  "gettingStarted.keyboardTip",
                  "Tip: Use keyboard shortcut "
                ),
                $("span.keybinding", {}, keybindingLabel)
              )
            );
          }
        }
        this.detailsPageDisposables.add(button);
      } else {
        const p = append(container, $("p"));
        for (const node of linkedText.nodes) {
          if (typeof node === "string") {
            const labelWithIcon = renderLabelWithIcons(node);
            for (const element of labelWithIcon) {
              if (typeof element === "string") {
                p.appendChild(
                  renderFormattedText(element, {
                    inline: true,
                    renderCodeSegments: true
                  })
                );
              } else {
                p.appendChild(element);
              }
            }
          } else {
            const link = this.instantiationService.createInstance(
              Link,
              p,
              node,
              { opener: /* @__PURE__ */ __name((href) => this.runStepCommand(href), "opener") }
            );
            this.detailsPageDisposables.add(link);
          }
        }
      }
    }
    return container;
  }
  clearInput() {
    this.stepDisposables.clear();
    super.clearInput();
  }
  buildCategorySlide(categoryID, selectedStep) {
    if (this.detailsScrollbar) {
      this.detailsScrollbar.dispose();
    }
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      this.extensionService.activateByEvent(
        `onWalkthrough:${categoryID.replace(/[^#]+#/, "")}`
      );
    });
    this.detailsPageDisposables.clear();
    this.mediaDisposables.clear();
    const category = this.gettingStartedCategories.find(
      (category2) => category2.id === categoryID
    );
    if (!category) {
      throw Error("could not find category with ID " + categoryID);
    }
    const descriptionContainer = $(
      ".category-description.description.max-lines-3",
      { "x-category-description-for": category.id }
    );
    this.buildMarkdownDescription(
      descriptionContainer,
      parseDescription(category.description)
    );
    const categoryDescriptorComponent = $(
      ".getting-started-category",
      {},
      $(
        ".category-description-container",
        {},
        $(
          "h2.category-title.max-lines-3",
          { "x-category-title-for": category.id },
          ...renderLabelWithIcons(category.title)
        ),
        descriptionContainer
      )
    );
    const stepListContainer = $(".step-list-container");
    this.detailsPageDisposables.add(
      addDisposableListener(stepListContainer, "keydown", (e) => {
        const event = new StandardKeyboardEvent(e);
        const currentStepIndex = /* @__PURE__ */ __name(() => category.steps.findIndex(
          (e2) => e2.id === this.editorInput.selectedStep
        ), "currentStepIndex");
        if (event.keyCode === KeyCode.UpArrow) {
          const toExpand2 = category.steps.filter(
            (step, index) => index < currentStepIndex() && this.contextService.contextMatchesRules(step.when)
          );
          if (toExpand2.length) {
            this.selectStep(
              toExpand2[toExpand2.length - 1].id,
              false
            );
          }
        }
        if (event.keyCode === KeyCode.DownArrow) {
          const toExpand2 = category.steps.find(
            (step, index) => index > currentStepIndex() && this.contextService.contextMatchesRules(step.when)
          );
          if (toExpand2) {
            this.selectStep(toExpand2.id, false);
          }
        }
      })
    );
    let renderedSteps;
    const contextKeysToWatch = new Set(
      category.steps.flatMap((step) => step.when.keys())
    );
    const buildStepList = /* @__PURE__ */ __name(() => {
      category.steps.sort((a, b) => a.order - b.order);
      const toRender = category.steps.filter(
        (step) => this.contextService.contextMatchesRules(step.when)
      );
      if (equals(renderedSteps, toRender, (a, b) => a.id === b.id)) {
        return;
      }
      renderedSteps = toRender;
      reset(
        stepListContainer,
        ...renderedSteps.map((step) => {
          const codicon = $(
            ".codicon" + (step.done ? ".complete" + ThemeIcon.asCSSSelector(
              gettingStartedCheckedCodicon
            ) : ThemeIcon.asCSSSelector(
              gettingStartedUncheckedCodicon
            )),
            {
              "data-done-step-id": step.id,
              "x-dispatch": "toggleStepCompletion:" + step.id,
              role: "checkbox",
              tabindex: "0",
              "aria-checked": step.done ? "true" : "false"
            }
          );
          const container = $(".step-description-container", {
            "x-step-description-for": step.id
          });
          this.buildMarkdownDescription(container, step.description);
          const stepTitle = $("h3.step-title.max-lines-3", {
            "x-step-title-for": step.id
          });
          reset(stepTitle, ...renderLabelWithIcons(step.title));
          const stepDescription = $(
            ".step-container",
            {},
            stepTitle,
            container
          );
          if (step.media.type === "image") {
            stepDescription.appendChild(
              $(".image-description", {
                "aria-label": localize(
                  "imageShowing",
                  "Image showing {0}",
                  step.media.altText
                )
              })
            );
          }
          return $(
            "button.getting-started-step",
            {
              "x-dispatch": "selectTask:" + step.id,
              "data-step-id": step.id,
              "aria-expanded": "false",
              "aria-checked": step.done ? "true" : "false",
              role: "button"
            },
            codicon,
            stepDescription
          );
        })
      );
    }, "buildStepList");
    buildStepList();
    this.detailsPageDisposables.add(
      this.contextService.onDidChangeContext((e) => {
        if (e.affectsSome(contextKeysToWatch)) {
          buildStepList();
          this.registerDispatchListeners();
          this.selectStep(this.editorInput.selectedStep, false);
        }
      })
    );
    const showNextCategory = this.gettingStartedCategories.find(
      (_category) => _category.id === category.next
    );
    const stepsContainer = $(
      ".getting-started-detail-container",
      { role: "list" },
      stepListContainer,
      $(
        ".done-next-container",
        {},
        $(
          "button.button-link.all-done",
          { "x-dispatch": "allDone" },
          $("span.codicon.codicon-check-all"),
          localize("allDone", "Mark Done")
        ),
        ...showNextCategory ? [
          $(
            "button.button-link.next",
            { "x-dispatch": "nextSection" },
            localize("nextOne", "Next Section"),
            $("span.codicon.codicon-arrow-right")
          )
        ] : []
      )
    );
    this.detailsScrollbar = this._register(
      new DomScrollableElement(stepsContainer, {
        className: "steps-container"
      })
    );
    const stepListComponent = this.detailsScrollbar.getDomNode();
    const categoryFooter = $(".getting-started-footer");
    if (this.editorInput.showTelemetryNotice && getTelemetryLevel(this.configurationService) !== TelemetryLevel.NONE && this.productService.enableTelemetry) {
      this.buildTelemetryFooter(categoryFooter);
    }
    reset(
      this.stepsContent,
      categoryDescriptorComponent,
      stepListComponent,
      this.stepMediaComponent,
      categoryFooter
    );
    const toExpand = category.steps.find(
      (step) => this.contextService.contextMatchesRules(step.when) && !step.done
    ) ?? category.steps[0];
    this.selectStep(selectedStep ?? toExpand.id, !selectedStep);
    this.detailsScrollbar.scanDomNode();
    this.detailsPageScrollbar?.scanDomNode();
    this.registerDispatchListeners();
  }
  buildTelemetryFooter(parent) {
    const mdRenderer = this.instantiationService.createInstance(
      MarkdownRenderer,
      {}
    );
    const privacyStatementCopy = localize(
      "privacy statement",
      "privacy statement"
    );
    const privacyStatementButton = `[${privacyStatementCopy}](command:workbench.action.openPrivacyStatementUrl)`;
    const optOutCopy = localize("optOut", "opt out");
    const optOutButton = `[${optOutCopy}](command:settings.filterByTelemetry)`;
    const text = localize(
      {
        key: "footer",
        comment: [
          'fist substitution is "vs code", second is "privacy statement", third is "opt out".'
        ]
      },
      "{0} collects usage data. Read our {1} and learn how to {2}.",
      this.productService.nameShort,
      privacyStatementButton,
      optOutButton
    );
    parent.append(
      mdRenderer.render({ value: text, isTrusted: true }).element
    );
    mdRenderer.dispose();
  }
  getKeybindingLabel(command) {
    command = command.replace(/^command:/, "");
    const label = this.keybindingService.lookupKeybinding(command)?.getLabel();
    if (label) {
      return `(${label})`;
    } else {
      return "";
    }
  }
  async scrollPrev() {
    this.inProgressScroll = this.inProgressScroll.then(async () => {
      this.currentWalkthrough = void 0;
      this.editorInput.selectedCategory = void 0;
      this.editorInput.selectedStep = void 0;
      this.editorInput.showTelemetryNotice = false;
      if (this.gettingStartedCategories.length !== this.gettingStartedList?.itemCount) {
        this.buildCategoriesSlide();
      }
      this.selectStep(void 0);
      this.setSlide("categories");
      this.container.focus();
    });
  }
  runSkip() {
    this.commandService.executeCommand(
      "workbench.action.closeActiveEditor"
    );
  }
  escape() {
    if (this.editorInput.selectedCategory) {
      this.scrollPrev();
    } else {
      this.runSkip();
    }
  }
  setSlide(toEnable) {
    const slideManager = assertIsDefined(
      this.container.querySelector(".gettingStarted")
    );
    if (toEnable === "categories") {
      slideManager.classList.remove("showDetails");
      slideManager.classList.add("showCategories");
      this.container.querySelector(
        ".prev-button.button-link"
      ).style.display = "none";
      this.container.querySelector(".gettingStartedSlideDetails").querySelectorAll("button").forEach((button) => button.disabled = true);
      this.container.querySelector(".gettingStartedSlideCategories").querySelectorAll("button").forEach((button) => button.disabled = false);
      this.container.querySelector(".gettingStartedSlideCategories").querySelectorAll("input").forEach((button) => button.disabled = false);
    } else {
      slideManager.classList.add("showDetails");
      slideManager.classList.remove("showCategories");
      this.container.querySelector(
        ".prev-button.button-link"
      ).style.display = "block";
      this.container.querySelector(".gettingStartedSlideDetails").querySelectorAll("button").forEach((button) => button.disabled = false);
      this.container.querySelector(".gettingStartedSlideCategories").querySelectorAll("button").forEach((button) => button.disabled = true);
      this.container.querySelector(".gettingStartedSlideCategories").querySelectorAll("input").forEach((button) => button.disabled = true);
    }
  }
  focus() {
    super.focus();
    const active = this.container.ownerDocument.activeElement;
    let parent = this.container.parentElement;
    while (parent && parent !== active) {
      parent = parent.parentElement;
    }
    if (parent) {
      this.container.focus();
    }
  }
};
GettingStartedPage = __decorateClass([
  __decorateParam(1, ICommandService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IWalkthroughsService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ITelemetryService),
  __decorateParam(7, ILanguageService),
  __decorateParam(8, IFileService),
  __decorateParam(9, IOpenerService),
  __decorateParam(10, IWorkbenchThemeService),
  __decorateParam(11, IStorageService),
  __decorateParam(12, IExtensionService),
  __decorateParam(13, IInstantiationService),
  __decorateParam(14, INotificationService),
  __decorateParam(15, IEditorGroupsService),
  __decorateParam(16, IContextKeyService),
  __decorateParam(17, IQuickInputService),
  __decorateParam(18, IWorkspacesService),
  __decorateParam(19, ILabelService),
  __decorateParam(20, IHostService),
  __decorateParam(21, IWebviewService),
  __decorateParam(22, IWorkspaceContextService),
  __decorateParam(23, IAccessibilityService)
], GettingStartedPage);
class GettingStartedInputSerializer {
  static {
    __name(this, "GettingStartedInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return JSON.stringify({
      selectedCategory: editorInput.selectedCategory,
      selectedStep: editorInput.selectedStep
    });
  }
  deserialize(instantiationService, serializedEditorInput) {
    try {
      const { selectedCategory, selectedStep } = JSON.parse(
        serializedEditorInput
      );
      return new GettingStartedInput({ selectedCategory, selectedStep });
    } catch {
    }
    return new GettingStartedInput({});
  }
}
export {
  GettingStartedInputSerializer,
  GettingStartedPage,
  allWalkthroughsHiddenContext,
  inWelcomeContext
};
//# sourceMappingURL=gettingStarted.js.map
