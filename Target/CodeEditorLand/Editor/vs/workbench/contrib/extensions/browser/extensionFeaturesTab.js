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
import { $, append, clearNode } from "../../../../base/browser/dom.js";
import { renderMarkdown } from "../../../../base/browser/markdownRenderer.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { KeybindingLabel } from "../../../../base/browser/ui/keybindingLabel/keybindingLabel.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import {
  Orientation,
  Sizing,
  SplitView
} from "../../../../base/browser/ui/splitview/splitview.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Color } from "../../../../base/common/color.js";
import { fromNow } from "../../../../base/common/date.js";
import {
  getErrorMessage,
  onUnexpectedError
} from "../../../../base/common/errors.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import {
  MarkdownString,
  isMarkdownString
} from "../../../../base/common/htmlContent.js";
import { ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { OS } from "../../../../base/common/platform.js";
import Severity from "../../../../base/common/severity.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { getExtensionId } from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import {
  ExtensionIdentifier
} from "../../../../platform/extensions/common/extensions.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchList } from "../../../../platform/list/browser/listService.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { SeverityIcon } from "../../../../platform/severityIcon/browser/severityIcon.js";
import {
  defaultButtonStyles,
  defaultKeybindingLabelStyles
} from "../../../../platform/theme/browser/defaultStyles.js";
import {
  IThemeService,
  Themable
} from "../../../../platform/theme/common/themeService.js";
import { PANEL_SECTION_BORDER } from "../../../common/theme.js";
import {
  Extensions,
  IExtensionFeaturesManagementService
} from "../../../services/extensionManagement/common/extensionFeatures.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { errorIcon, infoIcon, warningIcon } from "./extensionsIcons.js";
let RuntimeStatusMarkdownRenderer = class extends Disposable {
  constructor(extensionService, extensionFeaturesManagementService) {
    super();
    this.extensionService = extensionService;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
  }
  static ID = "runtimeStatus";
  type = "markdown";
  shouldRender(manifest) {
    const extensionId = new ExtensionIdentifier(
      getExtensionId(manifest.publisher, manifest.name)
    );
    if (!this.extensionService.extensions.some(
      (e) => ExtensionIdentifier.equals(e.identifier, extensionId)
    )) {
      return false;
    }
    return !!manifest.main || !!manifest.browser;
  }
  render(manifest) {
    const disposables = new DisposableStore();
    const extensionId = new ExtensionIdentifier(
      getExtensionId(manifest.publisher, manifest.name)
    );
    const emitter = disposables.add(new Emitter());
    disposables.add(
      this.extensionService.onDidChangeExtensionsStatus((e) => {
        if (e.some(
          (extension) => ExtensionIdentifier.equals(extension, extensionId)
        )) {
          emitter.fire(this.getRuntimeStatusData(manifest));
        }
      })
    );
    disposables.add(
      this.extensionFeaturesManagementService.onDidChangeAccessData(
        (e) => emitter.fire(this.getRuntimeStatusData(manifest))
      )
    );
    return {
      onDidChange: emitter.event,
      data: this.getRuntimeStatusData(manifest),
      dispose: () => disposables.dispose()
    };
  }
  getRuntimeStatusData(manifest) {
    const data = new MarkdownString();
    const extensionId = new ExtensionIdentifier(
      getExtensionId(manifest.publisher, manifest.name)
    );
    const status = this.extensionService.getExtensionsStatus()[extensionId.value];
    if (this.extensionService.extensions.some(
      (extension) => ExtensionIdentifier.equals(extension.identifier, extensionId)
    )) {
      data.appendMarkdown(
        `### ${localize("activation", "Activation")}

`
      );
      if (status.activationTimes) {
        if (status.activationTimes.activationReason.startup) {
          data.appendMarkdown(
            `Activated on Startup: \`${status.activationTimes.activateCallTime}ms\``
          );
        } else {
          data.appendMarkdown(
            `Activated by \`${status.activationTimes.activationReason.activationEvent}\` event: \`${status.activationTimes.activateCallTime}ms\``
          );
        }
      } else {
        data.appendMarkdown("Not yet activated");
      }
      if (status.runtimeErrors.length) {
        data.appendMarkdown(
          `
 ### ${localize("uncaught errors", "Uncaught Errors ({0})", status.runtimeErrors.length)}
`
        );
        for (const error of status.runtimeErrors) {
          data.appendMarkdown(
            `$(${Codicon.error.id})&nbsp;${getErrorMessage(error)}

`
          );
        }
      }
      if (status.messages.length) {
        data.appendMarkdown(
          `
 ### ${localize("messaages", "Messages ({0})", status.messages.length)}
`
        );
        for (const message of status.messages) {
          data.appendMarkdown(
            `$(${(message.type === Severity.Error ? Codicon.error : message.type === Severity.Warning ? Codicon.warning : Codicon.info).id})&nbsp;${message.message}

`
          );
        }
      }
    }
    const features = Registry.as(
      Extensions.ExtensionFeaturesRegistry
    ).getExtensionFeatures();
    for (const feature of features) {
      const accessData = this.extensionFeaturesManagementService.getAccessData(
        extensionId,
        feature.id
      );
      if (accessData) {
        data.appendMarkdown(`
 ### ${feature.label}

`);
        const status2 = accessData?.current?.status;
        if (status2) {
          if (status2?.severity === Severity.Error) {
            data.appendMarkdown(
              `$(${errorIcon.id}) ${status2.message}

`
            );
          }
          if (status2?.severity === Severity.Warning) {
            data.appendMarkdown(
              `$(${warningIcon.id}) ${status2.message}

`
            );
          }
        }
        if (accessData?.totalCount) {
          if (accessData.current) {
            data.appendMarkdown(
              `${localize("last request", "Last Request: `{0}`", fromNow(accessData.current.lastAccessed, true, true))}

`
            );
            data.appendMarkdown(
              `${localize("requests count session", "Requests (Session) : `{0}`", accessData.current.count)}

`
            );
          }
          data.appendMarkdown(
            `${localize("requests count total", "Requests (Overall): `{0}`", accessData.totalCount)}

`
          );
        }
      }
    }
    return data;
  }
};
RuntimeStatusMarkdownRenderer = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IExtensionFeaturesManagementService)
], RuntimeStatusMarkdownRenderer);
const runtimeStatusFeature = {
  id: RuntimeStatusMarkdownRenderer.ID,
  label: localize("runtime", "Runtime Status"),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(RuntimeStatusMarkdownRenderer)
};
let ExtensionFeaturesTab = class extends Themable {
  constructor(manifest, feature, themeService, instantiationService) {
    super(themeService);
    this.manifest = manifest;
    this.feature = feature;
    this.instantiationService = instantiationService;
    this.extensionId = new ExtensionIdentifier(getExtensionId(manifest.publisher, manifest.name));
    this.domNode = $("div.subcontent.feature-contributions");
    this.create();
  }
  domNode;
  featureView = this._register(
    new MutableDisposable()
  );
  featureViewDimension;
  layoutParticipants = [];
  extensionId;
  layout(height, width) {
    this.layoutParticipants.forEach(
      (participant) => participant.layout(height, width)
    );
  }
  create() {
    const features = this.getFeatures();
    if (features.length === 0) {
      append($(".no-features"), this.domNode).textContent = localize(
        "noFeatures",
        "No features contributed."
      );
      return;
    }
    const splitView = this._register(
      new SplitView(this.domNode, {
        orientation: Orientation.HORIZONTAL,
        proportionalLayout: true
      })
    );
    this.layoutParticipants.push({
      layout: (height, width) => {
        splitView.el.style.height = `${height - 14}px`;
        splitView.layout(width);
      }
    });
    const featuresListContainer = $(".features-list-container");
    const list = this._register(
      this.createFeaturesList(featuresListContainer)
    );
    list.splice(0, list.length, features);
    const featureViewContainer = $(".feature-view-container");
    this._register(
      list.onDidChangeSelection((e) => {
        const feature = e.elements[0];
        if (feature) {
          this.showFeatureView(feature, featureViewContainer);
        }
      })
    );
    const index = this.feature ? features.findIndex((f) => f.id === this.feature) : 0;
    list.setSelection([index === -1 ? 0 : index]);
    splitView.addView(
      {
        onDidChange: Event.None,
        element: featuresListContainer,
        minimumSize: 100,
        maximumSize: Number.POSITIVE_INFINITY,
        layout: (width, _, height) => {
          featuresListContainer.style.width = `${width}px`;
          list.layout(height, width);
        }
      },
      200,
      void 0,
      true
    );
    splitView.addView(
      {
        onDidChange: Event.None,
        element: featureViewContainer,
        minimumSize: 500,
        maximumSize: Number.POSITIVE_INFINITY,
        layout: (width, _, height) => {
          featureViewContainer.style.width = `${width}px`;
          this.featureViewDimension = { height, width };
          this.layoutFeatureView();
        }
      },
      Sizing.Distribute,
      void 0,
      true
    );
    splitView.style({
      separatorBorder: this.theme.getColor(PANEL_SECTION_BORDER)
    });
  }
  createFeaturesList(container) {
    const renderer = this.instantiationService.createInstance(
      ExtensionFeatureItemRenderer,
      this.extensionId
    );
    const delegate = new ExtensionFeatureItemDelegate();
    const list = this.instantiationService.createInstance(
      WorkbenchList,
      "ExtensionFeaturesList",
      append(container, $(".features-list-wrapper")),
      delegate,
      [renderer],
      {
        multipleSelectionSupport: false,
        setRowLineHeight: false,
        horizontalScrolling: false,
        accessibilityProvider: {
          getAriaLabel(extensionFeature) {
            return extensionFeature?.label ?? "";
          },
          getWidgetAriaLabel() {
            return localize(
              "extension features list",
              "Extension Features"
            );
          }
        },
        openOnSingleClick: true
      }
    );
    return list;
  }
  layoutFeatureView() {
    this.featureView.value?.layout(
      this.featureViewDimension?.height,
      this.featureViewDimension?.width
    );
  }
  showFeatureView(feature, container) {
    if (this.featureView.value?.feature.id === feature.id) {
      return;
    }
    clearNode(container);
    this.featureView.value = this.instantiationService.createInstance(
      ExtensionFeatureView,
      this.extensionId,
      this.manifest,
      feature
    );
    container.appendChild(this.featureView.value.domNode);
    this.layoutFeatureView();
  }
  getFeatures() {
    const features = Registry.as(
      Extensions.ExtensionFeaturesRegistry
    ).getExtensionFeatures().filter((feature) => {
      const renderer2 = this.getRenderer(feature);
      const shouldRender = renderer2?.shouldRender(this.manifest);
      renderer2?.dispose();
      return shouldRender;
    }).sort((a, b) => a.label.localeCompare(b.label));
    const renderer = this.getRenderer(runtimeStatusFeature);
    if (renderer?.shouldRender(this.manifest)) {
      features.splice(0, 0, runtimeStatusFeature);
    }
    renderer?.dispose();
    return features;
  }
  getRenderer(feature) {
    return feature.renderer ? this.instantiationService.createInstance(feature.renderer) : void 0;
  }
};
ExtensionFeaturesTab = __decorateClass([
  __decorateParam(2, IThemeService),
  __decorateParam(3, IInstantiationService)
], ExtensionFeaturesTab);
class ExtensionFeatureItemDelegate {
  getHeight() {
    return 22;
  }
  getTemplateId() {
    return "extensionFeatureDescriptor";
  }
}
let ExtensionFeatureItemRenderer = class {
  constructor(extensionId, extensionFeaturesManagementService) {
    this.extensionId = extensionId;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
  }
  templateId = "extensionFeatureDescriptor";
  renderTemplate(container) {
    container.classList.add("extension-feature-list-item");
    const label = append(container, $(".extension-feature-label"));
    const disabledElement = append(
      container,
      $(".extension-feature-disabled-label")
    );
    disabledElement.textContent = localize("revoked", "No Access");
    const statusElement = append(container, $(".extension-feature-status"));
    return {
      label,
      disabledElement,
      statusElement,
      disposables: new DisposableStore()
    };
  }
  renderElement(element, index, templateData) {
    templateData.disposables.clear();
    templateData.label.textContent = element.label;
    templateData.disabledElement.style.display = element.id === runtimeStatusFeature.id || this.extensionFeaturesManagementService.isEnabled(
      this.extensionId,
      element.id
    ) ? "none" : "inherit";
    templateData.disposables.add(
      this.extensionFeaturesManagementService.onDidChangeEnablement(
        ({ extension, featureId, enabled }) => {
          if (ExtensionIdentifier.equals(
            extension,
            this.extensionId
          ) && featureId === element.id) {
            templateData.disabledElement.style.display = enabled ? "none" : "inherit";
          }
        }
      )
    );
    const statusElementClassName = templateData.statusElement.className;
    const updateStatus = () => {
      const accessData = this.extensionFeaturesManagementService.getAccessData(
        this.extensionId,
        element.id
      );
      if (accessData?.current?.status) {
        templateData.statusElement.style.display = "inherit";
        templateData.statusElement.className = `${statusElementClassName} ${SeverityIcon.className(accessData.current.status.severity)}`;
      } else {
        templateData.statusElement.style.display = "none";
      }
    };
    updateStatus();
    templateData.disposables.add(
      this.extensionFeaturesManagementService.onDidChangeAccessData(
        ({ extension, featureId }) => {
          if (ExtensionIdentifier.equals(
            extension,
            this.extensionId
          ) && featureId === element.id) {
            updateStatus();
          }
        }
      )
    );
  }
  disposeElement(element, index, templateData, height) {
    templateData.disposables.dispose();
  }
  disposeTemplate(templateData) {
    templateData.disposables.dispose();
  }
};
ExtensionFeatureItemRenderer = __decorateClass([
  __decorateParam(1, IExtensionFeaturesManagementService)
], ExtensionFeatureItemRenderer);
let ExtensionFeatureView = class extends Disposable {
  constructor(extensionId, manifest, feature, openerService, instantiationService, extensionFeaturesManagementService, dialogService) {
    super();
    this.extensionId = extensionId;
    this.manifest = manifest;
    this.feature = feature;
    this.openerService = openerService;
    this.instantiationService = instantiationService;
    this.extensionFeaturesManagementService = extensionFeaturesManagementService;
    this.dialogService = dialogService;
    this.domNode = $(".extension-feature-content");
    this.create(this.domNode);
  }
  domNode;
  layoutParticipants = [];
  create(content) {
    const header = append(content, $(".feature-header"));
    const title = append(header, $(".feature-title"));
    title.textContent = this.feature.label;
    if (this.feature.access.canToggle) {
      const actionsContainer = append(header, $(".feature-actions"));
      const button = new Button(actionsContainer, defaultButtonStyles);
      this.updateButtonLabel(button);
      this._register(
        this.extensionFeaturesManagementService.onDidChangeEnablement(
          ({ extension, featureId }) => {
            if (ExtensionIdentifier.equals(
              extension,
              this.extensionId
            ) && featureId === this.feature.id) {
              this.updateButtonLabel(button);
            }
          }
        )
      );
      this._register(
        button.onDidClick(async () => {
          const enabled = this.extensionFeaturesManagementService.isEnabled(
            this.extensionId,
            this.feature.id
          );
          const confirmationResult = await this.dialogService.confirm(
            {
              title: localize(
                "accessExtensionFeature",
                "Enable '{0}' Feature",
                this.feature.label
              ),
              message: enabled ? localize(
                "disableAccessExtensionFeatureMessage",
                "Would you like to revoke '{0}' extension to access '{1}' feature?",
                this.manifest.displayName ?? this.extensionId.value,
                this.feature.label
              ) : localize(
                "enableAccessExtensionFeatureMessage",
                "Would you like to allow '{0}' extension to access '{1}' feature?",
                this.manifest.displayName ?? this.extensionId.value,
                this.feature.label
              ),
              custom: true,
              primaryButton: enabled ? localize("revoke", "Revoke Access") : localize("grant", "Allow Access"),
              cancelButton: localize("cancel", "Cancel")
            }
          );
          if (confirmationResult.confirmed) {
            this.extensionFeaturesManagementService.setEnablement(
              this.extensionId,
              this.feature.id,
              !enabled
            );
          }
        })
      );
    }
    const body = append(content, $(".feature-body"));
    const bodyContent = $(".feature-body-content");
    const scrollableContent = this._register(
      new DomScrollableElement(bodyContent, {})
    );
    append(body, scrollableContent.getDomNode());
    this.layoutParticipants.push({
      layout: () => scrollableContent.scanDomNode()
    });
    scrollableContent.scanDomNode();
    if (this.feature.description) {
      const description = append(bodyContent, $(".feature-description"));
      description.textContent = this.feature.description;
    }
    const accessData = this.extensionFeaturesManagementService.getAccessData(
      this.extensionId,
      this.feature.id
    );
    if (accessData?.current?.status) {
      append(
        bodyContent,
        $(
          ".feature-status",
          void 0,
          $(
            `span${ThemeIcon.asCSSSelector(accessData.current.status.severity === Severity.Error ? errorIcon : accessData.current.status.severity === Severity.Warning ? warningIcon : infoIcon)}`,
            void 0
          ),
          $("span", void 0, accessData.current.status.message)
        )
      );
    }
    const featureContentElement = append(
      bodyContent,
      $(".feature-content")
    );
    if (this.feature.renderer) {
      const renderer = this.instantiationService.createInstance(
        this.feature.renderer
      );
      if (renderer.type === "table") {
        this.renderTableData(
          featureContentElement,
          renderer
        );
      } else if (renderer.type === "markdown") {
        this.renderMarkdownData(
          featureContentElement,
          renderer
        );
      } else if (renderer.type === "markdown+table") {
        this.renderMarkdownAndTableData(
          featureContentElement,
          renderer
        );
      }
    }
  }
  updateButtonLabel(button) {
    button.label = this.extensionFeaturesManagementService.isEnabled(
      this.extensionId,
      this.feature.id
    ) ? localize("revoke", "Revoke Access") : localize("enable", "Allow Access");
  }
  renderTableData(container, renderer) {
    const tableData = this._register(renderer.render(this.manifest));
    const tableDisposable = this._register(new MutableDisposable());
    if (tableData.onDidChange) {
      this._register(
        tableData.onDidChange((data) => {
          clearNode(container);
          tableDisposable.value = this.renderTable(data, container);
        })
      );
    }
    tableDisposable.value = this.renderTable(tableData.data, container);
  }
  renderTable(tableData, container) {
    const disposables = new DisposableStore();
    append(
      container,
      $(
        "table",
        void 0,
        $(
          "tr",
          void 0,
          ...tableData.headers.map(
            (header) => $("th", void 0, header)
          )
        ),
        ...tableData.rows.map((row) => {
          return $(
            "tr",
            void 0,
            ...row.map((rowData) => {
              if (typeof rowData === "string") {
                return $("td", void 0, rowData);
              }
              const data = Array.isArray(rowData) ? rowData : [rowData];
              return $(
                "td",
                void 0,
                ...data.flatMap((item) => {
                  const result = [];
                  if (isMarkdownString(rowData)) {
                    const element = $("", void 0);
                    this.renderMarkdown(rowData, element);
                    result.push(element);
                  } else if (item instanceof ResolvedKeybinding) {
                    const element = $("");
                    const kbl = disposables.add(
                      new KeybindingLabel(
                        element,
                        OS,
                        defaultKeybindingLabelStyles
                      )
                    );
                    kbl.set(item);
                    result.push(element);
                  } else if (item instanceof Color) {
                    result.push(
                      $(
                        "span",
                        {
                          class: "colorBox",
                          style: "background-color: " + Color.Format.CSS.format(
                            item
                          )
                        },
                        ""
                      )
                    );
                    result.push(
                      $(
                        "code",
                        void 0,
                        Color.Format.CSS.formatHex(
                          item
                        )
                      )
                    );
                  }
                  return result;
                })
              );
            })
          );
        })
      )
    );
    return disposables;
  }
  renderMarkdownAndTableData(container, renderer) {
    const markdownAndTableData = this._register(
      renderer.render(this.manifest)
    );
    if (markdownAndTableData.onDidChange) {
      this._register(
        markdownAndTableData.onDidChange((data) => {
          clearNode(container);
          this.renderMarkdownAndTable(data, container);
        })
      );
    }
    this.renderMarkdownAndTable(markdownAndTableData.data, container);
  }
  renderMarkdownData(container, renderer) {
    container.classList.add("markdown");
    const markdownData = this._register(renderer.render(this.manifest));
    if (markdownData.onDidChange) {
      this._register(
        markdownData.onDidChange((data) => {
          clearNode(container);
          this.renderMarkdown(data, container);
        })
      );
    }
    this.renderMarkdown(markdownData.data, container);
  }
  renderMarkdown(markdown, container) {
    const { element, dispose } = renderMarkdown(
      {
        value: markdown.value,
        isTrusted: markdown.isTrusted,
        supportThemeIcons: true
      },
      {
        actionHandler: {
          callback: (content) => this.openerService.open(content, {
            allowCommands: !!markdown.isTrusted
          }).catch(onUnexpectedError),
          disposables: this._store
        }
      }
    );
    this._register(toDisposable(dispose));
    append(container, element);
  }
  renderMarkdownAndTable(data, container) {
    for (const markdownOrTable of data) {
      if (isMarkdownString(markdownOrTable)) {
        const element = $("", void 0);
        this.renderMarkdown(markdownOrTable, element);
        append(container, element);
      } else {
        const tableElement = append(container, $("table"));
        this.renderTable(markdownOrTable, tableElement);
      }
    }
  }
  layout(height, width) {
    this.layoutParticipants.forEach((p) => p.layout(height, width));
  }
};
ExtensionFeatureView = __decorateClass([
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IExtensionFeaturesManagementService),
  __decorateParam(6, IDialogService)
], ExtensionFeatureView);
export {
  ExtensionFeaturesTab
};
