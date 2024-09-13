var p=Object.defineProperty;var l=Object.getOwnPropertyDescriptor;var g=(m,e,n,r)=>{for(var o=r>1?void 0:r?l(e,n):e,c=m.length-1,s;c>=0;c--)(s=m[c])&&(o=(r?s(e,n,o):s(o))||o);return r&&o&&p(e,n,o),o},a=(m,e)=>(n,r)=>e(n,r,m);import{VSBuffer as v}from"../../../../base/common/buffer.js";import{URI as I}from"../../../../base/common/uri.js";import{ICommandService as S}from"../../../../platform/commands/common/commands.js";import{Extensions as C}from"../../../../platform/configuration/common/configurationRegistry.js";import{IFileService as y}from"../../../../platform/files/common/files.js";import{IProductService as h}from"../../../../platform/product/common/productService.js";import{Registry as w}from"../../../../platform/registry/common/platform.js";import{INativeWorkbenchEnvironmentService as x}from"../../../services/environment/electron-sandbox/environmentService.js";import{IExtensionService as E}from"../../../services/extensions/common/extensions.js";let d=class{constructor(e,n,r,o,c){this.extensionService=n;this.commandService=r;this.fileService=o;this.productService=c;const s=e.args["export-default-configuration"];s&&this.writeConfigModelAndQuit(I.file(s))}async writeConfigModelAndQuit(e){try{await this.extensionService.whenInstalledExtensionsRegistered(),await this.writeConfigModel(e)}finally{this.commandService.executeCommand("workbench.action.quit")}}async writeConfigModel(e){const n=this.getConfigModel(),r=JSON.stringify(n,void 0,"  ");await this.fileService.writeFile(e,v.fromString(r))}getConfigModel(){const e=w.as(C.Configuration),n=e.getConfigurations().slice(),r=[],o=new Set,c=(t,i)=>{if(o.has(t))return;o.add(t);const u={name:t,description:i.description||i.markdownDescription||"",default:i.default,type:i.type};i.enum&&(u.enum=i.enum),(i.enumDescriptions||i.markdownEnumDescriptions)&&(u.enumDescriptions=i.enumDescriptions||i.markdownEnumDescriptions),r.push(u)},s=t=>{if(t.properties)for(const i in t.properties)c(i,t.properties[i]);t.allOf?.forEach(s)};n.forEach(s);const f=e.getExcludedConfigurationProperties();for(const t in f)c(t,f[t]);return{settings:r.sort((t,i)=>t.name.localeCompare(i.name)),buildTime:Date.now(),commit:this.productService.commit,buildNumber:this.productService.settingsSearchBuildId}}};d=g([a(0,x),a(1,E),a(2,S),a(3,y),a(4,h)],d);export{d as DefaultConfigurationExportHelper};
