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
import { basename, dirname } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../nls.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { INativeHostService } from "../../../../platform/native/common/native.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { INativeWorkbenchEnvironmentService } from "../../../services/environment/electron-sandbox/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import {
  ILifecycleService,
  LifecyclePhase
} from "../../../services/lifecycle/common/lifecycle.js";
import { PerfviewContrib } from "../browser/perfviewEditor.js";
let StartupProfiler = class {
  constructor(_dialogService, _environmentService, _textModelResolverService, _clipboardService, lifecycleService, extensionService, _openerService, _nativeHostService, _productService, _fileService, _labelService) {
    this._dialogService = _dialogService;
    this._environmentService = _environmentService;
    this._textModelResolverService = _textModelResolverService;
    this._clipboardService = _clipboardService;
    this._openerService = _openerService;
    this._nativeHostService = _nativeHostService;
    this._productService = _productService;
    this._fileService = _fileService;
    this._labelService = _labelService;
    Promise.all([
      lifecycleService.when(LifecyclePhase.Eventually),
      extensionService.whenInstalledExtensionsRegistered()
    ]).then(() => {
      this._stopProfiling();
    });
  }
  _stopProfiling() {
    if (!this._environmentService.args["prof-startup-prefix"]) {
      return;
    }
    const profileFilenamePrefix = URI.file(
      this._environmentService.args["prof-startup-prefix"]
    );
    const dir = dirname(profileFilenamePrefix);
    const prefix = basename(profileFilenamePrefix);
    const removeArgs = ["--prof-startup"];
    const markerFile = this._fileService.readFile(profileFilenamePrefix).then((value) => removeArgs.push(...value.toString().split("|"))).then(
      () => this._fileService.del(profileFilenamePrefix, {
        recursive: true
      })
    ).then(
      () => new Promise((resolve) => {
        const check = () => {
          this._fileService.exists(profileFilenamePrefix).then((exists) => {
            if (exists) {
              resolve();
            } else {
              setTimeout(check, 500);
            }
          });
        };
        check();
      })
    ).then(
      () => this._fileService.del(profileFilenamePrefix, {
        recursive: true
      })
    );
    markerFile.then(() => {
      return this._fileService.resolve(dir).then((stat) => {
        return (stat.children ? stat.children.filter(
          (value) => value.resource.path.includes(prefix)
        ) : []).map((stat2) => stat2.resource);
      });
    }).then((files) => {
      const profileFiles = files.reduce(
        (prev, cur) => `${prev}${this._labelService.getUriLabel(cur)}
`,
        "\n"
      );
      return this._dialogService.confirm({
        type: "info",
        message: localize(
          "prof.message",
          "Successfully created profiles."
        ),
        detail: localize(
          "prof.detail",
          "Please create an issue and manually attach the following files:\n{0}",
          profileFiles
        ),
        primaryButton: localize(
          {
            key: "prof.restartAndFileIssue",
            comment: ["&& denotes a mnemonic"]
          },
          "&&Create Issue and Restart"
        ),
        cancelButton: localize("prof.restart", "Restart")
      }).then((res) => {
        if (res.confirmed) {
          Promise.all([
            this._nativeHostService.showItemInFolder(
              files[0].fsPath
            ),
            this._createPerfIssue(
              files.map((file) => basename(file))
            )
          ]).then(() => {
            return this._dialogService.confirm({
              type: "info",
              message: localize(
                "prof.thanks",
                "Thanks for helping us."
              ),
              detail: localize(
                "prof.detail.restart",
                "A final restart is required to continue to use '{0}'. Again, thank you for your contribution.",
                this._productService.nameLong
              ),
              primaryButton: localize(
                {
                  key: "prof.restart.button",
                  comment: [
                    "&& denotes a mnemonic"
                  ]
                },
                "&&Restart"
              )
            }).then((res2) => {
              if (res2.confirmed) {
                this._nativeHostService.relaunch({
                  removeArgs
                });
              }
            });
          });
        } else {
          this._nativeHostService.relaunch({ removeArgs });
        }
      });
    });
  }
  async _createPerfIssue(files) {
    const reportIssueUrl = this._productService.reportIssueUrl;
    if (!reportIssueUrl) {
      return;
    }
    const contrib = PerfviewContrib.get();
    const ref = await this._textModelResolverService.createModelReference(
      contrib.getInputUri()
    );
    try {
      await this._clipboardService.writeText(
        ref.object.textEditorModel.getValue()
      );
    } finally {
      ref.dispose();
    }
    const body = `
1. :warning: We have copied additional data to your clipboard. Make sure to **paste** here. :warning:
1. :warning: Make sure to **attach** these files from your *home*-directory: :warning:
${files.map((file) => `-\`${file}\``).join("\n")}
`;
    const baseUrl = reportIssueUrl;
    const queryStringPrefix = baseUrl.indexOf("?") === -1 ? "?" : "&";
    this._openerService.open(
      URI.parse(
        `${baseUrl}${queryStringPrefix}body=${encodeURIComponent(body)}`
      )
    );
  }
};
StartupProfiler = __decorateClass([
  __decorateParam(0, IDialogService),
  __decorateParam(1, INativeWorkbenchEnvironmentService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IClipboardService),
  __decorateParam(4, ILifecycleService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IOpenerService),
  __decorateParam(7, INativeHostService),
  __decorateParam(8, IProductService),
  __decorateParam(9, IFileService),
  __decorateParam(10, ILabelService)
], StartupProfiler);
export {
  StartupProfiler
};
