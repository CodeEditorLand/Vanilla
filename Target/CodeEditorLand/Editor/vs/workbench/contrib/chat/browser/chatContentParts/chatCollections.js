import{Disposable as s}from"../../../../../../vs/base/common/lifecycle.js";class a extends s{constructor(e){super();this._itemFactory=e}pool=[];_inUse=new Set;get inUse(){return this._inUse}get(){if(this.pool.length>0){const t=this.pool.pop();return this._inUse.add(t),t}const e=this._register(this._itemFactory());return this._inUse.add(e),e}release(e){this._inUse.delete(e),this.pool.push(e)}}export{a as ResourcePool};