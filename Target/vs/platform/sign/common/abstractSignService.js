import"./sign.js";class a{static _nextId=1;validators=new Map;async createNewMessage(t){try{const e=await this.getValidator();if(e){const r=String(a._nextId++);return this.validators.set(r,e),{id:r,data:e.createNewMessage(t)}}}catch{}return{id:"",data:t}}async validate(t,e){if(!t.id)return!0;const r=this.validators.get(t.id);if(!r)return!1;this.validators.delete(t.id);try{return r.validate(e)==="ok"}catch{return!1}finally{r.dispose?.()}}async sign(t){try{return await this.signValue(t)}catch{}return t}}export{a as AbstractSignService};
