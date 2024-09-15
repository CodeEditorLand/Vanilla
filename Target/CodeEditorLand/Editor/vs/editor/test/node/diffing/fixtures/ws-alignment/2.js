var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Nav } from "@fluentui/react";
import { View } from "../../layout/layout";
const WelcomeView = /* @__PURE__ */ __name(() => {
  return /* @__PURE__ */ React.createElement(View, { title: "VS Code Tools" }, /* @__PURE__ */ React.createElement(
    Nav,
    {
      groups: [
        {
          links: [
            { name: "VS Code Standup (Redmond)", url: "https://vscode-standup.azurewebsites.net", icon: "JoinOnlineMeeting", target: "_blank" },
            { name: "VS Code Standup (Zurich)", url: "https://stand.azurewebsites.net/", icon: "JoinOnlineMeeting", target: "_blank" },
            { name: "VS Code Errors", url: "https://errors.code.visualstudio.com", icon: "ErrorBadge", target: "_blank" }
          ]
        }
      ]
    }
  ));
}, "WelcomeView");
export {
  WelcomeView
};
//# sourceMappingURL=2.js.map
