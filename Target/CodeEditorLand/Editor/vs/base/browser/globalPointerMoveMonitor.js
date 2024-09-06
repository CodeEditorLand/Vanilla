import{DisposableStore as s,toDisposable as p}from"../common/lifecycle.js";import*as e from"./dom.js";class h{_hooks=new s;_pointerMoveCallback=null;_onStopCallback=null;dispose(){this.stopMonitoring(!1),this._hooks.dispose()}stopMonitoring(o,i){if(!this.isMonitoring())return;this._hooks.clear(),this._pointerMoveCallback=null;const n=this._onStopCallback;this._onStopCallback=null,o&&n&&n(i)}isMonitoring(){return!!this._pointerMoveCallback}startMonitoring(o,i,n,a,l){this.isMonitoring()&&this.stopMonitoring(!1),this._pointerMoveCallback=a,this._onStopCallback=l;let r=o;try{o.setPointerCapture(i),this._hooks.add(p(()=>{try{o.releasePointerCapture(i)}catch{}}))}catch{r=e.getWindow(o)}this._hooks.add(e.addDisposableListener(r,e.EventType.POINTER_MOVE,t=>{if(t.buttons!==n){this.stopMonitoring(!0);return}t.preventDefault(),this._pointerMoveCallback(t)})),this._hooks.add(e.addDisposableListener(r,e.EventType.POINTER_UP,t=>this.stopMonitoring(!0)))}}export{h as GlobalPointerMoveMonitor};
