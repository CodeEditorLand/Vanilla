import{importAMDNodeModule as t}from"../../../amdX.js";import{AbstractSignService as i}from"../common/abstractSignService.js";class n extends i{getValidator(){return this.vsda().then(e=>new e.validator)}signValue(e){return this.vsda().then(r=>new r.signer().sign(e))}async vsda(){const e="vsda",{default:r}=await import(e);return r}}export{n as SignService};
