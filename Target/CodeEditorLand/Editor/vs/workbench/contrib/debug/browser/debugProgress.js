var w=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var g=(p,i,s,t)=>{for(var e=t>1?void 0:t?P(i,s):i,n=p.length-1,o;n>=0;n--)(o=p[n])&&(e=(t?o(i,s,e):o(e))||e);return t&&e&&w(i,s,e),e},f=(p,i)=>(s,t)=>i(s,t,p);import{Event as y}from"../../../../../vs/base/common/event.js";import{dispose as V}from"../../../../../vs/base/common/lifecycle.js";import{IProgressService as L,ProgressLocation as W}from"../../../../../vs/platform/progress/common/progress.js";import"../../../../../vs/workbench/common/contributions.js";import{IDebugService as M,VIEWLET_ID as D}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import{IViewsService as k}from"../../../../../vs/workbench/services/views/common/viewsService.js";let m=class{toDispose=[];constructor(i,s,t){let e;const n=o=>{e&&(e.dispose(),e=void 0),o&&(e=o.onDidProgressStart(async r=>{const I=new Promise(b=>{const c=y.any(y.filter(o.onDidProgressEnd,l=>l.body.progressId===r.body.progressId),o.onDidEndAdapter)(()=>{c.dispose(),b()})});t.isViewContainerVisible(D)&&s.withProgress({location:D},()=>I);const u=i.getAdapterManager().getDebuggerLabel(o.configuration.type);s.withProgress({location:W.Notification,title:r.body.title,cancellable:r.body.cancellable,source:u,delay:500},b=>{let c=0;const l=d=>{let a;typeof d.percentage=="number"&&(a=d.percentage-c,c+=a),b.report({message:d.message,increment:a,total:typeof a=="number"?100:void 0})};r.body.message&&l(r.body);const h=o.onDidProgressUpdate(d=>{d.body.progressId===r.body.progressId&&l(d.body)});return I.then(()=>h.dispose())},()=>o.cancel(r.body.progressId))}))};this.toDispose.push(i.getViewModel().onDidFocusSession(n)),n(i.getViewModel().focusedSession),this.toDispose.push(i.onWillNewSession(o=>{e||n(o)}))}dispose(){V(this.toDispose)}};m=g([f(0,M),f(1,L),f(2,k)],m);export{m as DebugProgressContribution};