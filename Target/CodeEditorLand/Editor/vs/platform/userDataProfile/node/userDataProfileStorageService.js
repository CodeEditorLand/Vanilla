var f=Object.defineProperty;var s=Object.getOwnPropertyDescriptor;var v=(m,e,i,o)=>{for(var r=o>1?void 0:o?s(e,i):e,I=m.length-1,p;I>=0;I--)(p=m[I])&&(r=(o?p(e,i,r):p(r))||r);return o&&r&&f(e,i,r),r},t=(m,e)=>(i,o)=>e(i,o,m);import{IMainProcessService as n}from"../../../../vs/platform/ipc/common/mainProcessService.js";import{ILogService as u}from"../../../../vs/platform/log/common/log.js";import{IStorageService as S}from"../../../../vs/platform/storage/common/storage.js";import{IUserDataProfilesService as g}from"../../../../vs/platform/userDataProfile/common/userDataProfile.js";import{RemoteUserDataProfileStorageService as x}from"../../../../vs/platform/userDataProfile/common/userDataProfileStorageService.js";let c=class extends x{constructor(e,i,o,r){super(!0,e,i,o,r)}};c=v([t(0,n),t(1,g),t(2,S),t(3,u)],c);export{c as SharedProcessUserDataProfileStorageService};
