class NotebookLogger {
  constructor() {
    this._domFrameLog();
  }
  _frameId = 0;
  _domFrameLog() {
  }
  debug(...args) {
    const date = /* @__PURE__ */ new Date();
    console.log(
      `${date.getSeconds()}:${date.getMilliseconds().toString().padStart(3, "0")}`,
      `frame #${this._frameId}: `,
      ...args
    );
  }
}
const instance = new NotebookLogger();
function notebookDebug(...args) {
  instance.debug(...args);
}
export {
  notebookDebug
};
