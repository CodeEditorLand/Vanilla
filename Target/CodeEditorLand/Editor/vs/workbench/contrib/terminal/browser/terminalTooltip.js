import{asArray as c}from"../../../../base/common/arrays.js";import{MarkdownString as h}from"../../../../base/common/htmlContent.js";import{localize as l}from"../../../../nls.js";import{TerminalCapability as s}from"../../../../platform/terminal/common/capabilities/capabilities.js";function b(e){let o="";const n=e.statusList.statuses,t=[];for(const i of n)o+=`

---

${i.icon?`$(${i.icon?.id}) `:""}${i.tooltip||i.id}`,i.hoverActions&&t.push(...i.hoverActions);const r=p(e,!0),a=g(e,!0);return{content:new h(e.title+r+a+o,{supportThemeIcons:!0}),actions:t}}function g(e,o){const n=[];e.capabilities.has(s.CommandDetection)&&n.push(s.CommandDetection),e.capabilities.has(s.CwdDetection)&&n.push(s.CwdDetection);let t="";return n.length>0?t+=`${o?`

---

`:`

`}${l("shellIntegration.enabled","Shell integration activated")}`:e.shellLaunchConfig.ignoreShellIntegration?t+=`${o?`

---

`:`

`}${l("launchFailed.exitCodeOnlyShellIntegration","The terminal process failed to launch. Disabling shell integration with terminal.integrated.shellIntegration.enabled might help.")}`:e.usedShellIntegrationInjection&&(t+=`${o?`

---

`:`

`}${l("shellIntegration.activationFailed","Shell integration failed to activate")}`),t}function p(e,o){const n=[];if(e.processId&&e.processId>0&&n.push(l({key:"shellProcessTooltip.processId",comment:[`The first arg is "PID" which shouldn't be translated`]},"Process ID ({0}): {1}","PID",e.processId)+`
`),e.shellLaunchConfig.executable){let t=e.shellLaunchConfig.executable;const r=c(e.injectedArgs||e.shellLaunchConfig.args||[]).map(a=>`'${a}'`).join(" ");r&&(t+=` ${r}`),n.push(l("shellProcessTooltip.commandLine","Command line: {0}",t))}return n.length?`${o?`

---

`:`

`}${n.join(`
`)}`:""}export{b as getInstanceHoverInfo,g as getShellIntegrationTooltip,p as getShellProcessTooltip};
