import{workbenchInstantiationService as S,TestInMemoryFileSystemProvider as F,TestBrowserTextFileServiceWithEncodingOverrides as v}from"../../../../test/browser/workbenchTestServices.js";import{NullLogService as w}from"../../../../../platform/log/common/log.js";import{FileService as y}from"../../../../../platform/files/common/fileService.js";import{Schemas as g}from"../../../../../base/common/network.js";import"../../common/textfiles.js";import"../../common/textFileEditorModelManager.js";import{DisposableStore as T}from"../../../../../base/common/lifecycle.js";import{ServiceCollection as I}from"../../../../../platform/instantiation/common/serviceCollection.js";import{IFileService as P}from"../../../../../platform/files/common/files.js";import{URI as n}from"../../../../../base/common/uri.js";import{join as b}from"../../../../../base/common/path.js";import{detectEncodingByBOMFromBuffer as h,toCanonicalName as B}from"../../common/encoding.js";import{VSBuffer as x}from"../../../../../base/common/buffer.js";import m from"../common/fixtures/files.js";import M from"../common/textFileService.io.test.js";import{isWeb as U}from"../../../../../base/common/platform.js";import{IWorkingCopyFileService as k,WorkingCopyFileService as C}from"../../../workingCopy/common/workingCopyFileService.js";import{WorkingCopyService as E}from"../../../workingCopy/common/workingCopyService.js";import{UriIdentityService as W}from"../../../../../platform/uriIdentity/common/uriIdentityService.js";import{ensureNoDisposablesAreLeakedInTestSuite as D}from"../../../../../base/test/common/utils.js";U&&suite("Files - BrowserTextFileService i/o",function(){const e=new T;let s,t;const a="test";M({setup:async()=>{const r=S(void 0,e),i=new w,o=e.add(new y(i));t=e.add(new F),e.add(o.registerProvider(g.file,t));const c=new I;c.set(P,o),c.set(k,e.add(new C(o,e.add(new E),r,e.add(new W(o))))),s=e.add(r.createChild(c).createInstance(v)),e.add(s.files),await t.mkdir(n.file(a));for(const l in m)await t.writeFile(n.file(b(a,l)),m[l],{create:!0,overwrite:!1,unlock:!1,atomic:!1});return{service:s,testDir:a}},teardown:async()=>{e.clear()},exists:d,stat:u,readFile:f,detectEncodingByBOM:p});async function d(r){try{return await t.readFile(n.file(r)),!0}catch{return!1}}async function f(r,i){const o=await t.readFile(n.file(r));return i?new TextDecoder(B(i)).decode(o):x.wrap(o)}async function u(r){return t.stat(n.file(r))}async function p(r){try{const i=await f(r);return h(i.slice(0,3),3)}catch{return null}}D()});