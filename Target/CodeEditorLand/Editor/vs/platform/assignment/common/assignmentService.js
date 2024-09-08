import { importAMDNodeModule } from "../../../amdX.js";
import { TelemetryLevel } from "../../telemetry/common/telemetry.js";
import { getTelemetryLevel } from "../../telemetry/common/telemetryUtils.js";
import {
  ASSIGNMENT_REFETCH_INTERVAL,
  ASSIGNMENT_STORAGE_KEY,
  AssignmentFilterProvider,
  TargetPopulation
} from "./assignment.js";
class BaseAssignmentService {
  constructor(machineId, configurationService, productService, environmentService, telemetry, keyValueStorage) {
    this.machineId = machineId;
    this.configurationService = configurationService;
    this.productService = productService;
    this.environmentService = environmentService;
    this.telemetry = telemetry;
    this.keyValueStorage = keyValueStorage;
    const isTesting = environmentService.extensionTestsLocationURI !== void 0;
    if (!isTesting && productService.tasConfig && this.experimentsEnabled && getTelemetryLevel(this.configurationService) === TelemetryLevel.USAGE) {
      this.tasClient = this.setupTASClient();
    }
    const overrideDelaySetting = this.configurationService.getValue(
      "experiments.overrideDelay"
    );
    const overrideDelay = typeof overrideDelaySetting === "number" ? overrideDelaySetting : 0;
    this.overrideInitDelay = new Promise(
      (resolve) => setTimeout(resolve, overrideDelay)
    );
  }
  _serviceBrand;
  tasClient;
  networkInitialized = false;
  overrideInitDelay;
  get experimentsEnabled() {
    return true;
  }
  async getTreatment(name) {
    await this.overrideInitDelay;
    const override = this.configurationService.getValue(
      "experiments.override." + name
    );
    if (override !== void 0) {
      return override;
    }
    if (!this.tasClient) {
      return void 0;
    }
    if (!this.experimentsEnabled) {
      return void 0;
    }
    let result;
    const client = await this.tasClient;
    if (this.networkInitialized) {
      result = client.getTreatmentVariable("vscode", name);
    } else {
      result = await client.getTreatmentVariableAsync(
        "vscode",
        name,
        true
      );
    }
    result = client.getTreatmentVariable("vscode", name);
    return result;
  }
  async setupTASClient() {
    const targetPopulation = this.productService.quality === "stable" ? TargetPopulation.Public : this.productService.quality === "exploration" ? TargetPopulation.Exploration : TargetPopulation.Insiders;
    const filterProvider = new AssignmentFilterProvider(
      this.productService.version,
      this.productService.nameLong,
      this.machineId,
      targetPopulation
    );
    const tasConfig = this.productService.tasConfig;
    const tasClient = new (await importAMDNodeModule(
      "tas-client-umd",
      "lib/tas-client-umd.js"
    )).ExperimentationService({
      filterProviders: [filterProvider],
      telemetry: this.telemetry,
      storageKey: ASSIGNMENT_STORAGE_KEY,
      keyValueStorage: this.keyValueStorage,
      assignmentContextTelemetryPropertyName: tasConfig.assignmentContextTelemetryPropertyName,
      telemetryEventName: tasConfig.telemetryEventName,
      endpoint: tasConfig.endpoint,
      refetchInterval: ASSIGNMENT_REFETCH_INTERVAL
    });
    await tasClient.initializePromise;
    tasClient.initialFetch.then(() => this.networkInitialized = true);
    return tasClient;
  }
}
export {
  BaseAssignmentService
};
