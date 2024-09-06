import{isEqualOrParent as x,joinPath as B}from"../../../base/common/resources.js";import*as j from"../../../base/common/semver/semver.js";import u from"../../../base/common/severity.js";import"../../../base/common/uri.js";import*as a from"../../../nls.js";import{parseApiProposals as z}from"./extensions.js";import{allApiProposals as D}from"./extensionsApiProposals.js";const v=/^(\^|>=)?((\d+)|x)\.((\d+)|x)\.((\d+)|x)(\-.*)?$/,I=/^-(\d{4})(\d{2})(\d{2})$/;function V(e){return e=e.trim(),e==="*"||v.test(e)}function E(e){if(!V(e))return null;if(e=e.trim(),e==="*")return{hasCaret:!1,hasGreaterEquals:!1,majorBase:0,majorMustEqual:!1,minorBase:0,minorMustEqual:!1,patchBase:0,patchMustEqual:!1,preRelease:null};const t=e.match(v);return t?{hasCaret:t[1]==="^",hasGreaterEquals:t[1]===">=",majorBase:t[2]==="x"?0:parseInt(t[2],10),majorMustEqual:t[2]!=="x",minorBase:t[4]==="x"?0:parseInt(t[4],10),minorMustEqual:t[4]!=="x",patchBase:t[6]==="x"?0:parseInt(t[6],10),patchMustEqual:t[6]!=="x",preRelease:t[8]||null}:null}function g(e){if(!e)return null;const t=e.majorBase,n=e.majorMustEqual,r=e.minorBase;let i=e.minorMustEqual;const l=e.patchBase;let o=e.patchMustEqual;e.hasCaret&&(t===0||(i=!1),o=!1);let p=0;if(e.preRelease){const f=I.exec(e.preRelease);if(f){const[,s,c,m]=f;p=Date.UTC(Number(s),Number(c)-1,Number(m))}}return{majorBase:t,majorMustEqual:n,minorBase:r,minorMustEqual:i,patchBase:l,patchMustEqual:o,isMinimum:e.hasGreaterEquals,notBefore:p}}function N(e,t,n){let r;typeof e=="string"?r=g(E(e)):r=e;let i;t instanceof Date?i=t.getTime():typeof t=="string"&&(i=new Date(t).getTime());let l;if(typeof n=="string"?l=g(E(n)):l=n,!r||!l)return!1;const o=r.majorBase,p=r.minorBase,f=r.patchBase;let s=l.majorBase,c=l.minorBase,m=l.patchBase;const y=l.notBefore;let d=l.majorMustEqual,h=l.minorMustEqual,b=l.patchMustEqual;return l.isMinimum?o>s?!0:o<s?!1:p>c?!0:p<c||i&&i<y?!1:f>=m:(o===1&&s===0&&(!d||!h||!b)&&(s=1,c=0,m=0,d=!0,h=!1,b=!1),o<s?!1:o>s?!d:p<c?!1:p>c?!h:f<m?!1:f>m?!b:!(i&&i<y))}function F(e,t,n,r,i,l){const o=[];if(typeof r.publisher<"u"&&typeof r.publisher!="string")return o.push([u.Error,a.localize("extensionDescription.publisher","property publisher must be of type `string`.")]),o;if(typeof r.name!="string")return o.push([u.Error,a.localize("extensionDescription.name","property `{0}` is mandatory and must be of type `string`","name")]),o;if(typeof r.version!="string")return o.push([u.Error,a.localize("extensionDescription.version","property `{0}` is mandatory and must be of type `string`","version")]),o;if(!r.engines)return o.push([u.Error,a.localize("extensionDescription.engines","property `{0}` is mandatory and must be of type `object`","engines")]),o;if(typeof r.engines.vscode!="string")return o.push([u.Error,a.localize("extensionDescription.engines.vscode","property `{0}` is mandatory and must be of type `string`","engines.vscode")]),o;if(typeof r.extensionDependencies<"u"&&!P(r.extensionDependencies))return o.push([u.Error,a.localize("extensionDescription.extensionDependencies","property `{0}` can be omitted or must be of type `string[]`","extensionDependencies")]),o;if(typeof r.activationEvents<"u"){if(!P(r.activationEvents))return o.push([u.Error,a.localize("extensionDescription.activationEvents1","property `{0}` can be omitted or must be of type `string[]`","activationEvents")]),o;if(typeof r.main>"u"&&typeof r.browser>"u")return o.push([u.Error,a.localize("extensionDescription.activationEvents2","property `{0}` should be omitted if the extension doesn't have a `{1}` or `{2}` property.","activationEvents","main","browser")]),o}if(typeof r.extensionKind<"u"&&typeof r.main>"u"&&o.push([u.Warning,a.localize("extensionDescription.extensionKind","property `{0}` can be defined only if property `main` is also defined.","extensionKind")]),typeof r.main<"u"){if(typeof r.main!="string")return o.push([u.Error,a.localize("extensionDescription.main1","property `{0}` can be omitted or must be of type `string`","main")]),o;{const s=B(n,r.main);x(s,n)||o.push([u.Warning,a.localize("extensionDescription.main2","Expected `main` ({0}) to be included inside extension's folder ({1}). This might make the extension non-portable.",s.path,n.path)])}}if(typeof r.browser<"u"){if(typeof r.browser!="string")return o.push([u.Error,a.localize("extensionDescription.browser1","property `{0}` can be omitted or must be of type `string`","browser")]),o;{const s=B(n,r.browser);x(s,n)||o.push([u.Warning,a.localize("extensionDescription.browser2","Expected `browser` ({0}) to be included inside extension's folder ({1}). This might make the extension non-portable.",s.path,n.path)])}}if(!j.valid(r.version))return o.push([u.Error,a.localize("notSemver","Extension version is not semver compatible.")]),o;const p=[];if(!A(e,t,r,i,p))for(const s of p)o.push([u.Error,s]);if(l&&r.enabledApiProposals?.length){const s=[];if(!M([...r.enabledApiProposals],s))for(const c of s)o.push([u.Error,c])}return o}function A(e,t,n,r,i){return r||typeof n.main>"u"&&typeof n.browser>"u"?!0:q(e,t,n.engines.vscode,i)}function K(e,t,n){return e==="*"||q(t,n,e)}function M(e,t){if(e.length===0)return!0;const n=Array.isArray(t)?t:void 0,r=(n?void 0:t)??D,i=[],l=z(e);for(const{proposalName:o,version:p}of l){const f=r[o];f&&p&&f.version!==p&&i.push(a.localize("apiProposalMismatch","Extension is using an API proposal '{0}' that is not compatible with the current version of VS Code.",o))}return n?.push(...i),i.length===0}function q(e,t,n,r=[]){const i=g(E(n));if(!i)return r.push(a.localize("versionSyntax","Could not parse `engines.vscode` value {0}. Please use, for example: ^1.22.0, ^1.22.x, etc.",n)),!1;if(i.majorBase===0){if(!i.majorMustEqual||!i.minorMustEqual)return r.push(a.localize("versionSpecificity1","Version specified in `engines.vscode` ({0}) is not specific enough. For vscode versions before 1.0.0, please define at a minimum the major and minor desired version. E.g. ^0.10.0, 0.10.x, 0.11.0, etc.",n)),!1}else if(!i.majorMustEqual)return r.push(a.localize("versionSpecificity2","Version specified in `engines.vscode` ({0}) is not specific enough. For vscode versions after 1.0.0, please define at a minimum the major desired version. E.g. ^1.10.0, 1.10.x, 1.x.x, 2.x.x, etc.",n)),!1;return N(e,t,i)?!0:(r.push(a.localize("versionMismatch","Extension is not compatible with Code {0}. Extension requires: {1}.",e,n)),!1)}function P(e){if(!Array.isArray(e))return!1;for(let t=0,n=e.length;t<n;t++)if(typeof e[t]!="string")return!1;return!0}export{M as areApiProposalsCompatible,K as isEngineValid,A as isValidExtensionVersion,N as isValidVersion,V as isValidVersionStr,g as normalizeVersion,E as parseVersion,F as validateExtensionManifest};
