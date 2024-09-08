class TerminalWidgetManager {
  _container;
  _attached = /* @__PURE__ */ new Map();
  attachToElement(terminalWrapper) {
    if (!this._container) {
      this._container = document.createElement("div");
      this._container.classList.add("terminal-widget-container");
      terminalWrapper.appendChild(this._container);
    }
  }
  dispose() {
    if (this._container) {
      this._container.remove();
      this._container = void 0;
    }
  }
  attachWidget(widget) {
    if (!this._container) {
      return;
    }
    this._attached.get(widget.id)?.dispose();
    widget.attach(this._container);
    this._attached.set(widget.id, widget);
    return {
      dispose: () => {
        const current = this._attached.get(widget.id);
        if (current === widget) {
          this._attached.delete(widget.id);
          widget.dispose();
        }
      }
    };
  }
}
export {
  TerminalWidgetManager
};
