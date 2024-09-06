import{hide as d,show as l}from"../../../../../vs/base/browser/dom.js";import{getProgressAcccessibilitySignalScheduler as c}from"../../../../../vs/base/browser/ui/progressbar/progressAccessibilitySignal.js";import{RunOnceScheduler as h}from"../../../../../vs/base/common/async.js";import{Disposable as u,MutableDisposable as m}from"../../../../../vs/base/common/lifecycle.js";import{isNumber as g}from"../../../../../vs/base/common/types.js";import"vs/css!./progressbar";const r="done",n="active",s="infinite",i="infinite-long-running",o="discrete",w={progressBarBackground:void 0};class a extends u{static LONG_RUNNING_INFINITE_THRESHOLD=1e4;static PROGRESS_SIGNAL_DEFAULT_DELAY=3e3;workedVal;element;bit;totalWork;showDelayedScheduler;longRunningScheduler;progressSignal=this._register(new m);constructor(e,t){super(),this.workedVal=0,this.showDelayedScheduler=this._register(new h(()=>l(this.element),0)),this.longRunningScheduler=this._register(new h(()=>this.infiniteLongRunning(),a.LONG_RUNNING_INFINITE_THRESHOLD)),this.create(e,t)}create(e,t){this.element=document.createElement("div"),this.element.classList.add("monaco-progress-container"),this.element.setAttribute("role","progressbar"),this.element.setAttribute("aria-valuemin","0"),e.appendChild(this.element),this.bit=document.createElement("div"),this.bit.classList.add("progress-bit"),this.bit.style.backgroundColor=t?.progressBarBackground||"#0E70C0",this.element.appendChild(this.bit)}off(){this.bit.style.width="inherit",this.bit.style.opacity="1",this.element.classList.remove(n,s,i,o),this.workedVal=0,this.totalWork=void 0,this.longRunningScheduler.cancel(),this.progressSignal.clear()}done(){return this.doDone(!0)}stop(){return this.doDone(!1)}doDone(e){return this.element.classList.add(r),this.element.classList.contains(s)?(this.bit.style.opacity="0",e?setTimeout(()=>this.off(),200):this.off()):(this.bit.style.width="inherit",e?setTimeout(()=>this.off(),200):this.off()),this}infinite(){return this.bit.style.width="2%",this.bit.style.opacity="1",this.element.classList.remove(o,r,i),this.element.classList.add(n,s),this.longRunningScheduler.schedule(),this}infiniteLongRunning(){this.element.classList.add(i)}total(e){return this.workedVal=0,this.totalWork=e,this.element.setAttribute("aria-valuemax",e.toString()),this}hasTotal(){return g(this.totalWork)}worked(e){return e=Math.max(1,Number(e)),this.doSetWorked(this.workedVal+e)}setWorked(e){return e=Math.max(1,Number(e)),this.doSetWorked(e)}doSetWorked(e){const t=this.totalWork||100;return this.workedVal=e,this.workedVal=Math.min(t,this.workedVal),this.element.classList.remove(s,i,r),this.element.classList.add(n,o),this.element.setAttribute("aria-valuenow",e.toString()),this.bit.style.width=100*(this.workedVal/t)+"%",this}getContainer(){return this.element}show(e){this.showDelayedScheduler.cancel(),this.progressSignal.value=c(a.PROGRESS_SIGNAL_DEFAULT_DELAY),typeof e=="number"?this.showDelayedScheduler.schedule(e):l(this.element)}hide(){d(this.element),this.showDelayedScheduler.cancel(),this.progressSignal.clear()}}export{a as ProgressBar,w as unthemedProgressBarOptions};