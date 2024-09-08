class LanguageDetectionWorkerHost {
  static CHANNEL_NAME = "languageDetectionWorkerHost";
  static getChannel(workerServer) {
    return workerServer.getChannel(
      LanguageDetectionWorkerHost.CHANNEL_NAME
    );
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(
      LanguageDetectionWorkerHost.CHANNEL_NAME,
      obj
    );
  }
}
export {
  LanguageDetectionWorkerHost
};
