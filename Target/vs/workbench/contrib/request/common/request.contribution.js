import{Event as i}from"../../../../base/common/event.js";import{localize2 as n}from"../../../../nls.js";import{Categories as s}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as g,registerAction2 as c}from"../../../../platform/actions/common/actions.js";import"../../../../platform/instantiation/common/instantiation.js";import{ILoggerService as w}from"../../../../platform/log/common/log.js";import{Registry as m}from"../../../../platform/registry/common/platform.js";import{Extensions as a,IOutputService as p}from"../../../services/output/common/output.js";c(class extends g{constructor(){super({id:"workbench.actions.showNetworkLog",title:n("showNetworkLog","Show Network Log"),category:s.Developer,f1:!0})}async run(o){const t=o.get(w),r=o.get(p);for(const e of t.getRegisteredLoggers())e.id.startsWith("network-")&&t.setVisibility(e.id,!0);r.getChannelDescriptor("network-window")||await i.toPromise(i.filter(m.as(a.OutputChannels).onDidRegisterChannel,e=>e==="network-window")),r.showChannel("network-window")}});
