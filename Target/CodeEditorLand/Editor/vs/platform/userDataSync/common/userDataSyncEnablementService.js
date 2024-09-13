var y=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var u=(o,r,e,n)=>{for(var t=n>1?void 0:n?v(r,e):r,c=o.length-1,i;c>=0;c--)(i=o[c])&&(t=(n?i(r,e,t):i(t))||t);return n&&t&&y(r,e,t),t},a=(o,r)=>(e,n)=>r(e,n,o);import{Emitter as d}from"../../../base/common/event.js";import{Disposable as b,DisposableStore as h}from"../../../base/common/lifecycle.js";import{isWeb as p}from"../../../base/common/platform.js";import{IEnvironmentService as E}from"../../environment/common/environment.js";import{IStorageService as f,StorageScope as s,StorageTarget as m}from"../../storage/common/storage.js";import{ITelemetryService as I}from"../../telemetry/common/telemetry.js";import{ALL_SYNC_RESOURCES as C,IUserDataSyncStoreManagementService as R,getEnablementKey as g}from"./userDataSync.js";const l="sync.enable";let S=class extends b{constructor(e,n,t,c){super();this.storageService=e;this.telemetryService=n;this.environmentService=t;this.userDataSyncStoreManagementService=c;this._register(e.onDidChangeValue(s.APPLICATION,void 0,this._register(new h))(i=>this.onDidStorageChange(i)))}_serviceBrand;_onDidChangeEnablement=new d;onDidChangeEnablement=this._onDidChangeEnablement.event;_onDidChangeResourceEnablement=new d;onDidChangeResourceEnablement=this._onDidChangeResourceEnablement.event;isEnabled(){switch(this.environmentService.sync){case"on":return!0;case"off":return!1}return this.storageService.getBoolean(l,s.APPLICATION,!1)}canToggleEnablement(){return this.userDataSyncStoreManagementService.userDataSyncStore!==void 0&&this.environmentService.sync===void 0}setEnablement(e){e&&!this.canToggleEnablement()||(this.telemetryService.publicLog2(l,{enabled:e}),this.storageService.store(l,e,s.APPLICATION,m.MACHINE))}isResourceEnabled(e){return this.storageService.getBoolean(g(e),s.APPLICATION,!0)}setResourceEnablement(e,n){if(this.isResourceEnabled(e)!==n){const t=g(e);this.storeResourceEnablement(t,n)}}getResourceSyncStateVersion(e){}storeResourceEnablement(e,n){this.storageService.store(e,n,s.APPLICATION,p?m.USER:m.MACHINE)}onDidStorageChange(e){if(l===e.key){this._onDidChangeEnablement.fire(this.isEnabled());return}const n=C.filter(t=>g(t)===e.key)[0];if(n){this._onDidChangeResourceEnablement.fire([n,this.isResourceEnabled(n)]);return}}};S=u([a(0,f),a(1,I),a(2,E),a(3,R)],S);export{S as UserDataSyncEnablementService};
