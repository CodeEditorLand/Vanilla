var E=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var R=(I,e,s,i)=>{for(var t=i>1?void 0:i?N(e,s):e,n=I.length-1,A;n>=0;n--)(A=I[n])&&(t=(i?A(e,s,t):A(t))||t);return i&&t&&E(e,s,t),t},a=(I,e)=>(s,i)=>e(s,i,I);import{language as O}from"../../../../../vs/base/common/platform.js";import{platform as y}from"../../../../../vs/base/common/process.js";import{URI as k}from"../../../../../vs/base/common/uri.js";import*as c from"../../../../../vs/nls.js";import{INotificationService as L,NotificationPriority as U,Severity as b}from"../../../../../vs/platform/notification/common/notification.js";import{IOpenerService as h}from"../../../../../vs/platform/opener/common/opener.js";import{IProductService as d}from"../../../../../vs/platform/product/common/productService.js";import{Registry as D}from"../../../../../vs/platform/registry/common/platform.js";import{IStorageService as g,StorageScope as o,StorageTarget as r}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as _}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{Extensions as W}from"../../../../../vs/workbench/common/contributions.js";import{LifecyclePhase as v}from"../../../../../vs/workbench/services/lifecycle/common/lifecycle.js";const w=.15,f="nps/sessionCount",T="nps/lastSessionDate",l="nps/skipVersion",p="nps/isCandidate";let m=class{constructor(e,s,i,t,n){if(!n.npsSurveyUrl||e.get(l,o.APPLICATION,""))return;const C=new Date().toDateString(),u=e.get(T,o.APPLICATION,new Date(0).toDateString());if(C===u)return;const P=(e.getNumber(f,o.APPLICATION,0)||0)+1;if(e.store(T,C,o.APPLICATION,r.USER),e.store(f,P,o.APPLICATION,r.USER),P<9)return;const S=e.getBoolean(p,o.APPLICATION,!1)||Math.random()<w;if(e.store(p,S,o.APPLICATION,r.USER),!S){e.store(l,n.version,o.APPLICATION,r.USER);return}s.prompt(b.Info,c.localize("surveyQuestion","Do you mind taking a quick feedback survey?"),[{label:c.localize("takeSurvey","Take Survey"),run:()=>{t.open(k.parse(`${n.npsSurveyUrl}?o=${encodeURIComponent(y)}&v=${encodeURIComponent(n.version)}&m=${encodeURIComponent(i.machineId)}`)),e.store(p,!1,o.APPLICATION,r.USER),e.store(l,n.version,o.APPLICATION,r.USER)}},{label:c.localize("remindLater","Remind Me Later"),run:()=>e.store(f,P-3,o.APPLICATION,r.USER)},{label:c.localize("neverAgain","Don't Show Again"),run:()=>{e.store(p,!1,o.APPLICATION,r.USER),e.store(l,n.version,o.APPLICATION,r.USER)}}],{sticky:!0,priority:U.URGENT})}};m=R([a(0,g),a(1,L),a(2,_),a(3,h),a(4,d)],m),O==="en"&&D.as(W.Workbench).registerWorkbenchContribution(m,v.Restored);
