var C=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var a=(s,l,e,i)=>{for(var t=i>1?void 0:i?m(l,e):l,o=s.length-1,n;o>=0;o--)(n=s[o])&&(t=(i?n(l,e,t):n(t))||t);return i&&t&&C(l,e,t),t},c=(s,l)=>(e,i)=>l(e,i,s);import{Emitter as h}from"../../../../base/common/event.js";import{debounce as E,throttle as g}from"../../../../base/common/decorators.js";import{IStorageService as _,StorageScope as d,StorageTarget as f}from"../../../../platform/storage/common/storage.js";import{IExtensionService as S}from"../../../services/extensions/common/extensions.js";import{MergedEnvironmentVariableCollection as b}from"../../../../platform/terminal/common/environmentVariableCollection.js";import{deserializeEnvironmentDescriptionMap as I,deserializeEnvironmentVariableCollection as x,serializeEnvironmentDescriptionMap as u,serializeEnvironmentVariableCollection as M}from"../../../../platform/terminal/common/environmentVariableShared.js";import{TerminalStorageKeys as p}from"./terminalStorageKeys.js";import{Disposable as V}from"../../../../base/common/lifecycle.js";let r=class extends V{constructor(e,i){super();this._extensionService=e;this._storageService=i;this._storageService.remove(p.DeprecatedEnvironmentVariableCollections,d.WORKSPACE);const t=this._storageService.get(p.EnvironmentVariableCollections,d.WORKSPACE);t&&(JSON.parse(t).forEach(n=>this.collections.set(n.extensionIdentifier,{persistent:!0,map:x(n.collection),descriptionMap:I(n.description)})),this._invalidateExtensionCollections()),this.mergedCollection=this._resolveMergedCollection(),this._register(this._extensionService.onDidChangeExtensions(()=>this._invalidateExtensionCollections()))}collections=new Map;mergedCollection;_onDidChangeCollections=this._register(new h);get onDidChangeCollections(){return this._onDidChangeCollections.event}set(e,i){this.collections.set(e,i),this._updateCollections()}delete(e){this.collections.delete(e),this._updateCollections()}_updateCollections(){this._persistCollectionsEventually(),this.mergedCollection=this._resolveMergedCollection(),this._notifyCollectionUpdatesEventually()}_persistCollectionsEventually(){this._persistCollections()}_persistCollections(){const e=[];this.collections.forEach((t,o)=>{t.persistent&&e.push({extensionIdentifier:o,collection:M(this.collections.get(o).map),description:u(t.descriptionMap)})});const i=JSON.stringify(e);this._storageService.store(p.EnvironmentVariableCollections,i,d.WORKSPACE,f.MACHINE)}_notifyCollectionUpdatesEventually(){this._notifyCollectionUpdates()}_notifyCollectionUpdates(){this._onDidChangeCollections.fire(this.mergedCollection)}_resolveMergedCollection(){return new b(this.collections)}async _invalidateExtensionCollections(){await this._extensionService.whenInstalledExtensionsRegistered();const e=this._extensionService.extensions;let i=!1;this.collections.forEach((t,o)=>{e.some(v=>v.identifier.value===o)||(this.collections.delete(o),i=!0)}),i&&this._updateCollections()}};a([g(1e3)],r.prototype,"_persistCollectionsEventually",1),a([E(1e3)],r.prototype,"_notifyCollectionUpdatesEventually",1),r=a([c(0,S),c(1,_)],r);export{r as EnvironmentVariableService};
