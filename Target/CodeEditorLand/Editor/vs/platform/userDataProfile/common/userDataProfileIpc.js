import{Emitter as p,Event as d}from"../../../base/common/event.js";import{Disposable as P}from"../../../base/common/lifecycle.js";import{reviveProfile as o}from"./userDataProfile.js";import{transformIncomingURIs as f,transformOutgoingURIs as t}from"../../../base/common/uriIpc.js";class O{constructor(n,r){this.service=n;this.getUriTransformer=r}listen(n,r){const i=this.getUriTransformer(n);switch(r){case"onDidChangeProfiles":return d.map(this.service.onDidChangeProfiles,s=>({all:s.all.map(e=>t({...e},i)),added:s.added.map(e=>t({...e},i)),removed:s.removed.map(e=>t({...e},i)),updated:s.updated.map(e=>t({...e},i))}))}throw new Error(`Invalid listen ${r}`)}async call(n,r,i){const s=this.getUriTransformer(n);switch(r){case"createProfile":{const e=await this.service.createProfile(i[0],i[1],i[2]);return t({...e},s)}case"updateProfile":{let e=o(f(i[0],s),this.service.profilesHome.scheme);return e=await this.service.updateProfile(e,i[1]),t({...e},s)}case"removeProfile":{const e=o(f(i[0],s),this.service.profilesHome.scheme);return this.service.removeProfile(e)}}throw new Error(`Invalid call ${r}`)}}class A extends P{constructor(r,i,s){super();this.profilesHome=i;this.channel=s;this._profiles=r.map(e=>o(e,this.profilesHome.scheme)),this._register(this.channel.listen("onDidChangeProfiles")(e=>{const l=e.added.map(a=>o(a,this.profilesHome.scheme)),h=e.removed.map(a=>o(a,this.profilesHome.scheme)),m=e.updated.map(a=>o(a,this.profilesHome.scheme));this._profiles=e.all.map(a=>o(a,this.profilesHome.scheme)),this._onDidChangeProfiles.fire({added:l,removed:h,updated:m,all:this.profiles})})),this.onDidResetWorkspaces=this.channel.listen("onDidResetWorkspaces")}_serviceBrand;get defaultProfile(){return this.profiles[0]}_profiles=[];get profiles(){return this._profiles}_onDidChangeProfiles=this._register(new p);onDidChangeProfiles=this._onDidChangeProfiles.event;onDidResetWorkspaces;enabled=!0;setEnablement(r){this.enabled=r}isEnabled(){return this.enabled}async createNamedProfile(r,i,s){const e=await this.channel.call("createNamedProfile",[r,i,s]);return o(e,this.profilesHome.scheme)}async createProfile(r,i,s,e){const l=await this.channel.call("createProfile",[r,i,s,e]);return o(l,this.profilesHome.scheme)}async createTransientProfile(r){const i=await this.channel.call("createTransientProfile",[r]);return o(i,this.profilesHome.scheme)}async setProfileForWorkspace(r,i){await this.channel.call("setProfileForWorkspace",[r,i])}removeProfile(r){return this.channel.call("removeProfile",[r])}async updateProfile(r,i){const s=await this.channel.call("updateProfile",[r,i]);return o(s,this.profilesHome.scheme)}resetWorkspaces(){return this.channel.call("resetWorkspaces")}cleanUp(){return this.channel.call("cleanUp")}cleanUpTransientProfiles(){return this.channel.call("cleanUpTransientProfiles")}}export{O as RemoteUserDataProfilesServiceChannel,A as UserDataProfilesService};
