import{hash as i}from"../../../../base/common/hash.js";import"../../../../base/common/uri.js";import"../../../../platform/workspace/common/workspace.js";function p(e){return{id:r(e),configPath:e}}function c(e){return{id:r(e),uri:e}}function r(e){return i(e.toString()).toString(16)}export{c as getSingleFolderWorkspaceIdentifier,p as getWorkspaceIdentifier};
