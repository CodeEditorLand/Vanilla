var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class LocalFileSearchSimpleWorkerHost {
  static {
    __name(this, "LocalFileSearchSimpleWorkerHost");
  }
  static CHANNEL_NAME = "localFileSearchWorkerHost";
  static getChannel(workerServer) {
    return workerServer.getChannel(
      LocalFileSearchSimpleWorkerHost.CHANNEL_NAME
    );
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(
      LocalFileSearchSimpleWorkerHost.CHANNEL_NAME,
      obj
    );
  }
}
export {
  LocalFileSearchSimpleWorkerHost
};
//# sourceMappingURL=localFileSearchWorkerTypes.js.map
