var f=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var b=(i,o,e,t)=>{for(var r=t>1?void 0:t?h(o,e):o,s=i.length-1,c;s>=0;s--)(c=i[s])&&(r=(t?c(o,e,r):c(r))||r);return t&&r&&f(o,e,r),r},m=(i,o)=>(e,t)=>o(e,t,i);import{Disposable as k}from"../../../../../vs/base/common/lifecycle.js";import{FontMeasurements as l}from"../../../../../vs/editor/browser/config/fontMeasurements.js";import{INativeHostService as p}from"../../../../../vs/platform/native/common/native.js";import{Registry as I}from"../../../../../vs/platform/registry/common/platform.js";import{Extensions as W}from"../../../../../vs/workbench/common/contributions.js";import{LifecyclePhase as u}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";let n=class extends k{constructor(o){super(),this._register(o.onDidChangeDisplay(()=>{l.clearAllFontInfos()}))}};n=b([m(0,p)],n),I.as(W.Workbench).registerWorkbenchContribution(n,u.Eventually);
