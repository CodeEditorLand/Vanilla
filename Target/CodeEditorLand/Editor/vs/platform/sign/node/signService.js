import{importAMDNodeModule as t}from"../../../amdX.js";import{AbstractSignService as i}from"../common/abstractSignService.js";class v extends i{getValidator(){return this.vsda().then(r=>new r.validator)}signValue(r){return this.vsda().then(e=>new e.signer().sign(r))}async vsda(){const r="vsda",{default:e}=await import(r);return e}}export{v as SignService};
