import{createCancelableAsyncIterable as n,RunOnceScheduler as s}from"../../../../../vs/base/common/async.js";import"../../../../../vs/base/common/cancellation.js";import{onUnexpectedError as o}from"../../../../../vs/base/common/errors.js";import{Emitter as c}from"../../../../../vs/base/common/event.js";import{Disposable as l}from"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{EditorOption as h}from"../../../../../vs/editor/common/config/editorOptions.js";var _=(t=>(t[t.Idle=0]="Idle",t[t.FirstWait=1]="FirstWait",t[t.SecondWait=2]="SecondWait",t[t.WaitingForAsync=3]="WaitingForAsync",t[t.WaitingForAsyncShowingLoading=4]="WaitingForAsyncShowingLoading",t))(_||{}),d=(e=>(e[e.Delayed=0]="Delayed",e[e.Immediate=1]="Immediate",e))(d||{}),u=(e=>(e[e.Mouse=0]="Mouse",e[e.Keyboard=1]="Keyboard",e))(u||{});class p{constructor(r,e,i){this.value=r;this.isComplete=e;this.hasLoadingMessage=i}}class C extends l{constructor(e,i){super();this._editor=e;this._computer=i}_onResult=this._register(new c);onResult=this._onResult.event;_firstWaitScheduler=this._register(new s(()=>this._triggerAsyncComputation(),0));_secondWaitScheduler=this._register(new s(()=>this._triggerSyncComputation(),0));_loadingMessageScheduler=this._register(new s(()=>this._triggerLoadingMessage(),0));_state=0;_asyncIterable=null;_asyncIterableDone=!1;_result=[];dispose(){this._asyncIterable&&(this._asyncIterable.cancel(),this._asyncIterable=null),super.dispose()}get _hoverTime(){return this._editor.getOption(h.hover).delay}get _firstWaitTime(){return this._hoverTime/2}get _secondWaitTime(){return this._hoverTime-this._firstWaitTime}get _loadingMessageTime(){return 3*this._hoverTime}_setState(e,i=!0){this._state=e,i&&this._fireResult()}_triggerAsyncComputation(){this._setState(2),this._secondWaitScheduler.schedule(this._secondWaitTime),this._computer.computeAsync?(this._asyncIterableDone=!1,this._asyncIterable=n(e=>this._computer.computeAsync(e)),(async()=>{try{for await(const e of this._asyncIterable)e&&(this._result.push(e),this._fireResult());this._asyncIterableDone=!0,(this._state===3||this._state===4)&&this._setState(0)}catch(e){o(e)}})()):this._asyncIterableDone=!0}_triggerSyncComputation(){this._computer.computeSync&&(this._result=this._result.concat(this._computer.computeSync())),this._setState(this._asyncIterableDone?0:3)}_triggerLoadingMessage(){this._state===3&&this._setState(4)}_fireResult(){if(this._state===1||this._state===2)return;const e=this._state===0,i=this._state===4;this._onResult.fire(new p(this._result.slice(0),e,i))}start(e){if(e===0)this._state===0&&(this._setState(1),this._firstWaitScheduler.schedule(this._firstWaitTime),this._loadingMessageScheduler.schedule(this._loadingMessageTime));else switch(this._state){case 0:this._triggerAsyncComputation(),this._secondWaitScheduler.cancel(),this._triggerSyncComputation();break;case 2:this._secondWaitScheduler.cancel(),this._triggerSyncComputation();break}}cancel(){this._firstWaitScheduler.cancel(),this._secondWaitScheduler.cancel(),this._loadingMessageScheduler.cancel(),this._asyncIterable&&(this._asyncIterable.cancel(),this._asyncIterable=null),this._result=[],this._setState(0,!1)}}export{C as HoverOperation,p as HoverResult,d as HoverStartMode,u as HoverStartSource};