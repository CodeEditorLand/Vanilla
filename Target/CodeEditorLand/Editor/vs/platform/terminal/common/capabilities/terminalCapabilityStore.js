import{Emitter as a}from"../../../../base/common/event.js";import{Disposable as n}from"../../../../base/common/lifecycle.js";class d extends n{_map=new Map;_onDidRemoveCapabilityType=this._register(new a);onDidRemoveCapabilityType=this._onDidRemoveCapabilityType.event;_onDidAddCapabilityType=this._register(new a);onDidAddCapabilityType=this._onDidAddCapabilityType.event;_onDidRemoveCapability=this._register(new a);onDidRemoveCapability=this._onDidRemoveCapability.event;_onDidAddCapability=this._register(new a);onDidAddCapability=this._onDidAddCapability.event;get items(){return this._map.keys()}add(i,e){this._map.set(i,e),this._onDidAddCapabilityType.fire(i),this._onDidAddCapability.fire({id:i,capability:e})}get(i){return this._map.get(i)}remove(i){const e=this._map.get(i);e&&(this._map.delete(i),this._onDidRemoveCapabilityType.fire(i),this._onDidAddCapability.fire({id:i,capability:e}))}has(i){return this._map.has(i)}}class o extends n{_stores=[];_onDidRemoveCapabilityType=this._register(new a);onDidRemoveCapabilityType=this._onDidRemoveCapabilityType.event;_onDidAddCapabilityType=this._register(new a);onDidAddCapabilityType=this._onDidAddCapabilityType.event;_onDidRemoveCapability=this._register(new a);onDidRemoveCapability=this._onDidRemoveCapability.event;_onDidAddCapability=this._register(new a);onDidAddCapability=this._onDidAddCapability.event;get items(){return this._items()}*_items(){for(const i of this._stores)for(const e of i.items)yield e}has(i){for(const e of this._stores)for(const t of e.items)if(t===i)return!0;return!1}get(i){for(const e of this._stores){const t=e.get(i);if(t)return t}}add(i){this._stores.push(i);for(const e of i.items)this._onDidAddCapabilityType.fire(e),this._onDidAddCapability.fire({id:e,capability:i.get(e)});this._register(i.onDidAddCapabilityType(e=>this._onDidAddCapabilityType.fire(e))),this._register(i.onDidAddCapability(e=>this._onDidAddCapability.fire(e))),this._register(i.onDidRemoveCapabilityType(e=>this._onDidRemoveCapabilityType.fire(e))),this._register(i.onDidRemoveCapability(e=>this._onDidRemoveCapability.fire(e)))}}export{d as TerminalCapabilityStore,o as TerminalCapabilityStoreMultiplexer};
