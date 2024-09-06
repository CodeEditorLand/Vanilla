var m=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var h=(i,a,e,t)=>{for(var n=t>1?void 0:t?p(a,e):a,r=i.length-1,s;r>=0;r--)(s=i[r])&&(n=(t?s(a,e,n):s(n))||n);return t&&n&&m(a,e,n),n},y=(i,a)=>(e,t)=>a(e,t,i);import"../../../../vs/base/common/cancellation.js";import{Emitter as l}from"../../../../vs/base/common/event.js";import{Disposable as v}from"../../../../vs/base/common/lifecycle.js";import{URI as c}from"../../../../vs/base/common/uri.js";import"../../../../vs/base/parts/ipc/common/ipc.js";import"../../../../vs/platform/log/common/log.js";import{IUserDataProfilesService as D,reviveProfile as S}from"../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{SyncStatus as R,UserDataSyncError as d}from"../../../../vs/platform/userDataSync/common/userDataSync.js";function f(i,a){return{...i,profile:S(i.profile,a.profilesHome.scheme)}}function g(i){return{created:i.created,uri:c.revive(i.uri)}}class G{constructor(a,e,t){this.service=a;this.userDataProfilesService=e;this.logService=t}manualSyncTasks=new Map;onManualSynchronizeResources=new l;listen(a,e){switch(e){case"onDidChangeStatus":return this.service.onDidChangeStatus;case"onDidChangeConflicts":return this.service.onDidChangeConflicts;case"onDidChangeLocal":return this.service.onDidChangeLocal;case"onDidChangeLastSyncTime":return this.service.onDidChangeLastSyncTime;case"onSyncErrors":return this.service.onSyncErrors;case"onDidResetLocal":return this.service.onDidResetLocal;case"onDidResetRemote":return this.service.onDidResetRemote;case"manualSync/onSynchronizeResources":return this.onManualSynchronizeResources.event}throw new Error(`[UserDataSyncServiceChannel] Event not found: ${e}`)}async call(a,e,t){try{return await this._call(a,e,t)}catch(n){throw this.logService.error(n),n}}async _call(a,e,t){switch(e){case"_getInitialData":return Promise.resolve([this.service.status,this.service.conflicts,this.service.lastSyncTime]);case"reset":return this.service.reset();case"resetRemote":return this.service.resetRemote();case"resetLocal":return this.service.resetLocal();case"hasPreviouslySynced":return this.service.hasPreviouslySynced();case"hasLocalData":return this.service.hasLocalData();case"resolveContent":return this.service.resolveContent(c.revive(t[0]));case"accept":return this.service.accept(f(t[0],this.userDataProfilesService),c.revive(t[1]),t[2],t[3]);case"replace":return this.service.replace(g(t[0]));case"cleanUpRemoteData":return this.service.cleanUpRemoteData();case"getRemoteActivityData":return this.service.saveRemoteActivityData(c.revive(t[0]));case"extractActivityData":return this.service.extractActivityData(c.revive(t[0]),c.revive(t[1]));case"createManualSyncTask":return this.createManualSyncTask()}if(e.startsWith("manualSync/")){const n=e.substring(11),r=t[0],s=this.getManualSyncTask(r);switch(t=t.slice(1),n){case"merge":return s.merge();case"apply":return s.apply().then(()=>this.manualSyncTasks.delete(this.createKey(s.id)));case"stop":return s.stop().finally(()=>this.manualSyncTasks.delete(this.createKey(s.id)))}}throw new Error("Invalid call")}getManualSyncTask(a){const e=this.manualSyncTasks.get(this.createKey(a));if(!e)throw new Error(`Manual sync taks not found: ${a}`);return e}async createManualSyncTask(){const a=await this.service.createManualSyncTask();return this.manualSyncTasks.set(this.createKey(a.id),a),a.id}createKey(a){return`manualSyncTask-${a}`}}let u=class extends v{constructor(e,t){super();this.userDataProfilesService=t;this.channel={call(n,r,s){return e.call(n,r,s).then(null,o=>{throw d.toUserDataSyncError(o)})},listen(n,r){return e.listen(n,r)}},this.channel.call("_getInitialData").then(([n,r,s])=>{this.updateStatus(n),this.updateConflicts(r),s&&this.updateLastSyncTime(s),this._register(this.channel.listen("onDidChangeStatus")(o=>this.updateStatus(o))),this._register(this.channel.listen("onDidChangeLastSyncTime")(o=>this.updateLastSyncTime(o)))}),this._register(this.channel.listen("onDidChangeConflicts")(n=>this.updateConflicts(n))),this._register(this.channel.listen("onSyncErrors")(n=>this._onSyncErrors.fire(n.map(r=>({...r,error:d.toUserDataSyncError(r.error)})))))}channel;_status=R.Uninitialized;get status(){return this._status}_onDidChangeStatus=this._register(new l);onDidChangeStatus=this._onDidChangeStatus.event;get onDidChangeLocal(){return this.channel.listen("onDidChangeLocal")}_conflicts=[];get conflicts(){return this._conflicts}_onDidChangeConflicts=this._register(new l);onDidChangeConflicts=this._onDidChangeConflicts.event;_lastSyncTime=void 0;get lastSyncTime(){return this._lastSyncTime}_onDidChangeLastSyncTime=this._register(new l);onDidChangeLastSyncTime=this._onDidChangeLastSyncTime.event;_onSyncErrors=this._register(new l);onSyncErrors=this._onSyncErrors.event;get onDidResetLocal(){return this.channel.listen("onDidResetLocal")}get onDidResetRemote(){return this.channel.listen("onDidResetRemote")}createSyncTask(){throw new Error("not supported")}async createManualSyncTask(){const e=await this.channel.call("createManualSyncTask"),t=this;return new T(e,{async call(r,s,o){return t.channel.call(`manualSync/${r}`,[e,...Array.isArray(s)?s:[s]],o)},listen(){throw new Error("not supported")}})}reset(){return this.channel.call("reset")}resetRemote(){return this.channel.call("resetRemote")}resetLocal(){return this.channel.call("resetLocal")}hasPreviouslySynced(){return this.channel.call("hasPreviouslySynced")}hasLocalData(){return this.channel.call("hasLocalData")}accept(e,t,n,r){return this.channel.call("accept",[e,t,n,r])}resolveContent(e){return this.channel.call("resolveContent",[e])}cleanUpRemoteData(){return this.channel.call("cleanUpRemoteData")}replace(e){return this.channel.call("replace",[e])}saveRemoteActivityData(e){return this.channel.call("getRemoteActivityData",[e])}extractActivityData(e,t){return this.channel.call("extractActivityData",[e,t])}async updateStatus(e){this._status=e,this._onDidChangeStatus.fire(e)}async updateConflicts(e){this._conflicts=e.map(t=>({syncResource:t.syncResource,profile:S(t.profile,this.userDataProfilesService.profilesHome.scheme),conflicts:t.conflicts.map(n=>({...n,baseResource:c.revive(n.baseResource),localResource:c.revive(n.localResource),remoteResource:c.revive(n.remoteResource),previewResource:c.revive(n.previewResource)}))})),this._onDidChangeConflicts.fire(this._conflicts)}updateLastSyncTime(e){this._lastSyncTime!==e&&(this._lastSyncTime=e,this._onDidChangeLastSyncTime.fire(e))}};u=h([y(1,D)],u);class T extends v{constructor(e,t){super();this.id=e;this.channel=t}async merge(){return this.channel.call("merge")}async apply(){return this.channel.call("apply")}stop(){return this.channel.call("stop")}dispose(){this.channel.call("dispose"),super.dispose()}}export{G as UserDataSyncServiceChannel,u as UserDataSyncServiceChannelClient};