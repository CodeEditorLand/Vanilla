var E=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var R=(I,e,s,i)=>{for(var t=i>1?void 0:i?N(e,s):e,n=I.length-1,A;n>=0;n--)(A=I[n])&&(t=(i?A(e,s,t):A(t))||t);return i&&t&&E(e,s,t),t},a=(I,e)=>(s,i)=>e(s,i,I);import*as c from"../../../../nls.js";import{language as O}from"../../../../base/common/platform.js";import{Extensions as y}from"../../../common/contributions.js";import{Registry as k}from"../../../../platform/registry/common/platform.js";import{ITelemetryService as L}from"../../../../platform/telemetry/common/telemetry.js";import{IStorageService as U,StorageScope as o,StorageTarget as r}from"../../../../platform/storage/common/storage.js";import{IProductService as b}from"../../../../platform/product/common/productService.js";import{LifecyclePhase as h}from"../../../services/lifecycle/common/lifecycle.js";import{Severity as d,INotificationService as D,NotificationPriority as g}from"../../../../platform/notification/common/notification.js";import{IOpenerService as _}from"../../../../platform/opener/common/opener.js";import{URI as W}from"../../../../base/common/uri.js";import{platform as v}from"../../../../base/common/process.js";const w=.15,f="nps/sessionCount",T="nps/lastSessionDate",l="nps/skipVersion",p="nps/isCandidate";let m=class{constructor(e,s,i,t,n){if(!n.npsSurveyUrl||e.get(l,o.APPLICATION,""))return;const C=new Date().toDateString(),u=e.get(T,o.APPLICATION,new Date(0).toDateString());if(C===u)return;const P=(e.getNumber(f,o.APPLICATION,0)||0)+1;if(e.store(T,C,o.APPLICATION,r.USER),e.store(f,P,o.APPLICATION,r.USER),P<9)return;const S=e.getBoolean(p,o.APPLICATION,!1)||Math.random()<w;if(e.store(p,S,o.APPLICATION,r.USER),!S){e.store(l,n.version,o.APPLICATION,r.USER);return}s.prompt(d.Info,c.localize("surveyQuestion","Do you mind taking a quick feedback survey?"),[{label:c.localize("takeSurvey","Take Survey"),run:()=>{t.open(W.parse(`${n.npsSurveyUrl}?o=${encodeURIComponent(v)}&v=${encodeURIComponent(n.version)}&m=${encodeURIComponent(i.machineId)}`)),e.store(p,!1,o.APPLICATION,r.USER),e.store(l,n.version,o.APPLICATION,r.USER)}},{label:c.localize("remindLater","Remind Me Later"),run:()=>e.store(f,P-3,o.APPLICATION,r.USER)},{label:c.localize("neverAgain","Don't Show Again"),run:()=>{e.store(p,!1,o.APPLICATION,r.USER),e.store(l,n.version,o.APPLICATION,r.USER)}}],{sticky:!0,priority:g.URGENT})}};m=R([a(0,U),a(1,D),a(2,L),a(3,_),a(4,b)],m),O==="en"&&k.as(y.Workbench).registerWorkbenchContribution(m,h.Restored);
