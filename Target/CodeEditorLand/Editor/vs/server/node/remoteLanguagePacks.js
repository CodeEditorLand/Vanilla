import{FileAccess as c}from"../../base/common/network.js";import{join as t}from"../../base/common/path.js";import{resolveNLSConfiguration as l}from"../../base/node/nls.js";import{Promises as f}from"../../base/node/pfs.js";import n from"../../platform/product/common/product.js";const r=t(c.asFileUri("").fsPath),a=t(r,"nls.messages.json"),m=new Map;async function N(e,i){if(!n.commit||!await f.exists(a))return{userLocale:"en",osLocale:"en",resolvedLanguage:"en",defaultMessagesFile:a,locale:"en",availableLanguages:{}};const s=`${e}||${i}`;let o=m.get(s);return o||(o=l({userLocale:e,osLocale:e,commit:n.commit,userDataPath:i,nlsMetadataPath:r}),m.set(s,o)),o}export{N as getNLSConfiguration};
