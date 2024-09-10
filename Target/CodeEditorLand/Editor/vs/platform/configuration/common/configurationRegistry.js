import{distinct as N}from"../../../base/common/arrays.js";import"../../../base/common/collections.js";import{Emitter as P}from"../../../base/common/event.js";import"../../../base/common/jsonSchema.js";import*as d from"../../../base/common/types.js";import*as c from"../../../nls.js";import{getLanguageTagSettingPlainKey as x}from"./configuration.js";import{Extensions as V}from"../../jsonschemas/common/jsonContributionRegistry.js";import"../../policy/common/policy.js";import{Registry as E}from"../../registry/common/platform.js";var A=(i=>(i.Multiline="multilineText",i.Singleline="singlelineText",i))(A||{});const L={Configuration:"base.contributions.configuration"};var _=(r=>(r[r.APPLICATION=1]="APPLICATION",r[r.MACHINE=2]="MACHINE",r[r.WINDOW=3]="WINDOW",r[r.RESOURCE=4]="RESOURCE",r[r.LANGUAGE_OVERRIDABLE=5]="LANGUAGE_OVERRIDABLE",r[r.MACHINE_OVERRIDABLE=6]="MACHINE_OVERRIDABLE",r))(_||{});const D={properties:{},patternProperties:{}},v={properties:{},patternProperties:{}},S={properties:{},patternProperties:{}},m={properties:{},patternProperties:{}},y={properties:{},patternProperties:{}},C={properties:{},patternProperties:{}},p="vscode://schemas/settings/resourceLanguage",Q="vscode://schemas/settings/configurationDefaults",O=E.as(V.JSONContribution);class w{registeredConfigurationDefaults=[];configurationDefaultsOverrides;defaultLanguageConfigurationOverridesNode;configurationContributors;configurationProperties;policyConfigurations;excludedConfigurationProperties;resourceLanguageSettingsSchema;overrideIdentifiers=new Set;_onDidSchemaChange=new P;onDidSchemaChange=this._onDidSchemaChange.event;_onDidUpdateConfiguration=new P;onDidUpdateConfiguration=this._onDidUpdateConfiguration.event;constructor(){this.configurationDefaultsOverrides=new Map,this.defaultLanguageConfigurationOverridesNode={id:"defaultOverrides",title:c.localize("defaultLanguageConfigurationOverrides.title","Default Language Configuration Overrides"),properties:{}},this.configurationContributors=[this.defaultLanguageConfigurationOverridesNode],this.resourceLanguageSettingsSchema={properties:{},patternProperties:{},additionalProperties:!0,allowTrailingCommas:!0,allowComments:!0},this.configurationProperties={},this.policyConfigurations=new Map,this.excludedConfigurationProperties={},O.registerSchema(p,this.resourceLanguageSettingsSchema),this.registerOverridePropertyPatternKey()}registerConfiguration(e,i=!0){this.registerConfigurations([e],i)}registerConfigurations(e,i=!0){const t=new Set;this.doRegisterConfigurations(e,i,t),O.registerSchema(p,this.resourceLanguageSettingsSchema),this._onDidSchemaChange.fire(),this._onDidUpdateConfiguration.fire({properties:t})}deregisterConfigurations(e){const i=new Set;this.doDeregisterConfigurations(e,i),O.registerSchema(p,this.resourceLanguageSettingsSchema),this._onDidSchemaChange.fire(),this._onDidUpdateConfiguration.fire({properties:i})}updateConfigurations({add:e,remove:i}){const t=new Set;this.doDeregisterConfigurations(i,t),this.doRegisterConfigurations(e,!1,t),O.registerSchema(p,this.resourceLanguageSettingsSchema),this._onDidSchemaChange.fire(),this._onDidUpdateConfiguration.fire({properties:t})}registerDefaultConfigurations(e){const i=new Set;this.doRegisterDefaultConfigurations(e,i),this._onDidSchemaChange.fire(),this._onDidUpdateConfiguration.fire({properties:i,defaultsOverrides:!0})}doRegisterDefaultConfigurations(e,i){this.registeredConfigurationDefaults.push(...e);const t=[];for(const{overrides:n,source:o}of e)for(const r in n){i.add(r);const s=this.configurationDefaultsOverrides.get(r)??this.configurationDefaultsOverrides.set(r,{configurationDefaultOverrides:[]}).get(r),f=n[r];if(s.configurationDefaultOverrides.push({value:f,source:o}),h.test(r)){const a=this.mergeDefaultConfigurationsForOverrideIdentifier(r,f,o,s.configurationDefaultOverrideValue);if(!a)continue;s.configurationDefaultOverrideValue=a,this.updateDefaultOverrideProperty(r,a,o),t.push(...M(r))}else{const a=this.mergeDefaultConfigurationsForConfigurationProperty(r,f,o,s.configurationDefaultOverrideValue);if(!a)continue;s.configurationDefaultOverrideValue=a;const g=this.configurationProperties[r];g&&(this.updatePropertyDefaultValue(r,g),this.updateSchema(r,g))}}this.doRegisterOverrideIdentifiers(t)}deregisterDefaultConfigurations(e){const i=new Set;this.doDeregisterDefaultConfigurations(e,i),this._onDidSchemaChange.fire(),this._onDidUpdateConfiguration.fire({properties:i,defaultsOverrides:!0})}doDeregisterDefaultConfigurations(e,i){for(const t of e){const n=this.registeredConfigurationDefaults.indexOf(t);n!==-1&&this.registeredConfigurationDefaults.splice(n,1)}for(const{overrides:t,source:n}of e)for(const o in t){const r=this.configurationDefaultsOverrides.get(o);if(!r)continue;const s=r.configurationDefaultOverrides.findIndex(f=>n?f.source?.id===n.id:f.value===t[o]);if(s!==-1){if(r.configurationDefaultOverrides.splice(s,1),r.configurationDefaultOverrides.length===0&&this.configurationDefaultsOverrides.delete(o),h.test(o)){let f;for(const a of r.configurationDefaultOverrides)f=this.mergeDefaultConfigurationsForOverrideIdentifier(o,a.value,a.source,f);f&&!d.isEmptyObject(f.value)?(r.configurationDefaultOverrideValue=f,this.updateDefaultOverrideProperty(o,f,n)):(this.configurationDefaultsOverrides.delete(o),delete this.configurationProperties[o],delete this.defaultLanguageConfigurationOverridesNode.properties[o])}else{let f;for(const g of r.configurationDefaultOverrides)f=this.mergeDefaultConfigurationsForConfigurationProperty(o,g.value,g.source,f);r.configurationDefaultOverrideValue=f;const a=this.configurationProperties[o];a&&(this.updatePropertyDefaultValue(o,a),this.updateSchema(o,a))}i.add(o)}}this.updateOverridePropertyPatternKey()}updateDefaultOverrideProperty(e,i,t){const n={type:"object",default:i.value,description:c.localize("defaultLanguageConfiguration.description","Configure settings to be overridden for the {0} language.",x(e)),$ref:p,defaultDefaultValue:i.value,source:t,defaultValueSource:t};this.configurationProperties[e]=n,this.defaultLanguageConfigurationOverridesNode.properties[e]=n}mergeDefaultConfigurationsForOverrideIdentifier(e,i,t,n){const o=n?.value||{},r=n?.source??new Map;if(!(r instanceof Map)){console.error("objectConfigurationSources is not a Map");return}for(const s of Object.keys(i)){const f=i[s];if(d.isObject(f)&&(d.isUndefined(o[s])||d.isObject(o[s]))){if(o[s]={...o[s]??{},...f},t)for(const g in f)r.set(`${s}.${g}`,t)}else o[s]=f,t?r.set(s,t):r.delete(s)}return{value:o,source:r}}mergeDefaultConfigurationsForConfigurationProperty(e,i,t,n){const o=this.configurationProperties[e],r=n?.value??o?.defaultDefaultValue;let s=t;if(d.isObject(i)&&(o!==void 0&&o.type==="object"||o===void 0&&(d.isUndefined(r)||d.isObject(r)))){if(s=n?.source??new Map,!(s instanceof Map)){console.error("defaultValueSource is not a Map");return}for(const a in i)t&&s.set(`${e}.${a}`,t);i={...d.isObject(r)?r:{},...i}}return{value:i,source:s}}deltaConfiguration(e){let i=!1;const t=new Set;e.removedDefaults&&(this.doDeregisterDefaultConfigurations(e.removedDefaults,t),i=!0),e.addedDefaults&&(this.doRegisterDefaultConfigurations(e.addedDefaults,t),i=!0),e.removedConfigurations&&this.doDeregisterConfigurations(e.removedConfigurations,t),e.addedConfigurations&&this.doRegisterConfigurations(e.addedConfigurations,!1,t),this._onDidSchemaChange.fire(),this._onDidUpdateConfiguration.fire({properties:t,defaultsOverrides:i})}notifyConfigurationSchemaUpdated(...e){this._onDidSchemaChange.fire()}registerOverrideIdentifiers(e){this.doRegisterOverrideIdentifiers(e),this._onDidSchemaChange.fire()}doRegisterOverrideIdentifiers(e){for(const i of e)this.overrideIdentifiers.add(i);this.updateOverridePropertyPatternKey()}doRegisterConfigurations(e,i,t){e.forEach(n=>{this.validateAndRegisterProperties(n,i,n.extensionInfo,n.restrictedProperties,void 0,t),this.configurationContributors.push(n),this.registerJSONConfiguration(n)})}doDeregisterConfigurations(e,i){const t=n=>{if(n.properties)for(const o in n.properties){i.add(o);const r=this.configurationProperties[o];r?.policy?.name&&this.policyConfigurations.delete(r.policy.name),delete this.configurationProperties[o],this.removeFromSchema(o,n.properties[o])}n.allOf?.forEach(o=>t(o))};for(const n of e){t(n);const o=this.configurationContributors.indexOf(n);o!==-1&&this.configurationContributors.splice(o,1)}}validateAndRegisterProperties(e,i=!0,t,n,o=3,r){o=d.isUndefinedOrNull(e.scope)?o:e.scope;const s=e.properties;if(s)for(const a in s){const g=s[a];if(i&&j(a,g)){delete s[a];continue}if(g.source=t,g.defaultDefaultValue=s[a].default,this.updatePropertyDefaultValue(a,g),h.test(a)?g.scope=void 0:(g.scope=d.isUndefinedOrNull(g.scope)?o:g.scope,g.restricted=d.isUndefinedOrNull(g.restricted)?!!n?.includes(a):g.restricted),s[a].hasOwnProperty("included")&&!s[a].included){this.excludedConfigurationProperties[a]=s[a],delete s[a];continue}else this.configurationProperties[a]=s[a],s[a].policy?.name&&this.policyConfigurations.set(s[a].policy.name,a);!s[a].deprecationMessage&&s[a].markdownDeprecationMessage&&(s[a].deprecationMessage=s[a].markdownDeprecationMessage),r.add(a)}const f=e.allOf;if(f)for(const a of f)this.validateAndRegisterProperties(a,i,t,n,o,r)}getConfigurations(){return this.configurationContributors}getConfigurationProperties(){return this.configurationProperties}getPolicyConfigurations(){return this.policyConfigurations}getExcludedConfigurationProperties(){return this.excludedConfigurationProperties}getRegisteredDefaultConfigurations(){return[...this.registeredConfigurationDefaults]}getConfigurationDefaultsOverrides(){const e=new Map;for(const[i,t]of this.configurationDefaultsOverrides)t.configurationDefaultOverrideValue&&e.set(i,t.configurationDefaultOverrideValue);return e}registerJSONConfiguration(e){const i=t=>{const n=t.properties;if(n)for(const r in n)this.updateSchema(r,n[r]);t.allOf?.forEach(i)};i(e)}updateSchema(e,i){switch(D.properties[e]=i,i.scope){case 1:v.properties[e]=i;break;case 2:S.properties[e]=i;break;case 6:m.properties[e]=i;break;case 3:y.properties[e]=i;break;case 4:C.properties[e]=i;break;case 5:C.properties[e]=i,this.resourceLanguageSettingsSchema.properties[e]=i;break}}removeFromSchema(e,i){switch(delete D.properties[e],i.scope){case 1:delete v.properties[e];break;case 2:delete S.properties[e];break;case 6:delete m.properties[e];break;case 3:delete y.properties[e];break;case 4:case 5:delete C.properties[e],delete this.resourceLanguageSettingsSchema.properties[e];break}}updateOverridePropertyPatternKey(){for(const e of this.overrideIdentifiers.values()){const i=`[${e}]`,t={type:"object",description:c.localize("overrideSettings.defaultDescription","Configure editor settings to be overridden for a language."),errorMessage:c.localize("overrideSettings.errorMessage","This setting does not support per-language configuration."),$ref:p};this.updatePropertyDefaultValue(i,t),D.properties[i]=t,v.properties[i]=t,S.properties[i]=t,m.properties[i]=t,y.properties[i]=t,C.properties[i]=t}}registerOverridePropertyPatternKey(){const e={type:"object",description:c.localize("overrideSettings.defaultDescription","Configure editor settings to be overridden for a language."),errorMessage:c.localize("overrideSettings.errorMessage","This setting does not support per-language configuration."),$ref:p};D.patternProperties[l]=e,v.patternProperties[l]=e,S.patternProperties[l]=e,m.patternProperties[l]=e,y.patternProperties[l]=e,C.patternProperties[l]=e,this._onDidSchemaChange.fire()}updatePropertyDefaultValue(e,i){const t=this.configurationDefaultsOverrides.get(e)?.configurationDefaultOverrideValue;let n,o;t&&(!i.disallowConfigurationDefault||!t.source)&&(n=t.value,o=t.source),d.isUndefined(n)&&(n=i.defaultDefaultValue,o=void 0),d.isUndefined(n)&&(n=U(i.type)),i.default=n,i.defaultValueSource=o}}const R="\\[([^\\]]+)\\]",b=new RegExp(R,"g"),l=`^(${R})+$`,h=new RegExp(l);function M(u){const e=[];if(h.test(u)){let i=b.exec(u);for(;i?.length;){const t=i[1].trim();t&&e.push(t),i=b.exec(u)}}return N(e)}function Z(u){return u.reduce((e,i)=>`${e}[${i}]`,"")}function U(u){switch(Array.isArray(u)?u[0]:u){case"boolean":return!1;case"integer":case"number":return 0;case"string":return"";case"array":return[];case"object":return{};default:return null}}const I=new w;E.add(L.Configuration,I);function j(u,e){return u.trim()?h.test(u)?c.localize("config.property.languageDefault","Cannot register '{0}'. This matches property pattern '\\\\[.*\\\\]$' for describing language specific editor settings. Use 'configurationDefaults' contribution.",u):I.getConfigurationProperties()[u]!==void 0?c.localize("config.property.duplicate","Cannot register '{0}'. This property is already registered.",u):e.policy?.name&&I.getPolicyConfigurations().get(e.policy?.name)!==void 0?c.localize("config.policy.duplicate","Cannot register '{0}'. The associated policy {1} is already registered with {2}.",u,e.policy?.name,I.getPolicyConfigurations().get(e.policy?.name)):null:c.localize("config.property.empty","Cannot register an empty property")}function ee(){const u=[],e=I.getConfigurationProperties();for(const i of Object.keys(e))u.push([i,e[i].scope]);return u.push(["launch",4]),u.push(["task",4]),u}function T(u){const e={};for(const i of u){const t=i.properties;if(d.isObject(t))for(const n in t)e[n]=t[n];i.allOf&&Object.assign(e,T(i.allOf))}return e}function ie(u){switch(u){case"application":return 1;case"machine":return 2;case"resource":return 4;case"machine-overridable":return 6;case"language-overridable":return 5;default:return 3}}export{_ as ConfigurationScope,A as EditPresentationTypes,L as Extensions,l as OVERRIDE_PROPERTY_PATTERN,h as OVERRIDE_PROPERTY_REGEX,D as allSettings,v as applicationSettings,Q as configurationDefaultsSchemaId,T as getAllConfigurationProperties,U as getDefaultValue,ee as getScopes,Z as keyFromOverrideIdentifiers,m as machineOverridableSettings,S as machineSettings,M as overrideIdentifiersFromKey,ie as parseScope,p as resourceLanguageSettingsSchemaId,C as resourceSettings,j as validateProperty,y as windowSettings};
