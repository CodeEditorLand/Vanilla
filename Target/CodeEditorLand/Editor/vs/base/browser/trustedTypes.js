import{onUnexpectedError as r}from"../../../vs/base/common/errors.js";function s(n,t){const o=globalThis.MonacoEnvironment;if(o?.createTrustedTypesPolicy)try{return o.createTrustedTypesPolicy(n,t)}catch(e){r(e);return}try{return globalThis.trustedTypes?.createPolicy(n,t)}catch(e){r(e);return}}export{s as createTrustedTypesPolicy};