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
import "./media/userDataProfilesEditor.css";
import {
  $,
  Dimension,
  EventHelper,
  EventType,
  addDisposableListener,
  append,
  clearNode,
  trackFocus
} from "../../../../base/browser/dom.js";
import { StandardKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { renderMarkdown } from "../../../../base/browser/markdownRenderer.js";
import {
  Button,
  ButtonWithDropdown
} from "../../../../base/browser/ui/button/button.js";
import { createInstantHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { HoverPosition } from "../../../../base/browser/ui/hover/hoverWidget.js";
import {
  InputBox,
  MessageType
} from "../../../../base/browser/ui/inputbox/inputBox.js";
import {
  CachedListVirtualDelegate
} from "../../../../base/browser/ui/list/list.js";
import { Radio } from "../../../../base/browser/ui/radio/radio.js";
import {
  SelectBox
} from "../../../../base/browser/ui/selectBox/selectBox.js";
import {
  Orientation,
  Sizing,
  SplitView
} from "../../../../base/browser/ui/splitview/splitview.js";
import { Checkbox } from "../../../../base/browser/ui/toggle/toggle.js";
import { RenderIndentGuides } from "../../../../base/browser/ui/tree/abstractTree.js";
import {
  Action,
  Separator,
  SubmenuAction
} from "../../../../base/common/actions.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { basename } from "../../../../base/common/resources.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { isString, isUndefined } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { WorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import {
  IContextMenuService,
  IContextViewService
} from "../../../../platform/contextview/browser/contextView.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import {
  IHoverService,
  WorkbenchHoverDelegate
} from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  WorkbenchAsyncDataTree,
  WorkbenchList
} from "../../../../platform/list/browser/listService.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  defaultButtonStyles,
  defaultCheckboxStyles,
  defaultInputBoxStyles,
  defaultSelectBoxStyles,
  getInputBoxStyle,
  getListStyles
} from "../../../../platform/theme/browser/defaultStyles.js";
import {
  editorBackground,
  foreground,
  registerColor
} from "../../../../platform/theme/common/colorRegistry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  IUserDataProfilesService,
  ProfileResourceType
} from "../../../../platform/userDataProfile/common/userDataProfile.js";
import {
  DEFAULT_LABELS_CONTAINER,
  ResourceLabels
} from "../../../browser/labels.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { PANEL_BORDER } from "../../../common/theme.js";
import { WorkbenchIconSelectBox } from "../../../services/userDataProfile/browser/iconSelectBox.js";
import {
  IUserDataProfileService,
  PROFILE_FILTER,
  defaultUserDataProfileIcon
} from "../../../services/userDataProfile/common/userDataProfile.js";
import {
  DEFAULT_ICON,
  ICONS
} from "../../../services/userDataProfile/common/userDataProfileIcons.js";
import { settingsTextInputBorder } from "../../preferences/common/settingsEditorColorRegistry.js";
import {
  AbstractUserDataProfileElement,
  NewProfileElement,
  UserDataProfileElement,
  UserDataProfilesEditorModel,
  isProfileResourceChildElement,
  isProfileResourceTypeElement
} from "./userDataProfilesEditorModel.js";
const profilesSashBorder = registerColor(
  "profiles.sashBorder",
  PANEL_BORDER,
  localize(
    "profilesSashBorder",
    "The color of the Profiles editor splitview sash border."
  )
);
const listStyles = getListStyles({
  listActiveSelectionBackground: editorBackground,
  listActiveSelectionForeground: foreground,
  listFocusAndSelectionBackground: editorBackground,
  listFocusAndSelectionForeground: foreground,
  listFocusBackground: editorBackground,
  listFocusForeground: foreground,
  listHoverForeground: foreground,
  listHoverBackground: editorBackground,
  listHoverOutline: editorBackground,
  listFocusOutline: editorBackground,
  listInactiveSelectionBackground: editorBackground,
  listInactiveSelectionForeground: foreground,
  listInactiveFocusBackground: editorBackground,
  listInactiveFocusOutline: editorBackground,
  treeIndentGuidesStroke: void 0,
  treeInactiveIndentGuidesStroke: void 0
});
let UserDataProfilesEditor = class extends EditorPane {
  constructor(group, telemetryService, themeService, storageService, quickInputService, fileDialogService, contextMenuService, instantiationService) {
    super(
      UserDataProfilesEditor.ID,
      group,
      telemetryService,
      themeService,
      storageService
    );
    this.quickInputService = quickInputService;
    this.fileDialogService = fileDialogService;
    this.contextMenuService = contextMenuService;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "UserDataProfilesEditor");
  }
  static ID = "workbench.editor.userDataProfiles";
  container;
  splitView;
  profilesList;
  profileWidget;
  model;
  templates = [];
  layout(dimension, position) {
    if (this.container && this.splitView) {
      const height = dimension.height - 20;
      this.splitView.layout(this.container?.clientWidth, height);
      this.splitView.el.style.height = `${height}px`;
    }
  }
  createEditor(parent) {
    this.container = append(parent, $(".profiles-editor"));
    const sidebarView = append(this.container, $(".sidebar-view"));
    const sidebarContainer = append(sidebarView, $(".sidebar-container"));
    const contentsView = append(this.container, $(".contents-view"));
    const contentsContainer = append(
      contentsView,
      $(".contents-container")
    );
    this.profileWidget = this._register(
      this.instantiationService.createInstance(
        ProfileWidget,
        contentsContainer
      )
    );
    this.splitView = new SplitView(this.container, {
      orientation: Orientation.HORIZONTAL,
      proportionalLayout: true
    });
    this.renderSidebar(sidebarContainer);
    this.splitView.addView(
      {
        onDidChange: Event.None,
        element: sidebarView,
        minimumSize: 200,
        maximumSize: 350,
        layout: /* @__PURE__ */ __name((width, _, height) => {
          sidebarView.style.width = `${width}px`;
          if (height && this.profilesList) {
            const listHeight = height - 40 - 15;
            this.profilesList.getHTMLElement().style.height = `${listHeight}px`;
            this.profilesList.layout(listHeight, width);
          }
        }, "layout")
      },
      300,
      void 0,
      true
    );
    this.splitView.addView(
      {
        onDidChange: Event.None,
        element: contentsView,
        minimumSize: 550,
        maximumSize: Number.POSITIVE_INFINITY,
        layout: /* @__PURE__ */ __name((width, _, height) => {
          contentsView.style.width = `${width}px`;
          if (height) {
            this.profileWidget?.layout(
              new Dimension(width, height)
            );
          }
        }, "layout")
      },
      Sizing.Distribute,
      void 0,
      true
    );
    this.registerListeners();
    this.updateStyles();
  }
  updateStyles() {
    const borderColor = this.theme.getColor(profilesSashBorder);
    this.splitView?.style({ separatorBorder: borderColor });
  }
  renderSidebar(parent) {
    this.renderNewProfileButton(append(parent, $(".new-profile-button")));
    const renderer = this.instantiationService.createInstance(
      ProfileElementRenderer
    );
    const delegate = new ProfileElementDelegate();
    this.profilesList = this._register(
      this.instantiationService.createInstance(
        WorkbenchList,
        "ProfilesList",
        append(parent, $(".profiles-list")),
        delegate,
        [renderer],
        {
          multipleSelectionSupport: false,
          setRowLineHeight: false,
          horizontalScrolling: false,
          accessibilityProvider: {
            getAriaLabel(profileElement) {
              return profileElement?.name ?? "";
            },
            getWidgetAriaLabel() {
              return localize("profiles", "Profiles");
            }
          },
          openOnSingleClick: true,
          identityProvider: {
            getId(e) {
              if (e instanceof UserDataProfileElement) {
                return e.profile.id;
              }
              return e.name;
            }
          },
          alwaysConsumeMouseWheel: false
        }
      )
    );
  }
  renderNewProfileButton(parent) {
    const button = this._register(
      new ButtonWithDropdown(parent, {
        actions: {
          getActions: /* @__PURE__ */ __name(() => {
            const actions = [];
            if (this.templates.length) {
              actions.push(
                new SubmenuAction(
                  "from.template",
                  localize("from template", "From Template"),
                  this.getCreateFromTemplateActions()
                )
              );
              actions.push(new Separator());
            }
            actions.push(
              new Action(
                "importProfile",
                localize("importProfile", "Import Profile..."),
                void 0,
                true,
                () => this.importProfile()
              )
            );
            return actions;
          }, "getActions")
        },
        addPrimaryActionToDropdown: false,
        contextMenuProvider: this.contextMenuService,
        supportIcons: true,
        ...defaultButtonStyles
      })
    );
    button.label = localize("newProfile", "New Profile");
    this._register(button.onDidClick((e) => this.createNewProfile()));
  }
  getCreateFromTemplateActions() {
    return this.templates.map(
      (template) => new Action(
        `template:${template.url}`,
        template.name,
        void 0,
        true,
        () => this.createNewProfile(URI.parse(template.url))
      )
    );
  }
  registerListeners() {
    if (this.profilesList) {
      this._register(
        this.profilesList.onDidChangeSelection((e) => {
          const [element] = e.elements;
          if (element instanceof AbstractUserDataProfileElement) {
            this.profileWidget?.render(element);
          }
        })
      );
      this._register(
        this.profilesList.onContextMenu((e) => {
          const actions = [];
          if (!e.element) {
            actions.push(...this.getTreeContextMenuActions());
          }
          if (e.element instanceof AbstractUserDataProfileElement) {
            actions.push(...e.element.actions[1]);
          }
          if (actions.length) {
            this.contextMenuService.showContextMenu({
              getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
              getActions: /* @__PURE__ */ __name(() => actions, "getActions"),
              getActionsContext: /* @__PURE__ */ __name(() => e.element, "getActionsContext")
            });
          }
        })
      );
      this._register(
        this.profilesList.onMouseDblClick((e) => {
          if (!e.element) {
            this.createNewProfile();
          }
        })
      );
    }
  }
  getTreeContextMenuActions() {
    const actions = [];
    actions.push(
      new Action(
        "newProfile",
        localize("newProfile", "New Profile"),
        void 0,
        true,
        () => this.createNewProfile()
      )
    );
    const templateActions = this.getCreateFromTemplateActions();
    if (templateActions.length) {
      actions.push(
        new SubmenuAction(
          "from.template",
          localize("new from template", "New Profile From Template"),
          templateActions
        )
      );
    }
    actions.push(new Separator());
    actions.push(
      new Action(
        "importProfile",
        localize("importProfile", "Import Profile..."),
        void 0,
        true,
        () => this.importProfile()
      )
    );
    return actions;
  }
  async importProfile() {
    const disposables = new DisposableStore();
    const quickPick = disposables.add(
      this.quickInputService.createQuickPick()
    );
    const updateQuickPickItems = /* @__PURE__ */ __name((value) => {
      const quickPickItems = [];
      if (value) {
        quickPickItems.push({
          label: quickPick.value,
          description: localize("import from url", "Import from URL")
        });
      }
      quickPickItems.push({
        label: localize("import from file", "Select File...")
      });
      quickPick.items = quickPickItems;
    }, "updateQuickPickItems");
    quickPick.title = localize(
      "import profile quick pick title",
      "Import from Profile Template..."
    );
    quickPick.placeholder = localize(
      "import profile placeholder",
      "Provide Profile Template URL"
    );
    quickPick.ignoreFocusOut = true;
    disposables.add(quickPick.onDidChangeValue(updateQuickPickItems));
    updateQuickPickItems();
    quickPick.matchOnLabel = false;
    quickPick.matchOnDescription = false;
    disposables.add(
      quickPick.onDidAccept(async () => {
        quickPick.hide();
        const selectedItem = quickPick.selectedItems[0];
        if (!selectedItem) {
          return;
        }
        const url = selectedItem.label === quickPick.value ? URI.parse(quickPick.value) : await this.getProfileUriFromFileSystem();
        if (url) {
          this.createNewProfile(url);
        }
      })
    );
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    quickPick.show();
  }
  async createNewProfile(copyFrom) {
    await this.model?.createNewProfile(copyFrom);
  }
  selectProfile(profile) {
    const index = this.model?.profiles.findIndex(
      (p) => p instanceof UserDataProfileElement && p.profile.id === profile.id
    );
    if (index !== void 0 && index >= 0) {
      this.profilesList?.setSelection([index]);
    }
  }
  async getProfileUriFromFileSystem() {
    const profileLocation = await this.fileDialogService.showOpenDialog({
      canSelectFolders: false,
      canSelectFiles: true,
      canSelectMany: false,
      filters: PROFILE_FILTER,
      title: localize(
        "import profile dialog",
        "Select Profile Template File"
      )
    });
    if (!profileLocation) {
      return null;
    }
    return profileLocation[0];
  }
  async setInput(input, options, context, token) {
    await super.setInput(input, options, context, token);
    this.model = await input.resolve();
    this.model.getTemplates().then((templates) => {
      this.templates = templates;
      if (this.profileWidget) {
        this.profileWidget.templates = templates;
      }
    });
    this.updateProfilesList();
    this._register(
      this.model.onDidChange(
        (element) => this.updateProfilesList(element)
      )
    );
  }
  focus() {
    super.focus();
    this.profilesList?.domFocus();
  }
  updateProfilesList(elementToSelect) {
    if (!this.model) {
      return;
    }
    const currentSelectionIndex = this.profilesList?.getSelection()?.[0];
    const currentSelection = currentSelectionIndex !== void 0 ? this.profilesList?.element(currentSelectionIndex) : void 0;
    this.profilesList?.splice(
      0,
      this.profilesList.length,
      this.model.profiles
    );
    if (elementToSelect) {
      this.profilesList?.setSelection([
        this.model.profiles.indexOf(elementToSelect)
      ]);
    } else if (currentSelection) {
      if (!this.model.profiles.includes(currentSelection)) {
        const elementToSelect2 = this.model.profiles.find(
          (profile) => profile.name === currentSelection.name
        ) ?? this.model.profiles[0];
        if (elementToSelect2) {
          this.profilesList?.setSelection([
            this.model.profiles.indexOf(elementToSelect2)
          ]);
        }
      }
    } else {
      const elementToSelect2 = this.model.profiles.find((profile) => profile.active) ?? this.model.profiles[0];
      if (elementToSelect2) {
        this.profilesList?.setSelection([
          this.model.profiles.indexOf(elementToSelect2)
        ]);
      }
    }
  }
};
UserDataProfilesEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IFileDialogService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IInstantiationService)
], UserDataProfilesEditor);
class ProfileElementDelegate {
  static {
    __name(this, "ProfileElementDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId() {
    return "profileListElement";
  }
}
let ProfileElementRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "ProfileElementRenderer");
  }
  templateId = "profileListElement";
  renderTemplate(container) {
    const disposables = new DisposableStore();
    const elementDisposables = new DisposableStore();
    container.classList.add("profile-list-item");
    const icon = append(container, $(".profile-list-item-icon"));
    const label = append(container, $(".profile-list-item-label"));
    const dirty = append(
      container,
      $(`span${ThemeIcon.asCSSSelector(Codicon.circleFilled)}`)
    );
    const description = append(
      container,
      $(".profile-list-item-description")
    );
    append(
      description,
      $(`span${ThemeIcon.asCSSSelector(Codicon.check)}`),
      $("span", void 0, localize("activeProfile", "In use"))
    );
    const actionsContainer = append(
      container,
      $(".profile-tree-item-actions-container")
    );
    const actionBar = disposables.add(
      this.instantiationService.createInstance(
        WorkbenchToolBar,
        actionsContainer,
        {
          hoverDelegate: disposables.add(
            createInstantHoverDelegate()
          ),
          highlightToggledItems: true
        }
      )
    );
    return {
      label,
      icon,
      dirty,
      description,
      actionBar,
      disposables,
      elementDisposables
    };
  }
  renderElement(element, index, templateData, height) {
    templateData.elementDisposables.clear();
    templateData.label.textContent = element.name;
    templateData.label.classList.toggle(
      "new-profile",
      element instanceof NewProfileElement
    );
    templateData.icon.className = ThemeIcon.asClassName(
      element.icon ? ThemeIcon.fromId(element.icon) : DEFAULT_ICON
    );
    templateData.dirty.classList.toggle(
      "hide",
      !(element instanceof NewProfileElement)
    );
    templateData.description.classList.toggle("hide", !element.active);
    if (element.onDidChange) {
      templateData.elementDisposables.add(
        element.onDidChange((e) => {
          if (e.name) {
            templateData.label.textContent = element.name;
          }
          if (e.icon) {
            if (element.icon) {
              templateData.icon.className = ThemeIcon.asClassName(
                ThemeIcon.fromId(element.icon)
              );
            } else {
              templateData.icon.className = "hide";
            }
          }
          if (e.active) {
            templateData.description.classList.toggle(
              "hide",
              !element.active
            );
          }
        })
      );
    }
    templateData.actionBar.setActions(
      [...element.actions[0]],
      [...element.actions[1]]
    );
  }
  disposeElement(element, index, templateData, height) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
    templateData.elementDisposables.dispose();
  }
};
ProfileElementRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ProfileElementRenderer);
let ProfileWidget = class extends Disposable {
  constructor(parent, editorProgressService, instantiationService) {
    super();
    this.editorProgressService = editorProgressService;
    this.instantiationService = instantiationService;
    const header = append(parent, $(".profile-header"));
    const title = append(header, $(".profile-title-container"));
    this.profileTitle = append(title, $(""));
    const body = append(parent, $(".profile-body"));
    const delegate = new ProfileTreeDelegate();
    const contentsRenderer = this._register(
      this.instantiationService.createInstance(ContentsProfileRenderer)
    );
    this.copyFromProfileRenderer = this._register(
      this.instantiationService.createInstance(CopyFromProfileRenderer)
    );
    this.profileTreeContainer = append(body, $(".profile-tree"));
    this.profileTree = this._register(
      this.instantiationService.createInstance(
        WorkbenchAsyncDataTree,
        "ProfileEditor-Tree",
        this.profileTreeContainer,
        delegate,
        [
          this._register(
            this.instantiationService.createInstance(
              ProfileNameRenderer
            )
          ),
          this._register(
            this.instantiationService.createInstance(
              ProfileIconRenderer
            )
          ),
          this._register(
            this.instantiationService.createInstance(
              UseForCurrentWindowPropertyRenderer
            )
          ),
          this._register(
            this.instantiationService.createInstance(
              UseAsDefaultProfileRenderer
            )
          ),
          this.copyFromProfileRenderer,
          contentsRenderer
        ],
        this.instantiationService.createInstance(ProfileTreeDataSource),
        {
          multipleSelectionSupport: false,
          horizontalScrolling: false,
          accessibilityProvider: {
            getAriaLabel(element) {
              return element?.element ?? "";
            },
            getWidgetAriaLabel() {
              return "";
            }
          },
          identityProvider: {
            getId(element) {
              return element.element;
            }
          },
          expandOnlyOnTwistieClick: true,
          renderIndentGuides: RenderIndentGuides.None,
          enableStickyScroll: false,
          openOnSingleClick: false,
          setRowLineHeight: false,
          supportDynamicHeights: true,
          alwaysConsumeMouseWheel: false
        }
      )
    );
    this.profileTree.style(listStyles);
    this._register(
      contentsRenderer.onDidChangeContentHeight(
        (e) => this.profileTree.updateElementHeight(e, void 0)
      )
    );
    this._register(
      contentsRenderer.onDidChangeSelection((e) => {
        if (e.selected) {
          this.profileTree.setFocus([]);
          this.profileTree.setSelection([]);
        }
      })
    );
    this._register(
      this.profileTree.onDidChangeContentHeight((e) => {
        if (this.dimension) {
          this.layout(this.dimension);
        }
      })
    );
    this._register(
      this.profileTree.onDidChangeSelection((e) => {
        if (e.elements.length) {
          contentsRenderer.clearSelection();
        }
      })
    );
    this.buttonContainer = append(
      body,
      $(".profile-row-container.profile-button-container")
    );
  }
  static {
    __name(this, "ProfileWidget");
  }
  profileTitle;
  profileTreeContainer;
  buttonContainer;
  profileTree;
  copyFromProfileRenderer;
  _profileElement = this._register(
    new MutableDisposable()
  );
  set templates(templates) {
    this.copyFromProfileRenderer.setTemplates(templates);
    this.profileTree.rerender();
  }
  dimension;
  layout(dimension) {
    this.dimension = dimension;
    const treeContentHeight = this.profileTree.contentHeight;
    const height = Math.min(
      treeContentHeight,
      dimension.height - (this._profileElement.value?.element instanceof NewProfileElement ? 116 : 54)
    );
    this.profileTreeContainer.style.height = `${height}px`;
    this.profileTree.layout(height, dimension.width);
  }
  render(profileElement) {
    if (this._profileElement.value?.element === profileElement) {
      return;
    }
    if (this._profileElement.value?.element instanceof UserDataProfileElement) {
      this._profileElement.value.element.reset();
    }
    this.profileTree.setInput(profileElement);
    const disposables = new DisposableStore();
    this._profileElement.value = {
      element: profileElement,
      dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose")
    };
    this.profileTitle.textContent = profileElement.name;
    disposables.add(
      profileElement.onDidChange((e) => {
        if (e.name) {
          this.profileTitle.textContent = profileElement.name;
        }
      })
    );
    const [primaryTitleButtons, secondatyTitleButtons] = profileElement.titleButtons;
    if (primaryTitleButtons?.length || secondatyTitleButtons?.length) {
      this.buttonContainer.classList.remove("hide");
      if (secondatyTitleButtons?.length) {
        for (const action of secondatyTitleButtons) {
          const button = disposables.add(
            new Button(this.buttonContainer, {
              ...defaultButtonStyles,
              secondary: true
            })
          );
          button.label = action.label;
          button.enabled = action.enabled;
          disposables.add(
            button.onDidClick(
              () => this.editorProgressService.showWhile(action.run())
            )
          );
          disposables.add(
            action.onDidChange((e) => {
              if (!isUndefined(e.enabled)) {
                button.enabled = action.enabled;
              }
              if (!isUndefined(e.label)) {
                button.label = action.label;
              }
            })
          );
        }
      }
      if (primaryTitleButtons?.length) {
        for (const action of primaryTitleButtons) {
          const button = disposables.add(
            new Button(this.buttonContainer, {
              ...defaultButtonStyles
            })
          );
          button.label = action.label;
          button.enabled = action.enabled;
          disposables.add(
            button.onDidClick(
              () => this.editorProgressService.showWhile(action.run())
            )
          );
          disposables.add(
            action.onDidChange((e) => {
              if (!isUndefined(e.enabled)) {
                button.enabled = action.enabled;
              }
              if (!isUndefined(e.label)) {
                button.label = action.label;
              }
            })
          );
          disposables.add(
            profileElement.onDidChange((e) => {
              if (e.message) {
                button.setTitle(
                  profileElement.message ?? action.label
                );
                button.element.classList.toggle(
                  "error",
                  !!profileElement.message
                );
              }
            })
          );
        }
      }
    } else {
      this.buttonContainer.classList.add("hide");
    }
    if (profileElement instanceof NewProfileElement) {
      this.profileTree.focusFirst();
    }
    if (this.dimension) {
      this.layout(this.dimension);
    }
  }
};
ProfileWidget = __decorateClass([
  __decorateParam(1, IEditorProgressService),
  __decorateParam(2, IInstantiationService)
], ProfileWidget);
class ProfileTreeDelegate extends CachedListVirtualDelegate {
  static {
    __name(this, "ProfileTreeDelegate");
  }
  getTemplateId({ element }) {
    return element;
  }
  hasDynamicHeight({ element }) {
    return element === "contents";
  }
  estimateHeight({ element }) {
    switch (element) {
      case "name":
        return 72;
      case "icon":
        return 68;
      case "copyFrom":
        return 90;
      case "useForCurrent":
      case "useAsDefault":
        return 68;
      case "contents":
        return 250;
    }
  }
}
class ProfileTreeDataSource {
  static {
    __name(this, "ProfileTreeDataSource");
  }
  hasChildren(element) {
    return element instanceof AbstractUserDataProfileElement;
  }
  async getChildren(element) {
    if (element instanceof AbstractUserDataProfileElement) {
      const children = [];
      if (element instanceof NewProfileElement) {
        children.push({ element: "name", root: element });
        children.push({ element: "icon", root: element });
        children.push({ element: "copyFrom", root: element });
        children.push({ element: "contents", root: element });
      } else if (element instanceof UserDataProfileElement) {
        if (!element.profile.isDefault) {
          children.push({ element: "name", root: element });
          children.push({ element: "icon", root: element });
        }
        children.push({ element: "useAsDefault", root: element });
        children.push({ element: "contents", root: element });
      }
      return children;
    }
    return [];
  }
}
class ProfileContentTreeElementDelegate {
  static {
    __name(this, "ProfileContentTreeElementDelegate");
  }
  getTemplateId(element) {
    if (!element.element.resourceType) {
      return ProfileResourceChildTreeItemRenderer.TEMPLATE_ID;
    }
    if (element.root instanceof NewProfileElement) {
      return NewProfileResourceTreeRenderer.TEMPLATE_ID;
    }
    return ExistingProfileResourceTreeRenderer.TEMPLATE_ID;
  }
  getHeight(element) {
    return 24;
  }
}
let ProfileResourceTreeDataSource = class {
  constructor(editorProgressService) {
    this.editorProgressService = editorProgressService;
  }
  static {
    __name(this, "ProfileResourceTreeDataSource");
  }
  hasChildren(element) {
    if (element instanceof AbstractUserDataProfileElement) {
      return true;
    }
    if (element.element.resourceType) {
      if (element.element.resourceType !== ProfileResourceType.Extensions && element.element.resourceType !== ProfileResourceType.Snippets) {
        return false;
      }
      if (element.root instanceof NewProfileElement) {
        const resourceType = element.element.resourceType;
        if (element.root.getFlag(resourceType)) {
          return true;
        }
        if (!element.root.hasResource(resourceType)) {
          return false;
        }
        if (element.root.copyFrom === void 0) {
          return false;
        }
        if (!element.root.getCopyFlag(resourceType)) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
  async getChildren(element) {
    if (element instanceof AbstractUserDataProfileElement) {
      const children = await element.getChildren();
      return children.map((e) => ({ element: e, root: element }));
    }
    if (element.element.resourceType) {
      const progressRunner = this.editorProgressService.show(true, 500);
      try {
        const extensions = await element.root.getChildren(
          element.element.resourceType
        );
        return extensions.map((e) => ({
          element: e,
          root: element.root
        }));
      } finally {
        progressRunner.done();
      }
    }
    return [];
  }
};
ProfileResourceTreeDataSource = __decorateClass([
  __decorateParam(0, IEditorProgressService)
], ProfileResourceTreeDataSource);
class AbstractProfileResourceTreeRenderer extends Disposable {
  static {
    __name(this, "AbstractProfileResourceTreeRenderer");
  }
  getResourceTypeTitle(resourceType) {
    switch (resourceType) {
      case ProfileResourceType.Settings:
        return localize("settings", "Settings");
      case ProfileResourceType.Keybindings:
        return localize("keybindings", "Keyboard Shortcuts");
      case ProfileResourceType.Snippets:
        return localize("snippets", "Snippets");
      case ProfileResourceType.Tasks:
        return localize("tasks", "Tasks");
      case ProfileResourceType.Extensions:
        return localize("extensions", "Extensions");
    }
    return "";
  }
  disposeElement(element, index, templateData, height) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
}
class ProfilePropertyRenderer extends AbstractProfileResourceTreeRenderer {
  static {
    __name(this, "ProfilePropertyRenderer");
  }
  renderElement({ element }, index, templateData, height) {
    templateData.elementDisposables.clear();
    templateData.element = element;
  }
}
let ProfileNameRenderer = class extends ProfilePropertyRenderer {
  constructor(userDataProfilesService, contextViewService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.contextViewService = contextViewService;
  }
  static {
    __name(this, "ProfileNameRenderer");
  }
  templateId = "name";
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const nameContainer = append(parent, $(".profile-row-container"));
    append(
      nameContainer,
      $(".profile-label-element", void 0, localize("name", "Name"))
    );
    const nameInput = disposables.add(
      new InputBox(nameContainer, this.contextViewService, {
        inputBoxStyles: getInputBoxStyle({
          inputBorder: settingsTextInputBorder
        }),
        ariaLabel: localize("profileName", "Profile Name"),
        placeholder: localize("profileName", "Profile Name"),
        validationOptions: {
          validation: /* @__PURE__ */ __name((value) => {
            if (!value) {
              return {
                content: localize(
                  "name required",
                  "Profile name is required and must be a non-empty value."
                ),
                type: MessageType.WARNING
              };
            }
            if (profileElement?.root.disabled) {
              return null;
            }
            if (!profileElement?.root.shouldValidateName()) {
              return null;
            }
            const initialName = profileElement?.root.getInitialName();
            value = value.trim();
            if (initialName !== value && this.userDataProfilesService.profiles.some(
              (p) => !p.isTransient && p.name === value
            )) {
              return {
                content: localize(
                  "profileExists",
                  "Profile with name {0} already exists.",
                  value
                ),
                type: MessageType.WARNING
              };
            }
            return null;
          }, "validation")
        }
      })
    );
    nameInput.onDidChange((value) => {
      if (profileElement && value) {
        profileElement.root.name = value;
      }
    });
    const focusTracker = disposables.add(
      trackFocus(nameInput.inputElement)
    );
    disposables.add(
      focusTracker.onDidBlur(() => {
        if (profileElement && !nameInput.value) {
          nameInput.value = profileElement.root.name;
        }
      })
    );
    const renderName = /* @__PURE__ */ __name((profileElement2) => {
      nameInput.value = profileElement2.root.name;
      nameInput.validate();
      if (profileElement2.root.disabled) {
        nameInput.disable();
      } else {
        nameInput.enable();
      }
    }, "renderName");
    return {
      set element(element) {
        profileElement = element;
        renderName(profileElement);
        elementDisposables.add(
          profileElement.root.onDidChange((e) => {
            if (e.name || e.disabled) {
              renderName(element);
            }
            if (e.profile) {
              nameInput.validate();
            }
          })
        );
      },
      disposables,
      elementDisposables
    };
  }
};
ProfileNameRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IContextViewService)
], ProfileNameRenderer);
let ProfileIconRenderer = class extends ProfilePropertyRenderer {
  constructor(instantiationService, hoverService) {
    super();
    this.instantiationService = instantiationService;
    this.hoverService = hoverService;
  }
  static {
    __name(this, "ProfileIconRenderer");
  }
  templateId = "icon";
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const iconContainer = append(parent, $(".profile-row-container"));
    append(
      iconContainer,
      $(
        ".profile-label-element",
        void 0,
        localize("icon-label", "Icon")
      )
    );
    const iconValueContainer = append(
      iconContainer,
      $(".profile-icon-container")
    );
    const iconElement = append(
      iconValueContainer,
      $(`${ThemeIcon.asCSSSelector(DEFAULT_ICON)}`, {
        tabindex: "0",
        role: "button",
        "aria-label": localize("icon", "Profile Icon")
      })
    );
    const iconSelectBox = disposables.add(
      this.instantiationService.createInstance(WorkbenchIconSelectBox, {
        icons: ICONS,
        inputBoxStyles: defaultInputBoxStyles
      })
    );
    let hoverWidget;
    const showIconSelectBox = /* @__PURE__ */ __name(() => {
      if (profileElement?.root instanceof UserDataProfileElement && profileElement.root.profile.isDefault) {
        return;
      }
      if (profileElement?.root.disabled) {
        return;
      }
      iconSelectBox.clearInput();
      hoverWidget = this.hoverService.showHover(
        {
          content: iconSelectBox.domNode,
          target: iconElement,
          position: {
            hoverPosition: HoverPosition.BELOW
          },
          persistence: {
            sticky: true
          },
          appearance: {
            showPointer: true
          }
        },
        true
      );
      if (hoverWidget) {
        iconSelectBox.layout(new Dimension(486, 260));
        iconSelectBox.focus();
      }
    }, "showIconSelectBox");
    disposables.add(
      addDisposableListener(
        iconElement,
        EventType.CLICK,
        (e) => {
          EventHelper.stop(e, true);
          showIconSelectBox();
        }
      )
    );
    disposables.add(
      addDisposableListener(iconElement, EventType.KEY_DOWN, (e) => {
        const event = new StandardKeyboardEvent(e);
        if (event.equals(KeyCode.Enter) || event.equals(KeyCode.Space)) {
          EventHelper.stop(event, true);
          showIconSelectBox();
        }
      })
    );
    disposables.add(
      addDisposableListener(
        iconSelectBox.domNode,
        EventType.KEY_DOWN,
        (e) => {
          const event = new StandardKeyboardEvent(e);
          if (event.equals(KeyCode.Escape)) {
            EventHelper.stop(event, true);
            hoverWidget?.dispose();
            iconElement.focus();
          }
        }
      )
    );
    disposables.add(
      iconSelectBox.onDidSelect((selectedIcon) => {
        hoverWidget?.dispose();
        iconElement.focus();
        if (profileElement) {
          profileElement.root.icon = selectedIcon.id;
        }
      })
    );
    append(
      iconValueContainer,
      $(
        ".profile-description-element",
        void 0,
        localize(
          "icon-description",
          "Profile icon to be shown in the activity bar"
        )
      )
    );
    const renderIcon = /* @__PURE__ */ __name((profileElement2) => {
      if (profileElement2.root.icon) {
        iconElement.className = ThemeIcon.asClassName(
          ThemeIcon.fromId(profileElement2.root.icon)
        );
      } else {
        iconElement.className = ThemeIcon.asClassName(
          ThemeIcon.fromId(DEFAULT_ICON.id)
        );
      }
    }, "renderIcon");
    return {
      set element(element) {
        profileElement = element;
        renderIcon(profileElement);
        elementDisposables.add(
          profileElement.root.onDidChange((e) => {
            if (e.icon) {
              renderIcon(element);
            }
          })
        );
      },
      disposables,
      elementDisposables
    };
  }
};
ProfileIconRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IHoverService)
], ProfileIconRenderer);
let UseForCurrentWindowPropertyRenderer = class extends ProfilePropertyRenderer {
  constructor(userDataProfileService) {
    super();
    this.userDataProfileService = userDataProfileService;
  }
  static {
    __name(this, "UseForCurrentWindowPropertyRenderer");
  }
  templateId = "useForCurrent";
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const useForCurrentWindowContainer = append(
      parent,
      $(".profile-row-container")
    );
    append(
      useForCurrentWindowContainer,
      $(
        ".profile-label-element",
        void 0,
        localize("use for curren window", "Use for Current Window")
      )
    );
    const useForCurrentWindowValueContainer = append(
      useForCurrentWindowContainer,
      $(".profile-use-for-current-container")
    );
    const useForCurrentWindowTitle = localize(
      "enable for current window",
      "Use this profile for the current window"
    );
    const useForCurrentWindowCheckbox = disposables.add(
      new Checkbox(
        useForCurrentWindowTitle,
        false,
        defaultCheckboxStyles
      )
    );
    append(
      useForCurrentWindowValueContainer,
      useForCurrentWindowCheckbox.domNode
    );
    const useForCurrentWindowLabel = append(
      useForCurrentWindowValueContainer,
      $(
        ".profile-description-element",
        void 0,
        useForCurrentWindowTitle
      )
    );
    disposables.add(
      useForCurrentWindowCheckbox.onChange(() => {
        if (profileElement?.root instanceof UserDataProfileElement) {
          profileElement.root.toggleCurrentWindowProfile();
        }
      })
    );
    disposables.add(
      addDisposableListener(
        useForCurrentWindowLabel,
        EventType.CLICK,
        () => {
          if (profileElement?.root instanceof UserDataProfileElement) {
            profileElement.root.toggleCurrentWindowProfile();
          }
        }
      )
    );
    const renderUseCurrentProfile = /* @__PURE__ */ __name((profileElement2) => {
      useForCurrentWindowCheckbox.checked = profileElement2.root instanceof UserDataProfileElement && this.userDataProfileService.currentProfile.id === profileElement2.root.profile.id;
      if (useForCurrentWindowCheckbox.checked && this.userDataProfileService.currentProfile.isDefault) {
        useForCurrentWindowCheckbox.disable();
      } else {
        useForCurrentWindowCheckbox.enable();
      }
    }, "renderUseCurrentProfile");
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        renderUseCurrentProfile(profileElement);
        elementDisposables.add(
          that.userDataProfileService.onDidChangeCurrentProfile(
            (e) => {
              renderUseCurrentProfile(element);
            }
          )
        );
      },
      disposables,
      elementDisposables
    };
  }
};
UseForCurrentWindowPropertyRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfileService)
], UseForCurrentWindowPropertyRenderer);
class UseAsDefaultProfileRenderer extends ProfilePropertyRenderer {
  static {
    __name(this, "UseAsDefaultProfileRenderer");
  }
  templateId = "useAsDefault";
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const useAsDefaultProfileContainer = append(
      parent,
      $(".profile-row-container")
    );
    append(
      useAsDefaultProfileContainer,
      $(
        ".profile-label-element",
        void 0,
        localize("use for new windows", "Use for New Windows")
      )
    );
    const useAsDefaultProfileValueContainer = append(
      useAsDefaultProfileContainer,
      $(".profile-use-as-default-container")
    );
    const useAsDefaultProfileTitle = localize(
      "enable for new windows",
      "Use this profile as the default for new windows"
    );
    const useAsDefaultProfileCheckbox = disposables.add(
      new Checkbox(
        useAsDefaultProfileTitle,
        false,
        defaultCheckboxStyles
      )
    );
    append(
      useAsDefaultProfileValueContainer,
      useAsDefaultProfileCheckbox.domNode
    );
    const useAsDefaultProfileLabel = append(
      useAsDefaultProfileValueContainer,
      $(
        ".profile-description-element",
        void 0,
        useAsDefaultProfileTitle
      )
    );
    disposables.add(
      useAsDefaultProfileCheckbox.onChange(() => {
        if (profileElement?.root instanceof UserDataProfileElement) {
          profileElement.root.toggleNewWindowProfile();
        }
      })
    );
    disposables.add(
      addDisposableListener(
        useAsDefaultProfileLabel,
        EventType.CLICK,
        () => {
          if (profileElement?.root instanceof UserDataProfileElement) {
            profileElement.root.toggleNewWindowProfile();
          }
        }
      )
    );
    const renderUseAsDefault = /* @__PURE__ */ __name((profileElement2) => {
      useAsDefaultProfileCheckbox.checked = profileElement2.root instanceof UserDataProfileElement && profileElement2.root.isNewWindowProfile;
    }, "renderUseAsDefault");
    return {
      set element(element) {
        profileElement = element;
        renderUseAsDefault(profileElement);
        elementDisposables.add(
          profileElement.root.onDidChange((e) => {
            if (e.newWindowProfile) {
              renderUseAsDefault(element);
            }
          })
        );
      },
      disposables,
      elementDisposables
    };
  }
}
let CopyFromProfileRenderer = class extends ProfilePropertyRenderer {
  constructor(userDataProfilesService, instantiationService, uriIdentityService, contextViewService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.instantiationService = instantiationService;
    this.uriIdentityService = uriIdentityService;
    this.contextViewService = contextViewService;
  }
  static {
    __name(this, "CopyFromProfileRenderer");
  }
  templateId = "copyFrom";
  templates = [];
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const copyFromContainer = append(
      parent,
      $(".profile-row-container.profile-copy-from-container")
    );
    append(
      copyFromContainer,
      $(
        ".profile-label-element",
        void 0,
        localize("create from", "Copy from")
      )
    );
    append(
      copyFromContainer,
      $(
        ".profile-description-element",
        void 0,
        localize(
          "copy from description",
          "Select the profile source from which you want to copy contents"
        )
      )
    );
    const copyFromSelectBox = disposables.add(
      this.instantiationService.createInstance(
        SelectBox,
        [],
        0,
        this.contextViewService,
        defaultSelectBoxStyles,
        {
          useCustomDrawn: true,
          ariaLabel: localize(
            "copy profile from",
            "Copy profile from"
          )
        }
      )
    );
    copyFromSelectBox.render(
      append(copyFromContainer, $(".profile-select-container"))
    );
    const render = /* @__PURE__ */ __name((profileElement2, copyFromOptions) => {
      copyFromSelectBox.setOptions(copyFromOptions);
      const id = profileElement2.copyFrom instanceof URI ? profileElement2.copyFrom.toString() : profileElement2.copyFrom?.id;
      const index = id ? copyFromOptions.findIndex((option) => option.id === id) : 0;
      copyFromSelectBox.select(index);
    }, "render");
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        if (profileElement.root instanceof NewProfileElement) {
          const newProfileElement = profileElement.root;
          let copyFromOptions = that.getCopyFromOptions(newProfileElement);
          render(newProfileElement, copyFromOptions);
          copyFromSelectBox.setEnabled(
            !newProfileElement.previewProfile && !newProfileElement.disabled
          );
          elementDisposables.add(
            profileElement.root.onDidChange((e) => {
              if (e.copyFrom || e.copyFromInfo) {
                copyFromOptions = that.getCopyFromOptions(newProfileElement);
                render(newProfileElement, copyFromOptions);
              }
              if (e.preview || e.disabled) {
                copyFromSelectBox.setEnabled(
                  !newProfileElement.previewProfile && !newProfileElement.disabled
                );
              }
            })
          );
          elementDisposables.add(
            copyFromSelectBox.onDidSelect((option) => {
              newProfileElement.copyFrom = copyFromOptions[option.index].source;
            })
          );
        }
      },
      disposables,
      elementDisposables
    };
  }
  setTemplates(templates) {
    this.templates = templates;
  }
  getCopyFromOptions(profileElement) {
    const separator = {
      text: "\u2500\u2500\u2500\u2500\u2500\u2500",
      isDisabled: true
    };
    const copyFromOptions = [];
    copyFromOptions.push({ text: localize("empty profile", "None") });
    for (const [
      copyFromTemplate,
      name
    ] of profileElement.copyFromTemplates) {
      if (!this.templates.some(
        (template) => this.uriIdentityService.extUri.isEqual(
          URI.parse(template.url),
          copyFromTemplate
        )
      )) {
        copyFromOptions.push({
          text: `${name} (${basename(copyFromTemplate)})`,
          id: copyFromTemplate.toString(),
          source: copyFromTemplate
        });
      }
    }
    if (this.templates.length) {
      copyFromOptions.push({
        ...separator,
        decoratorRight: localize("from templates", "Profile Templates")
      });
      for (const template of this.templates) {
        copyFromOptions.push({
          text: template.name,
          id: template.url,
          source: URI.parse(template.url)
        });
      }
    }
    copyFromOptions.push({
      ...separator,
      decoratorRight: localize(
        "from existing profiles",
        "Existing Profiles"
      )
    });
    for (const profile of this.userDataProfilesService.profiles) {
      copyFromOptions.push({
        text: profile.name,
        id: profile.id,
        source: profile
      });
    }
    return copyFromOptions;
  }
};
CopyFromProfileRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, IContextViewService)
], CopyFromProfileRenderer);
let ContentsProfileRenderer = class extends ProfilePropertyRenderer {
  constructor(userDataProfilesService, instantiationService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "ContentsProfileRenderer");
  }
  templateId = "contents";
  _onDidChangeContentHeight = this._register(
    new Emitter()
  );
  onDidChangeContentHeight = this._onDidChangeContentHeight.event;
  _onDidChangeSelection = this._register(
    new Emitter()
  );
  onDidChangeSelection = this._onDidChangeSelection.event;
  profilesContentTree;
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const elementDisposables = disposables.add(new DisposableStore());
    let profileElement;
    const configureRowContainer = append(
      parent,
      $(".profile-row-container")
    );
    append(
      configureRowContainer,
      $(
        ".profile-label-element",
        void 0,
        localize("contents", "Contents")
      )
    );
    const contentsDescriptionElement = append(
      configureRowContainer,
      $(".profile-description-element")
    );
    const contentsTreeHeader = append(
      configureRowContainer,
      $(".profile-content-tree-header")
    );
    const optionsLabel = $(
      ".options-header",
      void 0,
      $("span", void 0, localize("options", "Source"))
    );
    append(
      contentsTreeHeader,
      $(""),
      $("", void 0, localize("contents", "Contents")),
      optionsLabel,
      $(".actions-header", void 0, localize("actions", "Actions"))
    );
    const delegate = new ProfileContentTreeElementDelegate();
    const profilesContentTree = this.profilesContentTree = disposables.add(
      this.instantiationService.createInstance(
        WorkbenchAsyncDataTree,
        "ProfileEditor-ContentsTree",
        append(
          configureRowContainer,
          $(
            ".profile-content-tree.file-icon-themable-tree.show-file-icons"
          )
        ),
        delegate,
        [
          this.instantiationService.createInstance(
            ExistingProfileResourceTreeRenderer
          ),
          this.instantiationService.createInstance(
            NewProfileResourceTreeRenderer
          ),
          this.instantiationService.createInstance(
            ProfileResourceChildTreeItemRenderer
          )
        ],
        this.instantiationService.createInstance(
          ProfileResourceTreeDataSource
        ),
        {
          multipleSelectionSupport: false,
          horizontalScrolling: false,
          accessibilityProvider: {
            getAriaLabel(element) {
              if ((element?.element).resourceType) {
                return (element?.element).resourceType;
              }
              if ((element?.element).label) {
                return (element?.element).label;
              }
              return "";
            },
            getWidgetAriaLabel() {
              return "";
            }
          },
          identityProvider: {
            getId(element) {
              if (element?.element.handle) {
                return element.element.handle;
              }
              return "";
            }
          },
          expandOnlyOnTwistieClick: true,
          renderIndentGuides: RenderIndentGuides.None,
          enableStickyScroll: false,
          openOnSingleClick: false,
          alwaysConsumeMouseWheel: false
        }
      )
    );
    this.profilesContentTree.style(listStyles);
    disposables.add(
      toDisposable(() => this.profilesContentTree = void 0)
    );
    disposables.add(
      this.profilesContentTree.onDidChangeContentHeight((height) => {
        this.profilesContentTree?.layout(height);
        if (profileElement) {
          this._onDidChangeContentHeight.fire(profileElement);
        }
      })
    );
    disposables.add(
      this.profilesContentTree.onDidChangeSelection((e) => {
        if (profileElement) {
          this._onDidChangeSelection.fire({
            element: profileElement,
            selected: !!e.elements.length
          });
        }
      })
    );
    disposables.add(
      this.profilesContentTree.onDidOpen(async (e) => {
        if (!e.browserEvent) {
          return;
        }
        if (e.browserEvent.target && e.browserEvent.target.classList.contains(
          Checkbox.CLASS_NAME
        )) {
          return;
        }
        if (e.element?.element.action) {
          await e.element.element.action.run();
        }
      })
    );
    const updateDescription = /* @__PURE__ */ __name((element) => {
      const defaultHelpInfo = localize(
        "default info",
        "- *Default:* Use contents from the Default profile\n"
      );
      const markdown = new MarkdownString().appendMarkdown(
        localize(
          "contents source description",
          "Configure source of contents for this profile\n"
        )
      );
      clearNode(contentsDescriptionElement);
      if (element.root instanceof UserDataProfileElement && element.root.profile.isDefault) {
        return;
      }
      if (element.root instanceof NewProfileElement) {
        const copyFromName = element.root.getCopyFromName();
        const optionName = copyFromName === this.userDataProfilesService.defaultProfile.name ? localize(
          "copy from default",
          "{0} (Copy)",
          copyFromName
        ) : copyFromName;
        if (optionName) {
          markdown.appendMarkdown(
            localize(
              "copy info",
              "- *{0}:* Copy contents from the {1} profile\n",
              optionName,
              copyFromName
            )
          );
        }
        markdown.appendMarkdown(defaultHelpInfo).appendMarkdown(
          localize(
            "none info",
            "- *None:* Create empty contents\n"
          )
        );
      } else if (element.root instanceof UserDataProfileElement) {
        markdown.appendMarkdown(defaultHelpInfo).appendMarkdown(
          localize(
            "current info",
            "- *{1}:* Use contents from the {0} profile\n",
            element.root.profile.name,
            element.root.profile.name
          )
        );
      }
      append(
        contentsDescriptionElement,
        elementDisposables.add(renderMarkdown(markdown)).element
      );
    }, "updateDescription");
    const that = this;
    return {
      set element(element) {
        profileElement = element;
        updateDescription(element);
        if (element.root instanceof NewProfileElement) {
          contentsTreeHeader.classList.remove("default-profile");
        } else if (element.root instanceof UserDataProfileElement) {
          contentsTreeHeader.classList.toggle(
            "default-profile",
            element.root.profile.isDefault
          );
        }
        profilesContentTree.setInput(profileElement.root);
        elementDisposables.add(
          profileElement.root.onDidChange((e) => {
            if (e.copyFrom || e.copyFlags || e.flags) {
              profilesContentTree.updateChildren(element.root);
            }
            if (e.copyFromInfo) {
              updateDescription(element);
              that._onDidChangeContentHeight.fire(element);
            }
          })
        );
      },
      disposables,
      elementDisposables: new DisposableStore()
    };
  }
  clearSelection() {
    if (this.profilesContentTree) {
      this.profilesContentTree.setSelection([]);
      this.profilesContentTree.setFocus([]);
    }
  }
};
ContentsProfileRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IInstantiationService)
], ContentsProfileRenderer);
let ExistingProfileResourceTreeRenderer = class extends AbstractProfileResourceTreeRenderer {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "ExistingProfileResourceTreeRenderer");
  }
  static TEMPLATE_ID = "ExistingProfileResourceTemplate";
  templateId = ExistingProfileResourceTreeRenderer.TEMPLATE_ID;
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const container = append(
      parent,
      $(
        ".profile-tree-item-container.existing-profile-resource-type-container"
      )
    );
    const label = append(container, $(".profile-resource-type-label"));
    const radio = disposables.add(new Radio({ items: [] }));
    append(
      append(container, $(".profile-resource-options-container")),
      radio.domNode
    );
    const actionsContainer = append(
      container,
      $(".profile-resource-actions-container")
    );
    const actionBar = disposables.add(
      this.instantiationService.createInstance(
        WorkbenchToolBar,
        actionsContainer,
        {
          hoverDelegate: disposables.add(
            createInstantHoverDelegate()
          ),
          highlightToggledItems: true
        }
      )
    );
    return {
      label,
      radio,
      actionBar,
      disposables,
      elementDisposables: disposables.add(new DisposableStore())
    };
  }
  renderElement({
    element: profileResourceTreeElement
  }, index, templateData, height) {
    templateData.elementDisposables.clear();
    const { element, root } = profileResourceTreeElement;
    if (!(root instanceof UserDataProfileElement)) {
      throw new Error(
        "ExistingProfileResourceTreeRenderer can only render existing profile element"
      );
    }
    if (isString(element) || !isProfileResourceTypeElement(element)) {
      throw new Error("Invalid profile resource element");
    }
    const updateRadioItems = /* @__PURE__ */ __name(() => {
      templateData.radio.setItems([
        {
          text: localize("default", "Default"),
          tooltip: localize(
            "default description",
            "Use {0} from the Default profile",
            resourceTypeTitle
          ),
          isActive: root.getFlag(element.resourceType)
        },
        {
          text: root.name,
          tooltip: localize(
            "current description",
            "Use {0} from the {1} profile",
            resourceTypeTitle,
            root.name
          ),
          isActive: !root.getFlag(element.resourceType)
        }
      ]);
    }, "updateRadioItems");
    const resourceTypeTitle = this.getResourceTypeTitle(
      element.resourceType
    );
    templateData.label.textContent = resourceTypeTitle;
    if (root instanceof UserDataProfileElement && root.profile.isDefault) {
      templateData.radio.domNode.classList.add("hide");
    } else {
      templateData.radio.domNode.classList.remove("hide");
      updateRadioItems();
      templateData.elementDisposables.add(
        root.onDidChange((e) => {
          if (e.name) {
            updateRadioItems();
          }
        })
      );
      templateData.elementDisposables.add(
        templateData.radio.onDidSelect(
          (index2) => root.setFlag(element.resourceType, index2 === 0)
        )
      );
    }
    templateData.actionBar.setActions(
      element.action ? [element.action] : []
    );
  }
};
ExistingProfileResourceTreeRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ExistingProfileResourceTreeRenderer);
let NewProfileResourceTreeRenderer = class extends AbstractProfileResourceTreeRenderer {
  constructor(userDataProfilesService, instantiationService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.instantiationService = instantiationService;
  }
  static {
    __name(this, "NewProfileResourceTreeRenderer");
  }
  static TEMPLATE_ID = "NewProfileResourceTemplate";
  templateId = NewProfileResourceTreeRenderer.TEMPLATE_ID;
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const container = append(
      parent,
      $(
        ".profile-tree-item-container.new-profile-resource-type-container"
      )
    );
    const labelContainer = append(
      container,
      $(".profile-resource-type-label-container")
    );
    const label = append(
      labelContainer,
      $("span.profile-resource-type-label")
    );
    const radio = disposables.add(new Radio({ items: [] }));
    append(
      append(container, $(".profile-resource-options-container")),
      radio.domNode
    );
    const actionsContainer = append(
      container,
      $(".profile-resource-actions-container")
    );
    const actionBar = disposables.add(
      this.instantiationService.createInstance(
        WorkbenchToolBar,
        actionsContainer,
        {
          hoverDelegate: disposables.add(
            createInstantHoverDelegate()
          ),
          highlightToggledItems: true
        }
      )
    );
    return {
      label,
      radio,
      actionBar,
      disposables,
      elementDisposables: disposables.add(new DisposableStore())
    };
  }
  renderElement({
    element: profileResourceTreeElement
  }, index, templateData, height) {
    templateData.elementDisposables.clear();
    const { element, root } = profileResourceTreeElement;
    if (!(root instanceof NewProfileElement)) {
      throw new Error(
        "NewProfileResourceTreeRenderer can only render new profile element"
      );
    }
    if (isString(element) || !isProfileResourceTypeElement(element)) {
      throw new Error("Invalid profile resource element");
    }
    const resourceTypeTitle = this.getResourceTypeTitle(
      element.resourceType
    );
    templateData.label.textContent = resourceTypeTitle;
    const renderRadioItems = /* @__PURE__ */ __name(() => {
      const options = [
        {
          text: localize("default", "Default"),
          tooltip: localize(
            "default description",
            "Use {0} from the Default profile",
            resourceTypeTitle
          )
        },
        {
          text: localize("none", "None"),
          tooltip: localize(
            "none description",
            "Create empty {0}",
            resourceTypeTitle
          )
        }
      ];
      const copyFromName = root.getCopyFromName();
      const name = copyFromName === this.userDataProfilesService.defaultProfile.name ? localize("copy from default", "{0} (Copy)", copyFromName) : copyFromName;
      if (root.copyFrom && name) {
        templateData.radio.setItems([
          {
            text: name,
            tooltip: name ? localize(
              "copy from profile description",
              "Copy {0} from the {1} profile",
              resourceTypeTitle,
              name
            ) : localize("copy description", "Copy")
          },
          ...options
        ]);
        templateData.radio.setActiveItem(
          root.getCopyFlag(element.resourceType) ? 0 : root.getFlag(element.resourceType) ? 1 : 2
        );
      } else {
        templateData.radio.setItems(options);
        templateData.radio.setActiveItem(
          root.getFlag(element.resourceType) ? 0 : 1
        );
      }
    }, "renderRadioItems");
    if (root.copyFrom) {
      templateData.elementDisposables.add(
        templateData.radio.onDidSelect((index2) => {
          root.setFlag(element.resourceType, index2 === 1);
          root.setCopyFlag(element.resourceType, index2 === 0);
        })
      );
    } else {
      templateData.elementDisposables.add(
        templateData.radio.onDidSelect((index2) => {
          root.setFlag(element.resourceType, index2 === 0);
        })
      );
    }
    renderRadioItems();
    templateData.radio.setEnabled(!root.disabled);
    templateData.elementDisposables.add(
      root.onDidChange((e) => {
        if (e.disabled) {
          templateData.radio.setEnabled(!root.disabled);
        }
        if (e.copyFrom || e.copyFromInfo) {
          renderRadioItems();
        }
      })
    );
    templateData.actionBar.setActions(
      element.action ? [element.action] : []
    );
  }
};
NewProfileResourceTreeRenderer = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IInstantiationService)
], NewProfileResourceTreeRenderer);
let ProfileResourceChildTreeItemRenderer = class extends AbstractProfileResourceTreeRenderer {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.labels = instantiationService.createInstance(
      ResourceLabels,
      DEFAULT_LABELS_CONTAINER
    );
    this.hoverDelegate = this._register(
      instantiationService.createInstance(
        WorkbenchHoverDelegate,
        "mouse",
        false,
        {}
      )
    );
  }
  static {
    __name(this, "ProfileResourceChildTreeItemRenderer");
  }
  static TEMPLATE_ID = "ProfileResourceChildTreeItemTemplate";
  templateId = ProfileResourceChildTreeItemRenderer.TEMPLATE_ID;
  labels;
  hoverDelegate;
  renderTemplate(parent) {
    const disposables = new DisposableStore();
    const container = append(
      parent,
      $(".profile-tree-item-container.profile-resource-child-container")
    );
    const checkbox = disposables.add(
      new Checkbox("", false, defaultCheckboxStyles)
    );
    append(container, checkbox.domNode);
    const resourceLabel = disposables.add(
      this.labels.create(container, {
        hoverDelegate: this.hoverDelegate
      })
    );
    const actionsContainer = append(
      container,
      $(".profile-resource-actions-container")
    );
    const actionBar = disposables.add(
      this.instantiationService.createInstance(
        WorkbenchToolBar,
        actionsContainer,
        {
          hoverDelegate: disposables.add(
            createInstantHoverDelegate()
          ),
          highlightToggledItems: true
        }
      )
    );
    return {
      checkbox,
      resourceLabel,
      actionBar,
      disposables,
      elementDisposables: disposables.add(new DisposableStore())
    };
  }
  renderElement({
    element: profileResourceTreeElement
  }, index, templateData, height) {
    templateData.elementDisposables.clear();
    const { element } = profileResourceTreeElement;
    if (isString(element) || !isProfileResourceChildElement(element)) {
      throw new Error("Invalid profile resource element");
    }
    if (element.checkbox) {
      templateData.checkbox.domNode.setAttribute("tabindex", "0");
      templateData.checkbox.domNode.classList.remove("hide");
      templateData.checkbox.checked = element.checkbox.isChecked;
      templateData.checkbox.domNode.ariaLabel = element.checkbox.accessibilityInformation?.label ?? "";
      if (element.checkbox.accessibilityInformation?.role) {
        templateData.checkbox.domNode.role = element.checkbox.accessibilityInformation.role;
      }
    } else {
      templateData.checkbox.domNode.removeAttribute("tabindex");
      templateData.checkbox.domNode.classList.add("hide");
    }
    templateData.resourceLabel.setResource(
      {
        name: element.resource ? basename(element.resource) : element.label,
        resource: element.resource
      },
      {
        forceLabel: true,
        icon: element.icon,
        hideIcon: !element.resource && !element.icon
      }
    );
    templateData.actionBar.setActions(
      element.action ? [element.action] : []
    );
  }
};
ProfileResourceChildTreeItemRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ProfileResourceChildTreeItemRenderer);
let UserDataProfilesEditorInput = class extends EditorInput {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.model = UserDataProfilesEditorModel.getInstance(
      this.instantiationService
    );
    this._register(
      this.model.onDidChange(
        (e) => this.dirty = this.model.profiles.some(
          (profile) => profile instanceof NewProfileElement
        )
      )
    );
  }
  static {
    __name(this, "UserDataProfilesEditorInput");
  }
  static ID = "workbench.input.userDataProfiles";
  resource = void 0;
  model;
  _dirty = false;
  get dirty() {
    return this._dirty;
  }
  set dirty(dirty) {
    if (this._dirty !== dirty) {
      this._dirty = dirty;
      this._onDidChangeDirty.fire();
    }
  }
  get typeId() {
    return UserDataProfilesEditorInput.ID;
  }
  getName() {
    return localize("userDataProfiles", "Profiles");
  }
  getIcon() {
    return defaultUserDataProfileIcon;
  }
  async resolve() {
    await this.model.resolve();
    return this.model;
  }
  isDirty() {
    return this.dirty;
  }
  async save() {
    await this.model.saveNewProfile();
    return this;
  }
  async revert() {
    this.model.revert();
  }
  matches(otherInput) {
    return otherInput instanceof UserDataProfilesEditorInput;
  }
  dispose() {
    for (const profile of this.model.profiles) {
      if (profile instanceof UserDataProfileElement) {
        profile.reset();
      }
    }
    super.dispose();
  }
};
UserDataProfilesEditorInput = __decorateClass([
  __decorateParam(0, IInstantiationService)
], UserDataProfilesEditorInput);
class UserDataProfilesEditorInputSerializer {
  static {
    __name(this, "UserDataProfilesEditorInputSerializer");
  }
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(UserDataProfilesEditorInput);
  }
}
export {
  UserDataProfilesEditor,
  UserDataProfilesEditorInput,
  UserDataProfilesEditorInputSerializer,
  profilesSashBorder
};
//# sourceMappingURL=userDataProfilesEditor.js.map
