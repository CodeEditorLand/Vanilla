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
import { $, reset } from "../../../../base/browser/dom.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { URI } from "../../../../base/common/uri.js";
import { localize } from "../../../../nls.js";
import { isRemoteDiagnosticError } from "../../../../platform/diagnostics/common/diagnostics.js";
import { IProcessMainService } from "../../../../platform/issue/common/issue.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { applyZoom } from "../../../../platform/window/electron-sandbox/window.js";
import { BaseIssueReporterService } from "../browser/baseIssueReporterService.js";
import {
  IIssueFormService,
  IssueType
} from "../common/issue.js";
const MAX_URL_LENGTH = 7500;
let IssueReporter2 = class extends BaseIssueReporterService {
  constructor(disableExtensions, data, os, product, window, nativeHostService, issueFormService, processMainService, themeService) {
    super(disableExtensions, data, os, product, window, false, issueFormService, themeService);
    this.nativeHostService = nativeHostService;
    this.processMainService = processMainService;
    this.processMainService.$getSystemInfo().then((info) => {
      this.issueReporterModel.update({ systemInfo: info });
      this.receivedSystemInfo = true;
      this.updateSystemInfo(this.issueReporterModel.getData());
      this.updatePreviewButtonState();
    });
    if (this.data.issueType === IssueType.PerformanceIssue) {
      this.processMainService.$getPerformanceInfo().then((info) => {
        this.updatePerformanceInfo(info);
      });
    }
    this.setEventHandlers();
    applyZoom(this.data.zoomLevel, this.window);
    this.updateExperimentsInfo(this.data.experiments);
    this.updateRestrictedMode(this.data.restrictedMode);
    this.updateUnsupportedMode(this.data.isUnsupported);
  }
  processMainService;
  setEventHandlers() {
    super.setEventHandlers();
    this.addEventListener("issue-type", "change", (event) => {
      const issueType = Number.parseInt(
        event.target.value
      );
      this.issueReporterModel.update({ issueType });
      if (issueType === IssueType.PerformanceIssue && !this.receivedPerformanceInfo) {
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
        Authorization: `Bearer ${this.data.githubAccessToken}`
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
      const invalidInput = this.window.document.getElementsByClassName("invalid-input");
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
          this.validateInput("description");
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
    } else if (this.data.githubAccessToken && gitHubDetails) {
      return this.submitToGitHub(issueTitle, issueBody, gitHubDetails);
    }
    await this.nativeHostService.openExternal(url);
    return true;
  }
  async writeToClipboard(baseUrl, issueBody) {
    const shouldWrite = await this.issueFormService.showClipboardDialog();
    if (!shouldWrite) {
      throw new CancellationError();
    }
    await this.nativeHostService.writeClipboardText(issueBody);
    return baseUrl + `&body=${encodeURIComponent(localize("pasteData", "We have written the needed data into your clipboard because it was too large to send. Please paste."))}`;
  }
  updateSystemInfo(state) {
    const target = this.window.document.querySelector(
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
  updateRestrictedMode(restrictedMode) {
    this.issueReporterModel.update({ restrictedMode });
  }
  updateUnsupportedMode(isUnsupported) {
    this.issueReporterModel.update({ isUnsupported });
  }
  updateExperimentsInfo(experimentInfo) {
    this.issueReporterModel.update({ experimentInfo });
    const target = this.window.document.querySelector(
      ".block-experiments .block-info"
    );
    if (target) {
      target.textContent = experimentInfo ? experimentInfo : localize("noCurrentExperiments", "No current experiments.");
    }
  }
};
IssueReporter2 = __decorateClass([
  __decorateParam(5, INativeHostService),
  __decorateParam(6, IIssueFormService),
  __decorateParam(7, IProcessMainService),
  __decorateParam(8, IThemeService)
], IssueReporter2);
export {
  IssueReporter2
};
