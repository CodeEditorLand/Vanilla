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
import { importAMDNodeModule } from "../../../amdX.js";
import { getErrorMessage } from "../../../base/common/errors.js";
import { createDecorator } from "../../instantiation/common/instantiation.js";
import { ILogService, LogLevel } from "../../log/common/log.js";
import { ITelemetryService } from "../../telemetry/common/telemetry.js";
const IExtensionSignatureVerificationService = createDecorator(
  "IExtensionSignatureVerificationService"
);
var ExtensionSignatureVerificationCode = /* @__PURE__ */ ((ExtensionSignatureVerificationCode2) => {
  ExtensionSignatureVerificationCode2["Success"] = "Success";
  ExtensionSignatureVerificationCode2["RequiredArgumentMissing"] = "RequiredArgumentMissing";
  ExtensionSignatureVerificationCode2["InvalidArgument"] = "InvalidArgument";
  ExtensionSignatureVerificationCode2["PackageIsUnreadable"] = "PackageIsUnreadable";
  ExtensionSignatureVerificationCode2["UnhandledException"] = "UnhandledException";
  ExtensionSignatureVerificationCode2["SignatureManifestIsMissing"] = "SignatureManifestIsMissing";
  ExtensionSignatureVerificationCode2["SignatureManifestIsUnreadable"] = "SignatureManifestIsUnreadable";
  ExtensionSignatureVerificationCode2["SignatureIsMissing"] = "SignatureIsMissing";
  ExtensionSignatureVerificationCode2["SignatureIsUnreadable"] = "SignatureIsUnreadable";
  ExtensionSignatureVerificationCode2["CertificateIsUnreadable"] = "CertificateIsUnreadable";
  ExtensionSignatureVerificationCode2["SignatureArchiveIsUnreadable"] = "SignatureArchiveIsUnreadable";
  ExtensionSignatureVerificationCode2["FileAlreadyExists"] = "FileAlreadyExists";
  ExtensionSignatureVerificationCode2["SignatureArchiveIsInvalidZip"] = "SignatureArchiveIsInvalidZip";
  ExtensionSignatureVerificationCode2["SignatureArchiveHasSameSignatureFile"] = "SignatureArchiveHasSameSignatureFile";
  ExtensionSignatureVerificationCode2["PackageIntegrityCheckFailed"] = "PackageIntegrityCheckFailed";
  ExtensionSignatureVerificationCode2["SignatureIsInvalid"] = "SignatureIsInvalid";
  ExtensionSignatureVerificationCode2["SignatureManifestIsInvalid"] = "SignatureManifestIsInvalid";
  ExtensionSignatureVerificationCode2["SignatureIntegrityCheckFailed"] = "SignatureIntegrityCheckFailed";
  ExtensionSignatureVerificationCode2["EntryIsMissing"] = "EntryIsMissing";
  ExtensionSignatureVerificationCode2["EntryIsTampered"] = "EntryIsTampered";
  ExtensionSignatureVerificationCode2["Untrusted"] = "Untrusted";
  ExtensionSignatureVerificationCode2["CertificateRevoked"] = "CertificateRevoked";
  ExtensionSignatureVerificationCode2["SignatureIsNotValid"] = "SignatureIsNotValid";
  ExtensionSignatureVerificationCode2["UnknownError"] = "UnknownError";
  ExtensionSignatureVerificationCode2["PackageIsInvalidZip"] = "PackageIsInvalidZip";
  ExtensionSignatureVerificationCode2["SignatureArchiveHasTooManyEntries"] = "SignatureArchiveHasTooManyEntries";
  return ExtensionSignatureVerificationCode2;
})(ExtensionSignatureVerificationCode || {});
class ExtensionSignatureVerificationError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}
let ExtensionSignatureVerificationService = class {
  constructor(logService, telemetryService) {
    this.logService = logService;
    this.telemetryService = telemetryService;
  }
  moduleLoadingPromise;
  vsceSign() {
    if (!this.moduleLoadingPromise) {
      this.moduleLoadingPromise = this.resolveVsceSign();
    }
    return this.moduleLoadingPromise;
  }
  async resolveVsceSign() {
    if (typeof importAMDNodeModule === "function") {
    }
    const mod = "@vscode/vsce-sign";
    return import(mod);
  }
  async verify(extension, vsixFilePath, signatureArchiveFilePath, clientTargetPlatform) {
    let module;
    const extensionId = extension.identifier.id;
    try {
      module = await this.vsceSign();
    } catch (error) {
      this.logService.error(
        "Could not load vsce-sign module",
        getErrorMessage(error)
      );
      this.logService.info(
        `Extension signature verification is not done: ${extensionId}`
      );
      return false;
    }
    const startTime = (/* @__PURE__ */ new Date()).getTime();
    let result;
    try {
      this.logService.trace(
        `Verifying extension signature for ${extensionId}...`
      );
      result = await module.verify(
        vsixFilePath,
        signatureArchiveFilePath,
        this.logService.getLevel() === LogLevel.Trace
      );
    } catch (e) {
      result = {
        code: "UnknownError" /* UnknownError */,
        didExecute: false,
        output: getErrorMessage(e)
      };
    }
    const duration = (/* @__PURE__ */ new Date()).getTime() - startTime;
    this.logService.info(
      `Extension signature verification result for ${extensionId}: ${result.code}. Executed: ${result.didExecute}. Duration: ${duration}ms.`
    );
    this.logService.trace(
      `Extension signature verification output for ${extensionId}:
${result.output}`
    );
    this.telemetryService.publicLog2("extensionsignature:verification", {
      extensionId,
      extensionVersion: extension.version,
      code: result.code,
      internalCode: result.internalCode,
      duration,
      didExecute: result.didExecute,
      clientTargetPlatform
    });
    if (result.code === "Success" /* Success */) {
      return true;
    }
    throw new ExtensionSignatureVerificationError(result.code);
  }
};
ExtensionSignatureVerificationService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, ITelemetryService)
], ExtensionSignatureVerificationService);
export {
  ExtensionSignatureVerificationCode,
  ExtensionSignatureVerificationError,
  ExtensionSignatureVerificationService,
  IExtensionSignatureVerificationService
};
