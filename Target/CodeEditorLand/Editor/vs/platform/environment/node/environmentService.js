import{homedir as s,tmpdir as i}from"os";import"../../../../vs/platform/environment/common/argv.js";import"../../../../vs/platform/environment/common/environment.js";import{AbstractNativeEnvironmentService as n,parseDebugParams as o}from"../../../../vs/platform/environment/common/environmentService.js";import{getUserDataPath as a}from"vs/platform/environment/node/userDataPath";import"../../../../vs/platform/product/common/productService.js";class h extends n{constructor(r,t){super(r,{homeDir:s(),tmpDir:i(),userDataDir:a(r,t.nameShort)},t)}}function f(e,r){return o(e["inspect-ptyhost"],e["inspect-brk-ptyhost"],5877,r,e.extensionEnvironment)}function g(e,r){return o(e["inspect-sharedprocess"],e["inspect-brk-sharedprocess"],5879,r,e.extensionEnvironment)}export{h as NativeEnvironmentService,f as parsePtyHostDebugPort,g as parseSharedProcessDebugPort};