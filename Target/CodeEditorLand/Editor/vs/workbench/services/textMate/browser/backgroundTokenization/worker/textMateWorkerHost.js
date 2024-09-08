class TextMateWorkerHost {
  static CHANNEL_NAME = "textMateWorkerHost";
  static getChannel(workerServer) {
    return workerServer.getChannel(
      TextMateWorkerHost.CHANNEL_NAME
    );
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(
      TextMateWorkerHost.CHANNEL_NAME,
      obj
    );
  }
}
export {
  TextMateWorkerHost
};
