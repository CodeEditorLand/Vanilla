import{getActiveWindow as t}from"../../../base/browser/dom.js";import{Disposable as c,toDisposable as u}from"../../../base/common/lifecycle.js";class r extends c{_tasks=[];_idleCallback;_i=0;constructor(){super(),this._register(u(()=>this.clear()))}enqueue(e){this._tasks.push(e),this._start()}flush(){for(;this._i<this._tasks.length;)this._tasks[this._i]()||this._i++;this.clear()}clear(){this._idleCallback&&(this._cancelCallback(this._idleCallback),this._idleCallback=void 0),this._i=0,this._tasks.length=0}_start(){this._idleCallback||(this._idleCallback=this._requestCallback(this._process.bind(this)))}_process(e){this._idleCallback=void 0;let a=0,l=0,n=e.timeRemaining(),s=0;for(;this._i<this._tasks.length;){if(a=Date.now(),this._tasks[this._i]()||this._i++,a=Math.max(1,Date.now()-a),l=Math.max(a,l),s=e.timeRemaining(),l*1.5>s){n-a<-20,this._start();return}n=s}this.clear()}}class b extends r{_requestCallback(e){return t().setTimeout(()=>e(this._createDeadline(16)))}_cancelCallback(e){t().clearTimeout(e)}_createDeadline(e){const a=Date.now()+e;return{timeRemaining:()=>Math.max(0,a-Date.now())}}}class d extends r{_requestCallback(e){return t().requestIdleCallback(e)}_cancelCallback(e){t().cancelIdleCallback(e)}}class k{_queue;constructor(){this._queue=new d}set(e){this._queue.clear(),this._queue.enqueue(e)}flush(){this._queue.flush()}}export{k as DebouncedIdleTask,d as IdleTaskQueue,b as PriorityTaskQueue};