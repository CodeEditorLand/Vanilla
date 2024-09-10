import{Emitter as s,Event as o}from"../../../base/common/event.js";import{Disposable as l}from"../../../base/common/lifecycle.js";class i extends l{constructor(t,a,d){super();this.channel=t;this.profile=a;this.workspace=d}async getItems(){const t={profile:this.profile,workspace:this.workspace},a=await this.channel.call("getItems",t);return new Map(a)}updateItems(t){const a={profile:this.profile,workspace:this.workspace};return t.insert&&(a.insert=Array.from(t.insert.entries())),t.delete&&(a.delete=Array.from(t.delete.values())),this.channel.call("updateItems",a)}optimize(){const t={profile:this.profile,workspace:this.workspace};return this.channel.call("optimize",t)}}class n extends i{_onDidChangeItemsExternal=this._register(new s);onDidChangeItemsExternal=this._onDidChangeItemsExternal.event;constructor(e,t){super(e,t,void 0),this.registerListeners()}registerListeners(){this._register(this.channel.listen("onDidChangeStorage",{profile:this.profile})(e=>this.onDidChangeStorage(e)))}onDidChangeStorage(e){(Array.isArray(e.changed)||Array.isArray(e.deleted))&&this._onDidChangeItemsExternal.fire({changed:e.changed?new Map(e.changed):void 0,deleted:e.deleted?new Set(e.deleted):void 0})}}class E extends n{constructor(e){super(e,void 0)}async close(){this.dispose()}}class U extends n{constructor(e,t){super(e,t)}async close(){this.dispose()}}class w extends i{onDidChangeItemsExternal=o.None;constructor(e,t){super(e,void 0,t)}async close(){this.dispose()}}class P{constructor(e){this.channel=e}isUsed(e){const t={payload:e,profile:void 0,workspace:void 0};return this.channel.call("isUsed",t)}}export{E as ApplicationStorageDatabaseClient,U as ProfileStorageDatabaseClient,P as StorageClient,w as WorkspaceStorageDatabaseClient};
