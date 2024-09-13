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
  createStyleSheet,
  isHTMLInputElement,
  isHTMLTextAreaElement,
  reset,
  windowOpenNoOpener
} from "../../../../base/browser/dom.js";
import {
  Button,
  unthemedButtonStyles
} from "../../../../base/browser/ui/button/button.js";
import { renderIcon } from "../../../../base/browser/ui/iconLabel/iconLabels.js";
import { mainWindow } from "../../../../base/browser/window.js";
import { Delayer, RunOnceScheduler } from "../../../../base/common/async.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { groupBy } from "../../../../base/common/collections.js";
import { debounce } from "../../../../base/common/decorators.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { isLinuxSnap, isMacintosh } from "../../../../base/common/platform.js";
import { escape } from "../../../../base/common/strings.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { isRemoteDiagnosticError } from "../../../../platform/diagnostics/common/diagnostics.js";
import {
  IIssueMainService,
  IProcessMainService,
  OldIssueType
} from "../../../../platform/issue/common/issue.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { getIconsStyleSheet } from "../../../../platform/theme/browser/iconsStyleSheet.js";
import {
  applyZoom,
  zoomIn,
  zoomOut
} from "../../../../platform/window/electron-sandbox/window.js";
import {
  IssueReporterModel
} from "../browser/issueReporterModel.js";
import { normalizeGitHubUrl } from "../common/issueReporterUtil.js";
const MAX_URL_LENGTH = 7500;
var IssueSource = /* @__PURE__ */ ((IssueSource2) => {
  IssueSource2["VSCode"] = "vscode";
  IssueSource2["Extension"] = "extension";
  IssueSource2["Marketplace"] = "marketplace";
  IssueSource2["Unknown"] = "unknown";
  return IssueSource2;
})(IssueSource || {});
let IssueReporter = class extends Disposable {
  constructor(configuration, nativeHostService, issueMainService, processMainService) {
    super();
    this.configuration = configuration;
    this.nativeHostService = nativeHostService;
    this.issueMainService = issueMainService;
    this.processMainService = processMainService;
    const targetExtension = configuration.data.extensionId ? configuration.data.enabledExtensions.find((extension) => extension.id.toLocaleLowerCase() === configuration.data.extensionId?.toLocaleLowerCase()) : void 0;
    this.issueReporterModel = new IssueReporterModel({
      ...configuration.data,
      issueType: configuration.data.issueType || OldIssueType.Bug,
      versionInfo: {
        vscodeVersion: `${configuration.product.nameShort} ${!!configuration.product.darwinUniversalAssetId ? `${configuration.product.version} (Universal)` : configuration.product.version} (${configuration.product.commit || "Commit unknown"}, ${configuration.product.date || "Date unknown"})`,
        os: `${this.configuration.os.type} ${this.configuration.os.arch} ${this.configuration.os.release}${isLinuxSnap ? " snap" : ""}`
      },
      extensionsDisabled: !!configuration.disableExtensions,
      fileOnExtension: configuration.data.extensionId ? !targetExtension?.isBuiltin : void 0,
      selectedExtension: targetExtension
    });
    const fileOnMarketplace = configuration.data.issueSource === "marketplace" /* Marketplace */;
    const fileOnProduct = configuration.data.issueSource === "vscode" /* VSCode */;
    this.issueReporterModel.update({ fileOnMarketplace, fileOnProduct });
    const issueReporterElement = this.getElementById("issue-reporter");
    if (issueReporterElement) {
      this.previewButton = new Button(issueReporterElement, unthemedButtonStyles);
      const issueRepoName = document.createElement("a");
      issueReporterElement.appendChild(issueRepoName);
      issueRepoName.id = "show-repo-name";
      issueRepoName.classList.add("hidden");
      this.updatePreviewButtonState();
    }
    const issueTitle = configuration.data.issueTitle;
    if (issueTitle) {
      const issueTitleElement = this.getElementById("issue-title");
      if (issueTitleElement) {
        issueTitleElement.value = issueTitle;
      }
    }
    const issueBody = configuration.data.issueBody;
    if (issueBody) {
      const description = this.getElementById("description");
      if (description) {
        description.value = issueBody;
        this.issueReporterModel.update({ issueDescription: issueBody });
      }
    }
    this.processMainService.$getSystemInfo().then((info) => {
      this.issueReporterModel.update({ systemInfo: info });
      this.receivedSystemInfo = true;
      this.updateSystemInfo(this.issueReporterModel.getData());
      this.updatePreviewButtonState();
    });
    if (configuration.data.issueType === OldIssueType.PerformanceIssue) {
      this.processMainService.$getPerformanceInfo().then((info) => {
        this.updatePerformanceInfo(info);
      });
    }
    if (mainWindow.document.documentElement.lang !== "en") {
      show(this.getElementById("english"));
    }
    const codiconStyleSheet = createStyleSheet();
    codiconStyleSheet.id = "codiconStyles";
    const iconsStyleSheet = this._register(getIconsStyleSheet(void 0));
    function updateAll() {
      codiconStyleSheet.textContent = iconsStyleSheet.getCSS();
    }
    __name(updateAll, "updateAll");
    const delayer = new RunOnceScheduler(updateAll, 0);
    iconsStyleSheet.onDidChange(() => delayer.schedule());
    delayer.schedule();
    this.setUpTypes();
    this.setEventHandlers();
    applyZoom(configuration.data.zoomLevel, mainWindow);
    this.applyStyles(configuration.data.styles);
    this.handleExtensionData(configuration.data.enabledExtensions);
    this.updateExperimentsInfo(configuration.data.experiments);
    this.updateRestrictedMode(configuration.data.restrictedMode);
    this.updateUnsupportedMode(configuration.data.isUnsupported);
    if ((configuration.data.data || configuration.data.uri) && targetExtension) {
      this.updateExtensionStatus(targetExtension);
    }
  }
  static {
    __name(this, "IssueReporter");
  }
  issueReporterModel;
  numberOfSearchResultsDisplayed = 0;
  receivedSystemInfo = false;
  receivedPerformanceInfo = false;
  shouldQueueSearch = false;
  hasBeenSubmitted = false;
  openReporter = false;
  loadingExtensionData = false;
  selectedExtension = "";
  delayedSubmit = new Delayer(300);
  previewButton;
  nonGitHubIssueUrl = false;
  render() {
    this.renderBlocks();
  }
  setInitialFocus() {
    const { fileOnExtension } = this.issueReporterModel.getData();
    if (fileOnExtension) {
      const issueTitle = mainWindow.document.getElementById("issue-title");
      issueTitle?.focus();
    } else {
      const issueType = mainWindow.document.getElementById("issue-type");
      issueType?.focus();
    }
  }
  // TODO @justschen: After migration to Aux Window, switch to dedicated css.
  applyStyles(styles) {
    const styleTag = document.createElement("style");
    const content = [];
    if (styles.inputBackground) {
      content.push(
        `input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { background-color: ${styles.inputBackground}; }`
      );
    }
    if (styles.inputBorder) {
      content.push(
        `input[type="text"], textarea, select { border: 1px solid ${styles.inputBorder}; }`
      );
    } else {
      content.push(
        `input[type="text"], textarea, select { border: 1px solid transparent; }`
      );
    }
    if (styles.inputForeground) {
      content.push(
        `input[type="text"], textarea, select, .issues-container > .issue > .issue-state, .block-info { color: ${styles.inputForeground}; }`
      );
    }
    if (styles.inputErrorBorder) {
      content.push(
        `.invalid-input, .invalid-input:focus, .validation-error { border: 1px solid ${styles.inputErrorBorder} !important; }`
      );
      content.push(
        `.required-input { color: ${styles.inputErrorBorder}; }`
      );
    }
    if (styles.inputErrorBackground) {
      content.push(
        `.validation-error { background: ${styles.inputErrorBackground}; }`
      );
    }
    if (styles.inputErrorForeground) {
      content.push(
        `.validation-error { color: ${styles.inputErrorForeground}; }`
      );
    }
    if (styles.inputActiveBorder) {
      content.push(
        `input[type='text']:focus, textarea:focus, select:focus, summary:focus, button:focus, a:focus, .workbenchCommand:focus  { border: 1px solid ${styles.inputActiveBorder}; outline-style: none; }`
      );
    }
    if (styles.textLinkColor) {
      content.push(
        `a, .workbenchCommand { color: ${styles.textLinkColor}; }`
      );
    }
    if (styles.textLinkColor) {
      content.push(`a { color: ${styles.textLinkColor}; }`);
    }
    if (styles.textLinkActiveForeground) {
      content.push(
        `a:hover, .workbenchCommand:hover { color: ${styles.textLinkActiveForeground}; }`
      );
    }
    if (styles.sliderBackgroundColor) {
      content.push(
        `::-webkit-scrollbar-thumb { background-color: ${styles.sliderBackgroundColor}; }`
      );
    }
    if (styles.sliderActiveColor) {
      content.push(
        `::-webkit-scrollbar-thumb:active { background-color: ${styles.sliderActiveColor}; }`
      );
    }
    if (styles.sliderHoverColor) {
      content.push(
        `::--webkit-scrollbar-thumb:hover { background-color: ${styles.sliderHoverColor}; }`
      );
    }
    if (styles.buttonBackground) {
      content.push(
        `.monaco-text-button { background-color: ${styles.buttonBackground} !important; }`
      );
    }
    if (styles.buttonForeground) {
      content.push(
        `.monaco-text-button { color: ${styles.buttonForeground} !important; }`
      );
    }
    if (styles.buttonHoverBackground) {
      content.push(
        `.monaco-text-button:not(.disabled):hover, .monaco-text-button:focus { background-color: ${styles.buttonHoverBackground} !important; }`
      );
    }
    styleTag.textContent = content.join("\n");
    mainWindow.document.head.appendChild(styleTag);
    mainWindow.document.body.style.color = styles.color || "";
  }
  handleExtensionData(extensions) {
    const installedExtensions = extensions.filter((x) => !x.isBuiltin);
    const { nonThemes, themes } = groupBy(installedExtensions, (ext) => {
      return ext.isTheme ? "themes" : "nonThemes";
    });
    const numberOfThemeExtesions = themes && themes.length;
    this.issueReporterModel.update({
      numberOfThemeExtesions,
      enabledNonThemeExtesions: nonThemes,
      allExtensions: installedExtensions
    });
    this.updateExtensionTable(nonThemes, numberOfThemeExtesions);
    if (this.configuration.disableExtensions || installedExtensions.length === 0) {
      this.getElementById("disableExtensions").disabled = true;
    }
    this.updateExtensionSelector(installedExtensions);
  }
  async updateIssueReporterUri(extension) {
    try {
      if (extension.uri) {
        const uri = URI.revive(extension.uri);
        extension.bugsUrl = uri.toString();
      }
    } catch (e) {
      this.renderBlocks();
    }
  }
  async sendReporterMenu(extension) {
    try {
      const data = await this.issueMainService.$sendReporterMenu(
        extension.id,
        extension.name
      );
      return data;
    } catch (e) {
      console.error(e);
      return void 0;
    }
  }
  setEventHandlers() {
    this.addEventListener("issue-type", "change", (event) => {
      const issueType = Number.parseInt(
        event.target.value
      );
      this.issueReporterModel.update({ issueType });
      if (issueType === OldIssueType.PerformanceIssue && !this.receivedPerformanceInfo) {
        this.processMainService.$getPerformanceInfo().then((info) => {
          this.updatePerformanceInfo(
            info
          );
        });
      }
      const descriptionTextArea = this.getElementById("issue-title");
      if (descriptionTextArea) {
        descriptionTextArea.placeholder = localize(
          "undefinedPlaceholder",
          "Please enter a title"
        );
      }
      this.updatePreviewButtonState();
      this.setSourceOptions();
      this.render();
    });
    [
      "includeSystemInfo",
      "includeProcessInfo",
      "includeWorkspaceInfo",
      "includeExtensions",
      "includeExperiments",
      "includeExtensionData"
    ].forEach((elementId) => {
      this.addEventListener(elementId, "click", (event) => {
        event.stopPropagation();
        this.issueReporterModel.update({
          [elementId]: !this.issueReporterModel.getData()[elementId]
        });
      });
    });
    const showInfoElements = mainWindow.document.getElementsByClassName("showInfo");
    for (let i = 0; i < showInfoElements.length; i++) {
      const showInfo = showInfoElements.item(i);
      showInfo.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          const label = e.target;
          if (label) {
            const containingElement = label.parentElement && label.parentElement.parentElement;
            const info = containingElement && containingElement.lastElementChild;
            if (info && info.classList.contains("hidden")) {
              show(info);
              label.textContent = localize("hide", "hide");
            } else {
              hide(info);
              label.textContent = localize("show", "show");
            }
          }
        }
      );
    }
    this.addEventListener("issue-source", "change", (e) => {
      const value = e.target.value;
      const problemSourceHelpText = this.getElementById(
        "problem-source-help-text"
      );
      if (value === "") {
        this.issueReporterModel.update({ fileOnExtension: void 0 });
        show(problemSourceHelpText);
        this.clearSearchResults();
        this.render();
        return;
      } else {
        hide(problemSourceHelpText);
      }
      const descriptionTextArea = this.getElementById("issue-title");
      if (value === "vscode" /* VSCode */) {
        descriptionTextArea.placeholder = localize(
          "vscodePlaceholder",
          "E.g Workbench is missing problems panel"
        );
      } else if (value === "extension" /* Extension */) {
        descriptionTextArea.placeholder = localize(
          "extensionPlaceholder",
          "E.g. Missing alt text on extension readme image"
        );
      } else if (value === "marketplace" /* Marketplace */) {
        descriptionTextArea.placeholder = localize(
          "marketplacePlaceholder",
          "E.g Cannot disable installed extension"
        );
      } else {
        descriptionTextArea.placeholder = localize(
          "undefinedPlaceholder",
          "Please enter a title"
        );
      }
      let fileOnExtension, fileOnMarketplace = false;
      if (value === "extension" /* Extension */) {
        fileOnExtension = true;
      } else if (value === "marketplace" /* Marketplace */) {
        fileOnMarketplace = true;
      }
      this.issueReporterModel.update({
        fileOnExtension,
        fileOnMarketplace
      });
      this.render();
      const title = this.getElementById("issue-title").value;
      this.searchIssues(title, fileOnExtension, fileOnMarketplace);
    });
    this.addEventListener("description", "input", (e) => {
      const issueDescription = e.target.value;
      this.issueReporterModel.update({ issueDescription });
      if (this.issueReporterModel.fileOnExtension() === false) {
        const title = this.getElementById("issue-title").value;
        this.searchVSCodeIssues(title, issueDescription);
      }
    });
    this.addEventListener("issue-title", "input", (e) => {
      const title = e.target.value;
      const lengthValidationMessage = this.getElementById(
        "issue-title-length-validation-error"
      );
      const issueUrl = this.getIssueUrl();
      if (title && this.getIssueUrlWithTitle(title, issueUrl).length > MAX_URL_LENGTH) {
        show(lengthValidationMessage);
      } else {
        hide(lengthValidationMessage);
      }
      const issueSource = this.getElementById("issue-source");
      if (!issueSource || issueSource.value === "") {
        return;
      }
      const { fileOnExtension, fileOnMarketplace } = this.issueReporterModel.getData();
      this.searchIssues(title, fileOnExtension, fileOnMarketplace);
    });
    this.previewButton.onDidClick(async () => {
      this.delayedSubmit.trigger(async () => {
        this.createIssue();
      });
    });
    this.addEventListener("disableExtensions", "click", () => {
      this.issueMainService.$reloadWithExtensionsDisabled();
    });
    this.addEventListener("extensionBugsLink", "click", (e) => {
      const url = e.target.innerText;
      windowOpenNoOpener(url);
    });
    this.addEventListener("disableExtensions", "keydown", (e) => {
      e.stopPropagation();
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.issueMainService.$reloadWithExtensionsDisabled();
      }
    });
    mainWindow.document.onkeydown = async (e) => {
      const cmdOrCtrlKey = isMacintosh ? e.metaKey : e.ctrlKey;
      if (cmdOrCtrlKey && e.keyCode === 13) {
        this.delayedSubmit.trigger(async () => {
          if (await this.createIssue()) {
            this.close();
          }
        });
      }
      if (cmdOrCtrlKey && e.keyCode === 87) {
        e.stopPropagation();
        e.preventDefault();
        const issueTitle = this.getElementById("issue-title").value;
        const { issueDescription } = this.issueReporterModel.getData();
        if (!this.hasBeenSubmitted && (issueTitle || issueDescription)) {
          this.issueMainService.$showConfirmCloseDialog();
        } else {
          this.close();
        }
      }
      if (cmdOrCtrlKey && e.keyCode === 187) {
        zoomIn(mainWindow);
      }
      if (cmdOrCtrlKey && e.keyCode === 189) {
        zoomOut(mainWindow);
      }
      if (isMacintosh) {
        if (cmdOrCtrlKey && e.keyCode === 65 && e.target) {
          if (isHTMLInputElement(e.target) || isHTMLTextAreaElement(e.target)) {
            e.target.select();
          }
        }
      }
    };
  }
  updatePerformanceInfo(info) {
    this.issueReporterModel.update(info);
    this.receivedPerformanceInfo = true;
    const state = this.issueReporterModel.getData();
    this.updateProcessInfo(state);
    this.updateWorkspaceInfo(state);
    this.updatePreviewButtonState();
  }
  updatePreviewButtonState() {
    if (this.isPreviewEnabled()) {
      if (this.configuration.data.githubAccessToken) {
        this.previewButton.label = localize(
          "createOnGitHub",
          "Create on GitHub"
        );
      } else {
        this.previewButton.label = localize(
          "previewOnGitHub",
          "Preview on GitHub"
        );
      }
      this.previewButton.enabled = true;
    } else {
      this.previewButton.enabled = false;
      this.previewButton.label = localize(
        "loadingData",
        "Loading data..."
      );
    }
    const issueRepoName = this.getElementById(
      "show-repo-name"
    );
    const selectedExtension = this.issueReporterModel.getData().selectedExtension;
    if (selectedExtension && selectedExtension.uri) {
      const urlString = URI.revive(selectedExtension.uri).toString();
      issueRepoName.href = urlString;
      issueRepoName.addEventListener("click", (e) => this.openLink(e));
      issueRepoName.addEventListener(
        "auxclick",
        (e) => this.openLink(e)
      );
      const gitHubInfo = this.parseGitHubUrl(urlString);
      issueRepoName.textContent = gitHubInfo ? gitHubInfo.owner + "/" + gitHubInfo.repositoryName : urlString;
      Object.assign(issueRepoName.style, {
        alignSelf: "flex-end",
        display: "block",
        fontSize: "13px",
        marginBottom: "10px",
        padding: "4px 0px",
        textDecoration: "none",
        width: "auto"
      });
      show(issueRepoName);
    } else {
      issueRepoName.removeAttribute("style");
      hide(issueRepoName);
    }
    this.getExtensionGitHubUrl();
  }
  isPreviewEnabled() {
    const issueType = this.issueReporterModel.getData().issueType;
    if (this.loadingExtensionData) {
      return false;
    }
    if (issueType === OldIssueType.Bug && this.receivedSystemInfo) {
      return true;
    }
    if (issueType === OldIssueType.PerformanceIssue && this.receivedSystemInfo && this.receivedPerformanceInfo) {
      return true;
    }
    if (issueType === OldIssueType.FeatureRequest) {
      return true;
    }
    return false;
  }
  getExtensionRepositoryUrl() {
    const selectedExtension = this.issueReporterModel.getData().selectedExtension;
    return selectedExtension && selectedExtension.repositoryUrl;
  }
  getExtensionBugsUrl() {
    const selectedExtension = this.issueReporterModel.getData().selectedExtension;
    return selectedExtension && selectedExtension.bugsUrl;
  }
  searchVSCodeIssues(title, issueDescription) {
    if (title) {
      this.searchDuplicates(title, issueDescription);
    } else {
      this.clearSearchResults();
    }
  }
  searchIssues(title, fileOnExtension, fileOnMarketplace) {
    if (fileOnExtension) {
      return this.searchExtensionIssues(title);
    }
    if (fileOnMarketplace) {
      return this.searchMarketplaceIssues(title);
    }
    const description = this.issueReporterModel.getData().issueDescription;
    this.searchVSCodeIssues(title, description);
  }
  searchExtensionIssues(title) {
    const url = this.getExtensionGitHubUrl();
    if (title) {
      const matches = /^https?:\/\/github\.com\/(.*)/.exec(url);
      if (matches && matches.length) {
        const repo = matches[1];
        return this.searchGitHub(repo, title);
      }
      if (this.issueReporterModel.getData().selectedExtension) {
        this.clearSearchResults();
        return this.displaySearchResults([]);
      }
    }
    this.clearSearchResults();
  }
  searchMarketplaceIssues(title) {
    if (title) {
      const gitHubInfo = this.parseGitHubUrl(
        this.configuration.product.reportMarketplaceIssueUrl
      );
      if (gitHubInfo) {
        return this.searchGitHub(
          `${gitHubInfo.owner}/${gitHubInfo.repositoryName}`,
          title
        );
      }
    }
  }
  async close() {
    await this.issueMainService.$closeReporter();
  }
  clearSearchResults() {
    const similarIssues = this.getElementById("similar-issues");
    similarIssues.innerText = "";
    this.numberOfSearchResultsDisplayed = 0;
  }
  searchGitHub(repo, title) {
    const query = `is:issue+repo:${repo}+${title}`;
    const similarIssues = this.getElementById("similar-issues");
    fetch(`https://api.github.com/search/issues?q=${query}`).then((response) => {
      response.json().then((result) => {
        similarIssues.innerText = "";
        if (result && result.items) {
          this.displaySearchResults(result.items);
        } else {
          const message = $("div.list-title");
          message.textContent = localize(
            "rateLimited",
            "GitHub query limit exceeded. Please wait."
          );
          similarIssues.appendChild(message);
          const resetTime = response.headers.get("X-RateLimit-Reset");
          const timeToWait = resetTime ? Number.parseInt(resetTime) - Math.floor(Date.now() / 1e3) : 1;
          if (this.shouldQueueSearch) {
            this.shouldQueueSearch = false;
            setTimeout(() => {
              this.searchGitHub(repo, title);
              this.shouldQueueSearch = true;
            }, timeToWait * 1e3);
          }
        }
      }).catch((_) => {
      });
    }).catch((_) => {
    });
  }
  searchDuplicates(title, body) {
    const url = "https://vscode-probot.westus.cloudapp.azure.com:7890/duplicate_candidates";
    const init = {
      method: "POST",
      body: JSON.stringify({
        title,
        body
      }),
      headers: new Headers({
        "Content-Type": "application/json"
      })
    };
    fetch(url, init).then((response) => {
      response.json().then((result) => {
        this.clearSearchResults();
        if (result && result.candidates) {
          this.displaySearchResults(result.candidates);
        } else {
          throw new Error(
            "Unexpected response, no candidates property"
          );
        }
      }).catch((_) => {
      });
    }).catch((_) => {
    });
  }
  displaySearchResults(results) {
    const similarIssues = this.getElementById("similar-issues");
    if (results.length) {
      const issues = $("div.issues-container");
      const issuesText = $("div.list-title");
      issuesText.textContent = localize(
        "similarIssues",
        "Similar issues"
      );
      this.numberOfSearchResultsDisplayed = results.length < 5 ? results.length : 5;
      for (let i = 0; i < this.numberOfSearchResultsDisplayed; i++) {
        const issue = results[i];
        const link = $("a.issue-link", { href: issue.html_url });
        link.textContent = issue.title;
        link.title = issue.title;
        link.addEventListener("click", (e) => this.openLink(e));
        link.addEventListener(
          "auxclick",
          (e) => this.openLink(e)
        );
        let issueState;
        let item;
        if (issue.state) {
          issueState = $("span.issue-state");
          const issueIcon = $("span.issue-icon");
          issueIcon.appendChild(
            renderIcon(
              issue.state === "open" ? Codicon.issueOpened : Codicon.issueClosed
            )
          );
          const issueStateLabel = $("span.issue-state.label");
          issueStateLabel.textContent = issue.state === "open" ? localize("open", "Open") : localize("closed", "Closed");
          issueState.title = issue.state === "open" ? localize("open", "Open") : localize("closed", "Closed");
          issueState.appendChild(issueIcon);
          issueState.appendChild(issueStateLabel);
          item = $("div.issue", void 0, issueState, link);
        } else {
          item = $("div.issue", void 0, link);
        }
        issues.appendChild(item);
      }
      similarIssues.appendChild(issuesText);
      similarIssues.appendChild(issues);
    } else {
      const message = $("div.list-title");
      message.textContent = localize(
        "noSimilarIssues",
        "No similar issues found"
      );
      similarIssues.appendChild(message);
    }
  }
  setUpTypes() {
    const makeOption = /* @__PURE__ */ __name((issueType2, description) => $("option", { value: issueType2.valueOf() }, escape(description)), "makeOption");
    const typeSelect = this.getElementById(
      "issue-type"
    );
    const { issueType } = this.issueReporterModel.getData();
    reset(
      typeSelect,
      makeOption(OldIssueType.Bug, localize("bugReporter", "Bug Report")),
      makeOption(
        OldIssueType.FeatureRequest,
        localize("featureRequest", "Feature Request")
      ),
      makeOption(
        OldIssueType.PerformanceIssue,
        localize(
          "performanceIssue",
          "Performance Issue (freeze, slow, crash)"
        )
      )
    );
    typeSelect.value = issueType.toString();
    this.setSourceOptions();
  }
  makeOption(value, description, disabled) {
    const option = document.createElement("option");
    option.disabled = disabled;
    option.value = value;
    option.textContent = description;
    return option;
  }
  setSourceOptions() {
    const sourceSelect = this.getElementById(
      "issue-source"
    );
    const {
      issueType,
      fileOnExtension,
      selectedExtension,
      fileOnMarketplace,
      fileOnProduct
    } = this.issueReporterModel.getData();
    let selected = sourceSelect.selectedIndex;
    if (selected === -1) {
      if (fileOnExtension !== void 0) {
        selected = fileOnExtension ? 2 : 1;
      } else if (selectedExtension?.isBuiltin) {
        selected = 1;
      } else if (fileOnMarketplace) {
        selected = 3;
      } else if (fileOnProduct) {
        selected = 1;
      }
    }
    sourceSelect.innerText = "";
    sourceSelect.append(
      this.makeOption(
        "",
        localize("selectSource", "Select source"),
        true
      )
    );
    sourceSelect.append(
      this.makeOption(
        "vscode" /* VSCode */,
        localize("vscode", "Visual Studio Code"),
        false
      )
    );
    sourceSelect.append(
      this.makeOption(
        "extension" /* Extension */,
        localize("extension", "A VS Code extension"),
        false
      )
    );
    if (this.configuration.product.reportMarketplaceIssueUrl) {
      sourceSelect.append(
        this.makeOption(
          "marketplace" /* Marketplace */,
          localize("marketplace", "Extensions Marketplace"),
          false
        )
      );
    }
    if (issueType !== OldIssueType.FeatureRequest) {
      sourceSelect.append(
        this.makeOption(
          "unknown" /* Unknown */,
          localize("unknown", "Don't know"),
          false
        )
      );
    }
    if (selected !== -1 && selected < sourceSelect.options.length) {
      sourceSelect.selectedIndex = selected;
    } else {
      sourceSelect.selectedIndex = 0;
      hide(this.getElementById("problem-source-help-text"));
    }
  }
  renderBlocks() {
    const {
      issueType,
      fileOnExtension,
      fileOnMarketplace,
      selectedExtension
    } = this.issueReporterModel.getData();
    const blockContainer = this.getElementById("block-container");
    const systemBlock = mainWindow.document.querySelector(".block-system");
    const processBlock = mainWindow.document.querySelector(".block-process");
    const workspaceBlock = mainWindow.document.querySelector(".block-workspace");
    const extensionsBlock = mainWindow.document.querySelector(".block-extensions");
    const experimentsBlock = mainWindow.document.querySelector(".block-experiments");
    const extensionDataBlock = mainWindow.document.querySelector(
      ".block-extension-data"
    );
    const problemSource = this.getElementById("problem-source");
    const descriptionTitle = this.getElementById(
      "issue-description-label"
    );
    const descriptionSubtitle = this.getElementById(
      "issue-description-subtitle"
    );
    const extensionSelector = this.getElementById("extension-selection");
    const titleTextArea = this.getElementById("issue-title-container");
    const descriptionTextArea = this.getElementById("description");
    const extensionDataTextArea = this.getElementById("extension-data");
    hide(blockContainer);
    hide(systemBlock);
    hide(processBlock);
    hide(workspaceBlock);
    hide(extensionsBlock);
    hide(experimentsBlock);
    hide(extensionSelector);
    hide(extensionDataTextArea);
    hide(extensionDataBlock);
    show(problemSource);
    show(titleTextArea);
    show(descriptionTextArea);
    if (fileOnExtension) {
      show(extensionSelector);
    }
    if (selectedExtension && this.nonGitHubIssueUrl) {
      hide(titleTextArea);
      hide(descriptionTextArea);
      reset(
        descriptionTitle,
        localize(
          "handlesIssuesElsewhere",
          "This extension handles issues outside of VS Code"
        )
      );
      reset(
        descriptionSubtitle,
        localize(
          "elsewhereDescription",
          "The '{0}' extension prefers to use an external issue reporter. To be taken to that issue reporting experience, click the button below.",
          selectedExtension.displayName
        )
      );
      this.previewButton.label = localize(
        "openIssueReporter",
        "Open External Issue Reporter"
      );
      return;
    }
    if (fileOnExtension && selectedExtension?.data) {
      const data = selectedExtension?.data;
      extensionDataTextArea.innerText = data.toString();
      extensionDataTextArea.readOnly = true;
      show(extensionDataBlock);
    }
    if (fileOnExtension && this.openReporter) {
      extensionDataTextArea.readOnly = true;
      setTimeout(() => {
        if (this.openReporter) {
          show(extensionDataBlock);
        }
      }, 100);
    }
    if (issueType === OldIssueType.Bug) {
      if (!fileOnMarketplace) {
        show(blockContainer);
        show(systemBlock);
        show(experimentsBlock);
        if (!fileOnExtension) {
          show(extensionsBlock);
        }
      }
      reset(
        descriptionTitle,
        localize("stepsToReproduce", "Steps to Reproduce") + " ",
        $("span.required-input", void 0, "*")
      );
      reset(
        descriptionSubtitle,
        localize(
          "bugDescription",
          "Share the steps needed to reliably reproduce the problem. Please include actual and expected results. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."
        )
      );
    } else if (issueType === OldIssueType.PerformanceIssue) {
      if (!fileOnMarketplace) {
        show(blockContainer);
        show(systemBlock);
        show(processBlock);
        show(workspaceBlock);
        show(experimentsBlock);
      }
      if (fileOnExtension) {
        show(extensionSelector);
      } else if (!fileOnMarketplace) {
        show(extensionsBlock);
      }
      reset(
        descriptionTitle,
        localize("stepsToReproduce", "Steps to Reproduce") + " ",
        $("span.required-input", void 0, "*")
      );
      reset(
        descriptionSubtitle,
        localize(
          "performanceIssueDesciption",
          "When did this performance issue happen? Does it occur on startup or after a specific series of actions? We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."
        )
      );
    } else if (issueType === OldIssueType.FeatureRequest) {
      reset(
        descriptionTitle,
        localize("description", "Description") + " ",
        $("span.required-input", void 0, "*")
      );
      reset(
        descriptionSubtitle,
        localize(
          "featureRequestDescription",
          "Please describe the feature you would like to see. We support GitHub-flavored Markdown. You will be able to edit your issue and add screenshots when we preview it on GitHub."
        )
      );
    }
  }
  validateInput(inputId) {
    const inputElement = this.getElementById(inputId);
    const inputValidationMessage = this.getElementById(
      `${inputId}-empty-error`
    );
    const descriptionShortMessage = this.getElementById(
      `description-short-error`
    );
    if (!inputElement.value) {
      inputElement.classList.add("invalid-input");
      inputValidationMessage?.classList.remove("hidden");
      descriptionShortMessage?.classList.add("hidden");
      return false;
    } else if (inputId === "description" && inputElement.value.length < 10) {
      inputElement.classList.add("invalid-input");
      descriptionShortMessage?.classList.remove("hidden");
      inputValidationMessage?.classList.add("hidden");
      return false;
    } else {
      inputElement.classList.remove("invalid-input");
      inputValidationMessage?.classList.add("hidden");
      if (inputId === "description") {
        descriptionShortMessage?.classList.add("hidden");
      }
      return true;
    }
  }
  validateInputs() {
    let isValid = true;
    ["issue-title", "description", "issue-source"].forEach((elementId) => {
      isValid = this.validateInput(elementId) && isValid;
    });
    if (this.issueReporterModel.fileOnExtension()) {
      isValid = this.validateInput("extension-selector") && isValid;
    }
    return isValid;
  }
  async submitToGitHub(issueTitle, issueBody, gitHubDetails) {
    const url = `https://api.github.com/repos/${gitHubDetails.owner}/${gitHubDetails.repositoryName}/issues`;
    const init = {
      method: "POST",
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody
      }),
      headers: new Headers({
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.configuration.data.githubAccessToken}`
      })
    };
    const response = await fetch(url, init);
    if (!response.ok) {
      console.error("Invalid GitHub URL provided.");
      return false;
    }
    const result = await response.json();
    await this.nativeHostService.openExternal(result.html_url);
    this.close();
    return true;
  }
  async createIssue() {
    const selectedExtension = this.issueReporterModel.getData().selectedExtension;
    const hasUri = this.nonGitHubIssueUrl;
    if (hasUri) {
      const url2 = this.getExtensionBugsUrl();
      if (url2) {
        this.hasBeenSubmitted = true;
        await this.nativeHostService.openExternal(url2);
        return true;
      }
    }
    if (!this.validateInputs()) {
      const invalidInput = mainWindow.document.getElementsByClassName("invalid-input");
      if (invalidInput.length) {
        invalidInput[0].focus();
      }
      this.addEventListener("issue-title", "input", (_) => {
        this.validateInput("issue-title");
      });
      this.addEventListener("description", "input", (_) => {
        this.validateInput("description");
      });
      this.addEventListener("issue-source", "change", (_) => {
        this.validateInput("issue-source");
      });
      if (this.issueReporterModel.fileOnExtension()) {
        this.addEventListener("extension-selector", "change", (_) => {
          this.validateInput("extension-selector");
        });
      }
      return false;
    }
    this.hasBeenSubmitted = true;
    const issueTitle = this.getElementById("issue-title").value;
    const issueBody = this.issueReporterModel.serialize();
    let issueUrl = this.getIssueUrl();
    if (!issueUrl) {
      console.error("No issue url found");
      return false;
    }
    if (selectedExtension?.uri) {
      const uri = URI.revive(selectedExtension.uri);
      issueUrl = uri.toString();
    }
    const gitHubDetails = this.parseGitHubUrl(issueUrl);
    const baseUrl = this.getIssueUrlWithTitle(
      this.getElementById("issue-title").value,
      issueUrl
    );
    let url = baseUrl + `&body=${encodeURIComponent(issueBody)}`;
    if (url.length > MAX_URL_LENGTH) {
      try {
        url = await this.writeToClipboard(baseUrl, issueBody);
      } catch (_) {
        console.error("Writing to clipboard failed");
        return false;
      }
    } else if (this.configuration.data.githubAccessToken && gitHubDetails) {
      return this.submitToGitHub(issueTitle, issueBody, gitHubDetails);
    }
    await this.nativeHostService.openExternal(url);
    return true;
  }
  async writeToClipboard(baseUrl, issueBody) {
    const shouldWrite = await this.issueMainService.$showClipboardDialog();
    if (!shouldWrite) {
      throw new CancellationError();
    }
    await this.nativeHostService.writeClipboardText(issueBody);
    return baseUrl + `&body=${encodeURIComponent(localize("pasteData", "We have written the needed data into your clipboard because it was too large to send. Please paste."))}`;
  }
  getIssueUrl() {
    return this.issueReporterModel.fileOnExtension() ? this.getExtensionGitHubUrl() : this.issueReporterModel.getData().fileOnMarketplace ? this.configuration.product.reportMarketplaceIssueUrl : this.configuration.product.reportIssueUrl;
  }
  parseGitHubUrl(url) {
    const match = /^https?:\/\/github\.com\/([^/]*)\/([^/]*).*/.exec(url);
    if (match && match.length) {
      return {
        owner: match[1],
        repositoryName: match[2]
      };
    } else {
      console.error("No GitHub issues match");
    }
    return void 0;
  }
  getExtensionGitHubUrl() {
    let repositoryUrl = "";
    const bugsUrl = this.getExtensionBugsUrl();
    const extensionUrl = this.getExtensionRepositoryUrl();
    if (bugsUrl && bugsUrl.match(
      /^https?:\/\/github\.com\/([^/]*)\/([^/]*)\/?(\/issues)?$/
    )) {
      repositoryUrl = normalizeGitHubUrl(bugsUrl);
    } else if (extensionUrl && extensionUrl.match(/^https?:\/\/github\.com\/([^/]*)\/([^/]*)$/)) {
      repositoryUrl = normalizeGitHubUrl(extensionUrl);
    } else {
      this.nonGitHubIssueUrl = true;
      repositoryUrl = bugsUrl || extensionUrl || "";
    }
    return repositoryUrl;
  }
  getIssueUrlWithTitle(issueTitle, repositoryUrl) {
    if (this.issueReporterModel.fileOnExtension()) {
      repositoryUrl = repositoryUrl + "/issues/new";
    }
    const queryStringPrefix = repositoryUrl.indexOf("?") === -1 ? "?" : "&";
    return `${repositoryUrl}${queryStringPrefix}title=${encodeURIComponent(issueTitle)}`;
  }
  updateSystemInfo(state) {
    const target = mainWindow.document.querySelector(
      ".block-system .block-info"
    );
    if (target) {
      const systemInfo = state.systemInfo;
      const renderedDataTable = $(
        "table",
        void 0,
        $(
          "tr",
          void 0,
          $("td", void 0, "CPUs"),
          $("td", void 0, systemInfo.cpus || "")
        ),
        $(
          "tr",
          void 0,
          $("td", void 0, "GPU Status"),
          $(
            "td",
            void 0,
            Object.keys(systemInfo.gpuStatus).map(
              (key) => `${key}: ${systemInfo.gpuStatus[key]}`
            ).join("\n")
          )
        ),
        $(
          "tr",
          void 0,
          $("td", void 0, "Load (avg)"),
          $("td", void 0, systemInfo.load || "")
        ),
        $(
          "tr",
          void 0,
          $("td", void 0, "Memory (System)"),
          $("td", void 0, systemInfo.memory)
        ),
        $(
          "tr",
          void 0,
          $("td", void 0, "Process Argv"),
          $("td", void 0, systemInfo.processArgs)
        ),
        $(
          "tr",
          void 0,
          $("td", void 0, "Screen Reader"),
          $("td", void 0, systemInfo.screenReader)
        ),
        $(
          "tr",
          void 0,
          $("td", void 0, "VM"),
          $("td", void 0, systemInfo.vmHint)
        )
      );
      reset(target, renderedDataTable);
      systemInfo.remoteData.forEach((remote) => {
        target.appendChild($("hr"));
        if (isRemoteDiagnosticError(remote)) {
          const remoteDataTable = $(
            "table",
            void 0,
            $(
              "tr",
              void 0,
              $("td", void 0, "Remote"),
              $("td", void 0, remote.hostName)
            ),
            $(
              "tr",
              void 0,
              $("td", void 0, ""),
              $("td", void 0, remote.errorMessage)
            )
          );
          target.appendChild(remoteDataTable);
        } else {
          const remoteDataTable = $(
            "table",
            void 0,
            $(
              "tr",
              void 0,
              $("td", void 0, "Remote"),
              $(
                "td",
                void 0,
                remote.latency ? `${remote.hostName} (latency: ${remote.latency.current.toFixed(2)}ms last, ${remote.latency.average.toFixed(2)}ms average)` : remote.hostName
              )
            ),
            $(
              "tr",
              void 0,
              $("td", void 0, "OS"),
              $("td", void 0, remote.machineInfo.os)
            ),
            $(
              "tr",
              void 0,
              $("td", void 0, "CPUs"),
              $("td", void 0, remote.machineInfo.cpus || "")
            ),
            $(
              "tr",
              void 0,
              $("td", void 0, "Memory (System)"),
              $("td", void 0, remote.machineInfo.memory)
            ),
            $(
              "tr",
              void 0,
              $("td", void 0, "VM"),
              $("td", void 0, remote.machineInfo.vmHint)
            )
          );
          target.appendChild(remoteDataTable);
        }
      });
    }
  }
  updateExtensionSelector(extensions) {
    const extensionOptions = extensions.map((extension) => {
      return {
        name: extension.displayName || extension.name || "",
        id: extension.id
      };
    });
    extensionOptions.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      if (aName > bName) {
        return 1;
      }
      if (aName < bName) {
        return -1;
      }
      return 0;
    });
    const makeOption = /* @__PURE__ */ __name((extension, selectedExtension) => {
      const selected = selectedExtension && extension.id === selectedExtension.id;
      return $(
        "option",
        {
          value: extension.id,
          selected: selected || ""
        },
        extension.name
      );
    }, "makeOption");
    const extensionsSelector = this.getElementById("extension-selector");
    if (extensionsSelector) {
      const { selectedExtension } = this.issueReporterModel.getData();
      reset(
        extensionsSelector,
        this.makeOption(
          "",
          localize("selectExtension", "Select extension"),
          true
        ),
        ...extensionOptions.map(
          (extension) => makeOption(extension, selectedExtension)
        )
      );
      if (!selectedExtension) {
        extensionsSelector.selectedIndex = 0;
      }
      this.addEventListener(
        "extension-selector",
        "change",
        async (e) => {
          this.clearExtensionData();
          const selectedExtensionId = e.target.value;
          this.selectedExtension = selectedExtensionId;
          const extensions2 = this.issueReporterModel.getData().allExtensions;
          const matches = extensions2.filter(
            (extension) => extension.id === selectedExtensionId
          );
          if (matches.length) {
            this.issueReporterModel.update({
              selectedExtension: matches[0]
            });
            const selectedExtension2 = this.issueReporterModel.getData().selectedExtension;
            if (selectedExtension2) {
              const iconElement = document.createElement("span");
              iconElement.classList.add(
                ...ThemeIcon.asClassNameArray(Codicon.loading),
                "codicon-modifier-spin"
              );
              this.setLoading(iconElement);
              const openReporterData = await this.sendReporterMenu(selectedExtension2);
              if (openReporterData) {
                if (this.selectedExtension === selectedExtensionId) {
                  this.removeLoading(iconElement, true);
                  this.configuration.data = openReporterData;
                } else if (this.selectedExtension !== selectedExtensionId) {
                }
              } else {
                if (!this.loadingExtensionData) {
                  iconElement.classList.remove(
                    ...ThemeIcon.asClassNameArray(
                      Codicon.loading
                    ),
                    "codicon-modifier-spin"
                  );
                }
                this.removeLoading(iconElement);
                this.clearExtensionData();
                selectedExtension2.data = void 0;
                selectedExtension2.uri = void 0;
              }
              if (this.selectedExtension === selectedExtensionId) {
                this.updateExtensionStatus(matches[0]);
                this.openReporter = false;
              }
            } else {
              this.issueReporterModel.update({
                selectedExtension: void 0
              });
              this.clearSearchResults();
              this.clearExtensionData();
              this.validateSelectedExtension();
              this.updateExtensionStatus(matches[0]);
            }
          }
        }
      );
    }
    this.addEventListener("problem-source", "change", (_) => {
      this.validateSelectedExtension();
    });
  }
  clearExtensionData() {
    this.nonGitHubIssueUrl = false;
    this.issueReporterModel.update({ extensionData: void 0 });
    this.configuration.data.issueBody = void 0;
    this.configuration.data.data = void 0;
    this.configuration.data.uri = void 0;
  }
  async updateExtensionStatus(extension) {
    this.issueReporterModel.update({ selectedExtension: extension });
    const template = this.configuration.data.issueBody;
    if (template) {
      const descriptionTextArea = this.getElementById("description");
      const descriptionText = descriptionTextArea.value;
      if (descriptionText === "" || !descriptionText.includes(template.toString())) {
        const fullTextArea = descriptionText + (descriptionText === "" ? "" : "\n") + template.toString();
        descriptionTextArea.value = fullTextArea;
        this.issueReporterModel.update({
          issueDescription: fullTextArea
        });
      }
    }
    const data = this.configuration.data.data;
    if (data) {
      this.issueReporterModel.update({ extensionData: data });
      extension.data = data;
      const extensionDataBlock = mainWindow.document.querySelector(
        ".block-extension-data"
      );
      show(extensionDataBlock);
      this.renderBlocks();
    }
    const uri = this.configuration.data.uri;
    if (uri) {
      extension.uri = uri;
      this.updateIssueReporterUri(extension);
    }
    this.validateSelectedExtension();
    const title = this.getElementById("issue-title").value;
    this.searchExtensionIssues(title);
    this.updatePreviewButtonState();
    this.renderBlocks();
  }
  validateSelectedExtension() {
    const extensionValidationMessage = this.getElementById(
      "extension-selection-validation-error"
    );
    const extensionValidationNoUrlsMessage = this.getElementById(
      "extension-selection-validation-error-no-url"
    );
    hide(extensionValidationMessage);
    hide(extensionValidationNoUrlsMessage);
    const extension = this.issueReporterModel.getData().selectedExtension;
    if (!extension) {
      this.previewButton.enabled = true;
      return;
    }
    if (this.loadingExtensionData) {
      return;
    }
    const hasValidGitHubUrl = this.getExtensionGitHubUrl();
    if (hasValidGitHubUrl) {
      this.previewButton.enabled = true;
    } else {
      this.setExtensionValidationMessage();
      this.previewButton.enabled = false;
    }
  }
  setLoading(element) {
    this.openReporter = true;
    this.loadingExtensionData = true;
    this.updatePreviewButtonState();
    const extensionDataCaption = this.getElementById("extension-id");
    hide(extensionDataCaption);
    const extensionDataCaption2 = Array.from(
      mainWindow.document.querySelectorAll(".ext-parens")
    );
    extensionDataCaption2.forEach(
      (extensionDataCaption22) => hide(extensionDataCaption22)
    );
    const showLoading = this.getElementById("ext-loading");
    show(showLoading);
    while (showLoading.firstChild) {
      showLoading.firstChild.remove();
    }
    showLoading.append(element);
    this.renderBlocks();
  }
  removeLoading(element, fromReporter = false) {
    this.openReporter = fromReporter;
    this.loadingExtensionData = false;
    this.updatePreviewButtonState();
    const extensionDataCaption = this.getElementById("extension-id");
    show(extensionDataCaption);
    const extensionDataCaption2 = Array.from(
      mainWindow.document.querySelectorAll(".ext-parens")
    );
    extensionDataCaption2.forEach(
      (extensionDataCaption22) => show(extensionDataCaption22)
    );
    const hideLoading = this.getElementById("ext-loading");
    hide(hideLoading);
    if (hideLoading.firstChild) {
      element.remove();
    }
    this.renderBlocks();
  }
  setExtensionValidationMessage() {
    const extensionValidationMessage = this.getElementById(
      "extension-selection-validation-error"
    );
    const extensionValidationNoUrlsMessage = this.getElementById(
      "extension-selection-validation-error-no-url"
    );
    const bugsUrl = this.getExtensionBugsUrl();
    if (bugsUrl) {
      show(extensionValidationMessage);
      const link = this.getElementById("extensionBugsLink");
      link.textContent = bugsUrl;
      return;
    }
    const extensionUrl = this.getExtensionRepositoryUrl();
    if (extensionUrl) {
      show(extensionValidationMessage);
      const link = this.getElementById("extensionBugsLink");
      link.textContent = extensionUrl;
      return;
    }
    show(extensionValidationNoUrlsMessage);
  }
  updateProcessInfo(state) {
    const target = mainWindow.document.querySelector(
      ".block-process .block-info"
    );
    if (target) {
      reset(target, $("code", void 0, state.processInfo ?? ""));
    }
  }
  updateWorkspaceInfo(state) {
    mainWindow.document.querySelector(
      ".block-workspace .block-info code"
    ).textContent = "\n" + state.workspaceInfo;
  }
  updateExtensionTable(extensions, numThemeExtensions) {
    const target = mainWindow.document.querySelector(
      ".block-extensions .block-info"
    );
    if (target) {
      if (this.configuration.disableExtensions) {
        reset(
          target,
          localize("disabledExtensions", "Extensions are disabled")
        );
        return;
      }
      const themeExclusionStr = numThemeExtensions ? `
(${numThemeExtensions} theme extensions excluded)` : "";
      extensions = extensions || [];
      if (!extensions.length) {
        target.innerText = "Extensions: none" + themeExclusionStr;
        return;
      }
      reset(
        target,
        this.getExtensionTableHtml(extensions),
        document.createTextNode(themeExclusionStr)
      );
    }
  }
  updateRestrictedMode(restrictedMode) {
    this.issueReporterModel.update({ restrictedMode });
  }
  updateUnsupportedMode(isUnsupported) {
    this.issueReporterModel.update({ isUnsupported });
  }
  updateExperimentsInfo(experimentInfo) {
    this.issueReporterModel.update({ experimentInfo });
    const target = mainWindow.document.querySelector(
      ".block-experiments .block-info"
    );
    if (target) {
      target.textContent = experimentInfo ? experimentInfo : localize("noCurrentExperiments", "No current experiments.");
    }
  }
  getExtensionTableHtml(extensions) {
    return $(
      "table",
      void 0,
      $(
        "tr",
        void 0,
        $("th", void 0, "Extension"),
        $("th", void 0, "Author (truncated)"),
        $("th", void 0, "Version")
      ),
      ...extensions.map(
        (extension) => $(
          "tr",
          void 0,
          $("td", void 0, extension.name),
          $(
            "td",
            void 0,
            extension.publisher?.substr(0, 3) ?? "N/A"
          ),
          $("td", void 0, extension.version)
        )
      )
    );
  }
  openLink(event) {
    event.preventDefault();
    event.stopPropagation();
    if (event.which < 3) {
      windowOpenNoOpener(event.target.href);
    }
  }
  getElementById(elementId) {
    const element = mainWindow.document.getElementById(elementId);
    if (element) {
      return element;
    } else {
      return void 0;
    }
  }
  addEventListener(elementId, eventType, handler) {
    const element = this.getElementById(elementId);
    element?.addEventListener(eventType, handler);
  }
};
__decorateClass([
  debounce(300)
], IssueReporter.prototype, "searchGitHub", 1);
__decorateClass([
  debounce(300)
], IssueReporter.prototype, "searchDuplicates", 1);
IssueReporter = __decorateClass([
  __decorateParam(1, INativeHostService),
  __decorateParam(2, IIssueMainService),
  __decorateParam(3, IProcessMainService)
], IssueReporter);
function hide(el) {
  el?.classList.add("hidden");
}
__name(hide, "hide");
function show(el) {
  el?.classList.remove("hidden");
}
__name(show, "show");
export {
  IssueReporter,
  hide,
  show
};
//# sourceMappingURL=issueReporterService.js.map
