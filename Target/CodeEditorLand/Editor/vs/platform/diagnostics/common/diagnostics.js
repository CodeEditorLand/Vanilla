import { createDecorator } from "../../instantiation/common/instantiation.js";
const ID = "diagnosticsService";
const IDiagnosticsService = createDecorator(ID);
function isRemoteDiagnosticError(x) {
  return !!x.hostName && !!x.errorMessage;
}
class NullDiagnosticsService {
  _serviceBrand;
  async getPerformanceInfo(mainProcessInfo, remoteInfo) {
    return {};
  }
  async getSystemInfo(mainProcessInfo, remoteInfo) {
    return {
      processArgs: "nullProcessArgs",
      gpuStatus: "nullGpuStatus",
      screenReader: "nullScreenReader",
      remoteData: [],
      os: "nullOs",
      memory: "nullMemory",
      vmHint: "nullVmHint"
    };
  }
  async getDiagnostics(mainProcessInfo, remoteInfo) {
    return "";
  }
  async getWorkspaceFileExtensions(workspace) {
    return { extensions: [] };
  }
  async reportWorkspaceStats(workspace) {
  }
}
export {
  ID,
  IDiagnosticsService,
  NullDiagnosticsService,
  isRemoteDiagnosticError
};
