var I=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var c=(n,e,r,t)=>{for(var i=t>1?void 0:t?p(e,r):e,s=n.length-1,f;s>=0;s--)(f=n[s])&&(i=(t?f(e,r,i):f(i))||i);return t&&i&&I(e,r,i),i},o=(n,e)=>(r,t)=>e(r,t,n);import"../../../base/common/event.js";import{INativeEnvironmentService as m}from"../../environment/common/environment.js";import{IFileService as l}from"../../files/common/files.js";import{refineServiceDecorator as v}from"../../instantiation/common/instantiation.js";import{ILogService as d}from"../../log/common/log.js";import{IUriIdentityService as W}from"../../uriIdentity/common/uriIdentity.js";import{IUserDataProfilesService as S}from"../common/userDataProfile.js";import{UserDataProfilesService as y}from"../node/userDataProfile.js";import"../../workspace/common/workspace.js";import{IStateService as E}from"../../state/node/state.js";const M=v(S);let a=class extends y{constructor(e,r,t,i,s){super(e,r,t,i,s)}getAssociatedEmptyWindows(){const e=[];for(const r of this.profilesObject.emptyWindows.keys())e.push({id:r});return e}};a=c([o(0,E),o(1,W),o(2,m),o(3,l),o(4,d)],a);export{M as IUserDataProfilesMainService,a as UserDataProfilesMainService};
