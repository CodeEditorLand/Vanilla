import"../../../../../vs/base/common/htmlContent.js";import"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/base/common/themables.js";import"../../../../../vs/editor/common/languages.js";import{createDecorator as n}from"../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../vs/platform/theme/common/colorRegistry.js";import"../../../../../vs/workbench/browser/parts/statusbar/statusbarPart.js";const x=n("statusbarService");var e=(t=>(t[t.LEFT=0]="LEFT",t[t.RIGHT=1]="RIGHT",t))(e||{});function a(o){const r=o;return typeof r?.id=="string"&&typeof r.alignment=="number"}function C(o){const r=o;return(typeof r?.primary=="number"||a(r?.primary))&&typeof r?.secondary=="number"}const w={id:"statusBar.entry.showTooltip",title:""},h=["standard","warning","error","prominent","remote","offline"];export{x as IStatusbarService,w as ShowTooltipCommand,e as StatusbarAlignment,h as StatusbarEntryKinds,a as isStatusbarEntryLocation,C as isStatusbarEntryPriority};