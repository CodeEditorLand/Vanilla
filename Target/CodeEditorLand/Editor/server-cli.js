import"./bootstrap-server.js";import*as o from"path";import{fileURLToPath as t}from"url";import*as s from"./bootstrap-amd.js";import{product as _}from"./bootstrap-meta.js";import*as a from"./bootstrap-node.js";import{resolveNLSConfiguration as n}from"./vs/base/node/nls.js";const e=o.dirname(t(import.meta.url));async function i(){const r=await n({userLocale:"en",osLocale:"en",commit:_.commit,userDataPath:"",nlsMetadataPath:e});process.env.VSCODE_NLS_CONFIG=JSON.stringify(r),process.env.VSCODE_DEV?(process.env.VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH=process.env.VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH||o.join(e,"..","remote","node_modules"),a.devInjectNodeModuleLookupPath(process.env.VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH)):delete process.env.VSCODE_DEV_INJECT_NODE_MODULE_LOOKUP_PATH,s.load("vs/server/node/server.cli")}i();
