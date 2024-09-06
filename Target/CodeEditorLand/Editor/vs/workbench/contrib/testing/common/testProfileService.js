var h=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var g=(l,e,t,r)=>{for(var o=r>1?void 0:r?T(e,t):e,i=l.length-1,s;i>=0;i--)(s=l[i])&&(o=(r?s(e,t,o):s(o))||o);return r&&o&&h(e,t,o),o},u=(l,e)=>(t,r)=>e(t,r,l);import{Emitter as b}from"../../../../../vs/base/common/event.js";import{Iterable as m}from"../../../../../vs/base/common/iterator.js";import{Disposable as D}from"../../../../../vs/base/common/lifecycle.js";import{deepClone as C}from"../../../../../vs/base/common/objects.js";import{IContextKeyService as R}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{createDecorator as v}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IStorageService as x,StorageScope as I,StorageTarget as y}from"../../../../../vs/platform/storage/common/storage.js";import{StoredValue as E}from"../../../../../vs/workbench/contrib/testing/common/storedValue.js";import{TestId as P}from"../../../../../vs/workbench/contrib/testing/common/testId.js";import{TestingContextKeys as f}from"../../../../../vs/workbench/contrib/testing/common/testingContextKeys.js";import"../../../../../vs/workbench/contrib/testing/common/testService.js";import{TestRunProfileBitset as n,testRunProfileBitsetList as M}from"../../../../../vs/workbench/contrib/testing/common/testTypes.js";const J=v("testProfileService"),Q=(l,e)=>l.controllerId===e.controllerId&&(P.isRoot(e.item.extId)||!l.tag||e.item.tags.includes(l.tag)),d=(l,e)=>l.isDefault!==e.isDefault?l.isDefault?-1:1:l.label.localeCompare(e.label),X=l=>[[f.hasRunnableTests.key,(l&n.Run)!==0],[f.hasDebuggableTests.key,(l&n.Debug)!==0],[f.hasCoverableTests.key,(l&n.Coverage)!==0]];let a=class extends D{userDefaults;capabilitiesContexts;changeEmitter=this._register(new b);controllerProfiles=new Map;onDidChange=this.changeEmitter.event;constructor(e,t){super(),t.remove("testingPreferredProfiles",I.WORKSPACE),this.userDefaults=this._register(new E({key:"testingPreferredProfiles2",scope:I.WORKSPACE,target:y.MACHINE},t)),this.capabilitiesContexts={[n.Run]:f.hasRunnableTests.bindTo(e),[n.Debug]:f.hasDebuggableTests.bindTo(e),[n.Coverage]:f.hasCoverableTests.bindTo(e),[n.HasNonDefaultProfile]:f.hasNonDefaultProfile.bindTo(e),[n.HasConfigurable]:f.hasConfigurableProfile.bindTo(e),[n.SupportsContinuousRun]:f.supportsContinuousRun.bindTo(e)},this.refreshContextKeys()}addProfile(e,t){const r=this.userDefaults.get()?.[e.id]?.[t.profileId],o={...t,isDefault:r??t.isDefault,wasInitiallyDefault:t.isDefault};let i=this.controllerProfiles.get(t.controllerId);i?(i.profiles.push(o),i.profiles.sort(d)):(i={profiles:[o],controller:e},this.controllerProfiles.set(t.controllerId,i)),this.refreshContextKeys(),this.changeEmitter.fire()}updateProfile(e,t,r){const o=this.controllerProfiles.get(e);if(!o)return;const i=o.profiles.find(s=>s.controllerId===e&&s.profileId===t);if(i){if(Object.assign(i,r),o.profiles.sort(d),r.isDefault!==void 0){const s=C(this.userDefaults.get({}));c(s,i,r.isDefault),this.userDefaults.store(s)}this.changeEmitter.fire()}}configure(e,t){this.controllerProfiles.get(e)?.controller.configureRunProfile(t)}removeProfile(e,t){const r=this.controllerProfiles.get(e);if(!r)return;if(!t){this.controllerProfiles.delete(e),this.changeEmitter.fire();return}const o=r.profiles.findIndex(i=>i.profileId===t);o!==-1&&(r.profiles.splice(o,1),this.refreshContextKeys(),this.changeEmitter.fire())}capabilitiesForTest(e){const t=this.controllerProfiles.get(P.root(e.extId));if(!t)return 0;let r=0;for(const o of t.profiles)(!o.tag||e.tags.includes(o.tag))&&(r|=r&o.group?n.HasNonDefaultProfile:o.group);return r}all(){return this.controllerProfiles.values()}getControllerProfiles(e){return this.controllerProfiles.get(e)?.profiles??[]}getGroupDefaultProfiles(e,t){const r=t?this.controllerProfiles.get(t)?.profiles||[]:[...m.flatMap(this.controllerProfiles.values(),i=>i.profiles)],o=r.filter(i=>i.group===e&&i.isDefault);if(o.length===0){const i=r.find(s=>s.group===e);i&&o.push(i)}return o}setGroupDefaultProfiles(e,t){const r={};for(const o of this.controllerProfiles.values()){r[o.controller.id]={};for(const i of o.profiles)i.group===e&&c(r,i,t.some(s=>s.profileId===i.profileId));for(const i of o.profiles){if(i.group===e)continue;const s=o.profiles.find(p=>p.group===e&&p.label===i.label);s&&c(r,i,s.isDefault)}o.profiles.sort(d)}this.userDefaults.store(r),this.changeEmitter.fire()}refreshContextKeys(){let e=0;for(const{profiles:t}of this.controllerProfiles.values())for(const r of t)e|=e&r.group?n.HasNonDefaultProfile:r.group,e|=r.supportsContinuousRun?n.SupportsContinuousRun:0;for(const t of M)this.capabilitiesContexts[t].set((e&t)!==0)}};a=g([u(0,R),u(1,x)],a);const c=(l,e,t)=>{e.isDefault=t,l[e.controllerId]??={},e.isDefault!==e.wasInitiallyDefault?l[e.controllerId][e.profileId]=e.isDefault:delete l[e.controllerId][e.profileId]};export{J as ITestProfileService,a as TestProfileService,Q as canUseProfileWithTest,X as capabilityContextKeys};
