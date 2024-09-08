class EditorWorkerHost {
  static CHANNEL_NAME = "editorWorkerHost";
  static getChannel(workerServer) {
    return workerServer.getChannel(
      EditorWorkerHost.CHANNEL_NAME
    );
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(
      EditorWorkerHost.CHANNEL_NAME,
      obj
    );
  }
}
export {
  EditorWorkerHost
};
