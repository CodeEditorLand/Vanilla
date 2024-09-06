var g=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var m=(t,e,r,o)=>{for(var i=o>1?void 0:o?S(e,r):e,c=t.length-1,a;c>=0;c--)(a=t[c])&&(i=(o?a(e,r,i):a(i))||i);return o&&i&&g(e,r,i),i},n=(t,e)=>(r,o)=>e(r,o,t);import{parse as l}from"../../../../base/common/jsonc.js";import{isLinux as p}from"../../../../base/common/platform.js";import{IEnvironmentService as h}from"../../../../platform/environment/common/environment.js";import{IFileService as I}from"../../../../platform/files/common/files.js";import{Registry as d}from"../../../../platform/registry/common/platform.js";import{IStorageService as f,StorageScope as v,StorageTarget as b}from"../../../../platform/storage/common/storage.js";import{Extensions as u}from"../../../common/contributions.js";import{IJSONEditingService as y}from"../../../services/configuration/common/jsonEditing.js";import{LifecyclePhase as k}from"../../../services/lifecycle/common/lifecycle.js";let s=class{constructor(e,r,o,i){this.jsonEditingService=e;this.environmentService=r;this.fileService=o;this.storageService=i;this.migrateToGnomeLibsecret()}async migrateToGnomeLibsecret(){if(!(!p||this.storageService.getBoolean("encryption.migratedToGnomeLibsecret",v.APPLICATION,!1)))try{const e=await this.fileService.readFile(this.environmentService.argvResource),r=l(e.value.toString());(r["password-store"]==="gnome"||r["password-store"]==="gnome-keyring")&&this.jsonEditingService.write(this.environmentService.argvResource,[{path:["password-store"],value:"gnome-libsecret"}],!0),this.storageService.store("encryption.migratedToGnomeLibsecret",!0,v.APPLICATION,b.USER)}catch(e){console.error(e)}}};s=m([n(0,y),n(1,h),n(2,I),n(3,f)],s),d.as(u.Workbench).registerWorkbenchContribution(s,k.Eventually);
