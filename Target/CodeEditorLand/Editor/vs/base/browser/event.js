import{Emitter as r}from"../common/event.js";class m{emitter;get event(){return this.emitter.event}constructor(e,t,n){const o=s=>this.emitter.fire(s);this.emitter=new r({onWillAddFirstListener:()=>e.addEventListener(t,o,n),onDidRemoveLastListener:()=>e.removeEventListener(t,o,n)})}dispose(){this.emitter.dispose()}}export{m as DomEmitter};
