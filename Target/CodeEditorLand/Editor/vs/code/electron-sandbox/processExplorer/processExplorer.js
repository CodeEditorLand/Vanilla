var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(function() {
  const bootstrapWindow = bootstrapWindowLib();
  bootstrapWindow.load(["vs/code/electron-sandbox/processExplorer/processExplorerMain"], function(processExplorer, configuration) {
    return processExplorer.startup(configuration);
  }, {
    configureDeveloperSettings: /* @__PURE__ */ __name(function() {
      return {
        forceEnableDeveloperKeybindings: true
      };
    }, "configureDeveloperSettings")
  });
  function bootstrapWindowLib() {
    return window.MonacoBootstrapWindow;
  }
  __name(bootstrapWindowLib, "bootstrapWindowLib");
})();
//# sourceMappingURL=processExplorer.js.map
