import{createDecorator as r}from"../../../../platform/instantiation/common/instantiation.js";import{Registry as a}from"../../../../platform/registry/common/platform.js";var n;(e=>e.ExtensionFeaturesRegistry="workbench.registry.extensionFeatures")(n||={});const S=r("IExtensionFeaturesManagementService");class i{extensionFeatures=new Map;registerExtensionFeature(e){if(this.extensionFeatures.has(e.id))throw new Error(`Extension feature with id '${e.id}' already exists`);return this.extensionFeatures.set(e.id,e),{dispose:()=>this.extensionFeatures.delete(e.id)}}getExtensionFeature(e){return this.extensionFeatures.get(e)}getExtensionFeatures(){return Array.from(this.extensionFeatures.values())}}a.add(n.ExtensionFeaturesRegistry,new i);export{n as Extensions,S as IExtensionFeaturesManagementService};
