import*as e from"../../../../nls.js";import{ExtensionsRegistry as d}from"../../extensions/common/extensionsRegistry.js";import{getTokenClassificationRegistry as g,typeAndModifierIdPattern as f}from"../../../../platform/theme/common/tokenClassificationRegistry.js";const c=g(),m=d.registerExtensionPoint({extensionPoint:"semanticTokenTypes",jsonSchema:{description:e.localize("contributes.semanticTokenTypes","Contributes semantic token types."),type:"array",items:{type:"object",properties:{id:{type:"string",description:e.localize("contributes.semanticTokenTypes.id","The identifier of the semantic token type"),pattern:f,patternErrorMessage:e.localize("contributes.semanticTokenTypes.id.format","Identifiers should be in the form letterOrDigit[_-letterOrDigit]*")},superType:{type:"string",description:e.localize("contributes.semanticTokenTypes.superType","The super type of the semantic token type"),pattern:f,patternErrorMessage:e.localize("contributes.semanticTokenTypes.superType.format","Super types should be in the form letterOrDigit[_-letterOrDigit]*")},description:{type:"string",description:e.localize("contributes.color.description","The description of the semantic token type")}}}}}),y=d.registerExtensionPoint({extensionPoint:"semanticTokenModifiers",jsonSchema:{description:e.localize("contributes.semanticTokenModifiers","Contributes semantic token modifiers."),type:"array",items:{type:"object",properties:{id:{type:"string",description:e.localize("contributes.semanticTokenModifiers.id","The identifier of the semantic token modifier"),pattern:f,patternErrorMessage:e.localize("contributes.semanticTokenModifiers.id.format","Identifiers should be in the form letterOrDigit[_-letterOrDigit]*")},description:{description:e.localize("contributes.semanticTokenModifiers.description","The description of the semantic token modifier")}}}}}),k=d.registerExtensionPoint({extensionPoint:"semanticTokenScopes",jsonSchema:{description:e.localize("contributes.semanticTokenScopes","Contributes semantic token scope maps."),type:"array",items:{type:"object",properties:{language:{description:e.localize("contributes.semanticTokenScopes.languages","Lists the languge for which the defaults are."),type:"string"},scopes:{description:e.localize("contributes.semanticTokenScopes.scopes","Maps a semantic token (described by semantic token selector) to one or more textMate scopes used to represent that token."),type:"object",additionalProperties:{type:"array",items:{type:"string"}}}}}}});class P{constructor(){function u(r,s,o){if(typeof r.id!="string"||r.id.length===0)return o.error(e.localize("invalid.id","'configuration.{0}.id' must be defined and can not be empty",s)),!1;if(!r.id.match(f))return o.error(e.localize("invalid.id.format","'configuration.{0}.id' must follow the pattern letterOrDigit[-_letterOrDigit]*",s)),!1;const t=r.superType;return t&&!t.match(f)?(o.error(e.localize("invalid.superType.format","'configuration.{0}.superType' must follow the pattern letterOrDigit[-_letterOrDigit]*",s)),!1):typeof r.description!="string"||r.id.length===0?(o.error(e.localize("invalid.description","'configuration.{0}.description' must be defined and can not be empty",s)),!1):!0}m.setHandler((r,s)=>{for(const o of s.added){const t=o.value,i=o.collector;if(!t||!Array.isArray(t)){i.error(e.localize("invalid.semanticTokenTypeConfiguration","'configuration.semanticTokenType' must be an array"));return}for(const n of t)u(n,"semanticTokenType",i)&&c.registerTokenType(n.id,n.description,n.superType)}for(const o of s.removed){const t=o.value;for(const i of t)c.deregisterTokenType(i.id)}}),y.setHandler((r,s)=>{for(const o of s.added){const t=o.value,i=o.collector;if(!t||!Array.isArray(t)){i.error(e.localize("invalid.semanticTokenModifierConfiguration","'configuration.semanticTokenModifier' must be an array"));return}for(const n of t)u(n,"semanticTokenModifier",i)&&c.registerTokenModifier(n.id,n.description)}for(const o of s.removed){const t=o.value;for(const i of t)c.deregisterTokenModifier(i.id)}}),k.setHandler((r,s)=>{for(const o of s.added){const t=o.value,i=o.collector;if(!t||!Array.isArray(t)){i.error(e.localize("invalid.semanticTokenScopes.configuration","'configuration.semanticTokenScopes' must be an array"));return}for(const n of t){if(n.language&&typeof n.language!="string"){i.error(e.localize("invalid.semanticTokenScopes.language","'configuration.semanticTokenScopes.language' must be a string"));continue}if(!n.scopes||typeof n.scopes!="object"){i.error(e.localize("invalid.semanticTokenScopes.scopes","'configuration.semanticTokenScopes.scopes' must be defined as an object"));continue}for(const p in n.scopes){const a=n.scopes[p];if(!Array.isArray(a)||a.some(l=>typeof l!="string")){i.error(e.localize("invalid.semanticTokenScopes.scopes.value","'configuration.semanticTokenScopes.scopes' values must be an array of strings"));continue}try{const l=c.parseTokenSelector(p,n.language);c.registerTokenStyleDefault(l,{scopesToProbe:a.map(T=>T.split(" "))})}catch{i.error(e.localize("invalid.semanticTokenScopes.scopes.selector","configuration.semanticTokenScopes.scopes': Problems parsing selector {0}.",p))}}}}for(const o of s.removed){const t=o.value;for(const i of t)for(const n in i.scopes){const p=i.scopes[n];try{const a=c.parseTokenSelector(n,i.language);c.registerTokenStyleDefault(a,{scopesToProbe:p.map(l=>l.split(" "))})}catch{}}}})}}export{P as TokenClassificationExtensionPoints};
