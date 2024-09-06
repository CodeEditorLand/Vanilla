var S=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var C=(b,t,a,i)=>{for(var s=i>1?void 0:i?w(t,a):t,e=b.length-1,o;e>=0;e--)(o=b[e])&&(s=(i?o(t,a,s):o(s))||s);return i&&s&&S(t,a,s),s};import*as f from"../../../vs/base/browser/dom.js";import{mainWindow as Y}from"../../../vs/base/browser/window.js";import*as u from"../../../vs/base/common/arrays.js";import{memoize as x}from"../../../vs/base/common/decorators.js";import{Event as A}from"../../../vs/base/common/event.js";import{Disposable as P,markAsSingleton as X,toDisposable as D}from"../../../vs/base/common/lifecycle.js";import{LinkedList as N}from"../../../vs/base/common/linkedList.js";var h;(e=>(e.Tap="-monaco-gesturetap",e.Change="-monaco-gesturechange",e.Start="-monaco-gesturestart",e.End="-monaco-gesturesend",e.Contextmenu="-monaco-gesturecontextmenu"))(h||={});const r=class r extends P{static SCROLL_FRICTION=-.005;static INSTANCE;static HOLD_DELAY=700;dispatched=!1;targets=new N;ignoreTargets=new N;handle;activeTouches;_lastSetTapCountTime;static CLEAR_TAP_COUNT_TIME=400;constructor(){super(),this.activeTouches={},this.handle=null,this._lastSetTapCountTime=0,this._register(A.runAndSubscribe(f.onDidRegisterWindow,({window:t,disposables:a})=>{a.add(f.addDisposableListener(t.document,"touchstart",i=>this.onTouchStart(i),{passive:!1})),a.add(f.addDisposableListener(t.document,"touchend",i=>this.onTouchEnd(t,i))),a.add(f.addDisposableListener(t.document,"touchmove",i=>this.onTouchMove(i),{passive:!1}))},{window:Y,disposables:this._store}))}static addTarget(t){if(!r.isTouchDevice())return P.None;r.INSTANCE||(r.INSTANCE=X(new r));const a=r.INSTANCE.targets.push(t);return D(a)}static ignoreTarget(t){if(!r.isTouchDevice())return P.None;r.INSTANCE||(r.INSTANCE=X(new r));const a=r.INSTANCE.ignoreTargets.push(t);return D(a)}static isTouchDevice(){return"ontouchstart"in Y||navigator.maxTouchPoints>0}dispose(){this.handle&&(this.handle.dispose(),this.handle=null),super.dispose()}onTouchStart(t){const a=Date.now();this.handle&&(this.handle.dispose(),this.handle=null);for(let i=0,s=t.targetTouches.length;i<s;i++){const e=t.targetTouches.item(i);this.activeTouches[e.identifier]={id:e.identifier,initialTarget:e.target,initialTimeStamp:a,initialPageX:e.pageX,initialPageY:e.pageY,rollingTimestamps:[a],rollingPageX:[e.pageX],rollingPageY:[e.pageY]};const o=this.newGestureEvent(h.Start,e.target);o.pageX=e.pageX,o.pageY=e.pageY,this.dispatchEvent(o)}this.dispatched&&(t.preventDefault(),t.stopPropagation(),this.dispatched=!1)}onTouchEnd(t,a){const i=Date.now(),s=Object.keys(this.activeTouches).length;for(let e=0,o=a.changedTouches.length;e<o;e++){const l=a.changedTouches.item(e);if(!this.activeTouches.hasOwnProperty(String(l.identifier))){console.warn("move of an UNKNOWN touch",l);continue}const n=this.activeTouches[l.identifier],v=Date.now()-n.initialTimeStamp;if(v<r.HOLD_DELAY&&Math.abs(n.initialPageX-u.tail(n.rollingPageX))<30&&Math.abs(n.initialPageY-u.tail(n.rollingPageY))<30){const c=this.newGestureEvent(h.Tap,n.initialTarget);c.pageX=u.tail(n.rollingPageX),c.pageY=u.tail(n.rollingPageY),this.dispatchEvent(c)}else if(v>=r.HOLD_DELAY&&Math.abs(n.initialPageX-u.tail(n.rollingPageX))<30&&Math.abs(n.initialPageY-u.tail(n.rollingPageY))<30){const c=this.newGestureEvent(h.Contextmenu,n.initialTarget);c.pageX=u.tail(n.rollingPageX),c.pageY=u.tail(n.rollingPageY),this.dispatchEvent(c)}else if(s===1){const c=u.tail(n.rollingPageX),g=u.tail(n.rollingPageY),p=u.tail(n.rollingTimestamps)-n.rollingTimestamps[0],m=c-n.rollingPageX[0],d=g-n.rollingPageY[0],T=[...this.targets].filter(E=>n.initialTarget instanceof Node&&E.contains(n.initialTarget));this.inertia(t,T,i,Math.abs(m)/p,m>0?1:-1,c,Math.abs(d)/p,d>0?1:-1,g)}this.dispatchEvent(this.newGestureEvent(h.End,n.initialTarget)),delete this.activeTouches[l.identifier]}this.dispatched&&(a.preventDefault(),a.stopPropagation(),this.dispatched=!1)}newGestureEvent(t,a){const i=document.createEvent("CustomEvent");return i.initEvent(t,!1,!0),i.initialTarget=a,i.tapCount=0,i}dispatchEvent(t){if(t.type===h.Tap){const a=new Date().getTime();let i=0;a-this._lastSetTapCountTime>r.CLEAR_TAP_COUNT_TIME?i=1:i=2,this._lastSetTapCountTime=a,t.tapCount=i}else(t.type===h.Change||t.type===h.Contextmenu)&&(this._lastSetTapCountTime=0);if(t.initialTarget instanceof Node){for(const i of this.ignoreTargets)if(i.contains(t.initialTarget))return;const a=[];for(const i of this.targets)if(i.contains(t.initialTarget)){let s=0,e=t.initialTarget;for(;e&&e!==i;)s++,e=e.parentElement;a.push([s,i])}a.sort((i,s)=>i[0]-s[0]);for(const[i,s]of a)s.dispatchEvent(t),this.dispatched=!0}}inertia(t,a,i,s,e,o,l,n,v){this.handle=f.scheduleAtNextAnimationFrame(t,()=>{const c=Date.now(),g=c-i;let p=0,m=0,d=!0;s+=r.SCROLL_FRICTION*g,l+=r.SCROLL_FRICTION*g,s>0&&(d=!1,p=e*s*g),l>0&&(d=!1,m=n*l*g);const T=this.newGestureEvent(h.Change);T.translationX=p,T.translationY=m,a.forEach(E=>E.dispatchEvent(T)),d||this.inertia(t,a,c,s,e,o+p,l,n,v+m)})}onTouchMove(t){const a=Date.now();for(let i=0,s=t.changedTouches.length;i<s;i++){const e=t.changedTouches.item(i);if(!this.activeTouches.hasOwnProperty(String(e.identifier))){console.warn("end of an UNKNOWN touch",e);continue}const o=this.activeTouches[e.identifier],l=this.newGestureEvent(h.Change,o.initialTarget);l.translationX=e.pageX-u.tail(o.rollingPageX),l.translationY=e.pageY-u.tail(o.rollingPageY),l.pageX=e.pageX,l.pageY=e.pageY,this.dispatchEvent(l),o.rollingPageX.length>3&&(o.rollingPageX.shift(),o.rollingPageY.shift(),o.rollingTimestamps.shift()),o.rollingPageX.push(e.pageX),o.rollingPageY.push(e.pageY),o.rollingTimestamps.push(a)}this.dispatched&&(t.preventDefault(),t.stopPropagation(),this.dispatched=!1)}};C([x],r,"isTouchDevice",1);let L=r;export{h as EventType,L as Gesture};