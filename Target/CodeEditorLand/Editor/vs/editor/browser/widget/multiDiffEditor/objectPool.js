import"../../../../base/common/lifecycle.js";class u{constructor(t){this._create=t}_unused=new Set;_used=new Set;_itemData=new Map;getUnusedObj(t){let e;if(this._unused.size===0)e=this._create(t),this._itemData.set(e,t);else{const s=[...this._unused.values()];e=s.find(a=>this._itemData.get(a).getId()===t.getId())??s[0],this._unused.delete(e),this._itemData.set(e,t),e.setData(t)}return this._used.add(e),{object:e,dispose:()=>{this._used.delete(e),this._unused.size>5?e.dispose():this._unused.add(e)}}}dispose(){for(const t of this._used)t.dispose();for(const t of this._unused)t.dispose();this._used.clear(),this._unused.clear()}}export{u as ObjectPool};
