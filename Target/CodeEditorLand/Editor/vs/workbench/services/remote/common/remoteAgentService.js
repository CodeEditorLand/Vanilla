import { timeout } from "../../../../base/common/async.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IRemoteAgentService = createDecorator("remoteAgentService");
const remoteConnectionLatencyMeasurer = new class {
  maxSampleCount = 5;
  sampleDelay = 2e3;
  initial = [];
  maxInitialCount = 3;
  average = [];
  maxAverageCount = 100;
  highLatencyMultiple = 2;
  highLatencyMinThreshold = 500;
  highLatencyMaxThreshold = 1500;
  lastMeasurement = void 0;
  get latency() {
    return this.lastMeasurement;
  }
  async measure(remoteAgentService) {
    let currentLatency = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.maxSampleCount; i++) {
      const rtt = await remoteAgentService.getRoundTripTime();
      if (rtt === void 0) {
        return void 0;
      }
      currentLatency = Math.min(
        currentLatency,
        rtt / 2
      );
      await timeout(this.sampleDelay);
    }
    this.average.push(currentLatency);
    if (this.average.length > this.maxAverageCount) {
      this.average.shift();
    }
    let initialLatency;
    if (this.initial.length < this.maxInitialCount) {
      this.initial.push(currentLatency);
    } else {
      initialLatency = this.initial.reduce((sum, value) => sum + value, 0) / this.initial.length;
    }
    this.lastMeasurement = {
      initial: initialLatency,
      current: currentLatency,
      average: this.average.reduce((sum, value) => sum + value, 0) / this.average.length,
      high: (() => {
        if (typeof initialLatency === "undefined") {
          return false;
        }
        if (currentLatency > this.highLatencyMaxThreshold) {
          return true;
        }
        if (currentLatency > this.highLatencyMinThreshold && currentLatency > initialLatency * this.highLatencyMultiple) {
          return true;
        }
        return false;
      })()
    };
    return this.lastMeasurement;
  }
}();
export {
  IRemoteAgentService,
  remoteConnectionLatencyMeasurer
};
