var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
(function() {
  const bootstrapWindow = bootstrapWindowLib();
  bootstrapWindow.load(
    ["vs/workbench/contrib/issue/electron-sandbox/issueReporterMain"],
    function(issueReporter, configuration) {
      return issueReporter.startup(configuration);
    },
    {
      configureDeveloperSettings: /* @__PURE__ */ __name(function() {
        return {
          forceEnableDeveloperKeybindings: true,
          disallowReloadKeybinding: true
        };
      }, "configureDeveloperSettings")
    }
  );
  function bootstrapWindowLib() {
    return window.MonacoBootstrapWindow;
  }
  __name(bootstrapWindowLib, "bootstrapWindowLib");
})();
//# sourceMappingURL=issueReporter.js.map
