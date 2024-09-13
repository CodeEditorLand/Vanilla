var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(() => {
  const bootstrapWindow = bootstrapWindowLib();
  bootstrapWindow.load(
    ["vs/workbench/contrib/issue/electron-sandbox/issueReporterMain"],
    (issueReporter, configuration) => issueReporter.startup(configuration),
    {
      configureDeveloperSettings: /* @__PURE__ */ __name(() => ({
        forceEnableDeveloperKeybindings: true,
        disallowReloadKeybinding: true
      }), "configureDeveloperSettings")
    }
  );
  function bootstrapWindowLib() {
    return window.MonacoBootstrapWindow;
  }
  __name(bootstrapWindowLib, "bootstrapWindowLib");
})();
//# sourceMappingURL=issueReporter.js.map
