import"../../../browser/notebookBrowser.js";import{mock as c}from"../../../../../../base/test/common/mock.js";import"../../../../../../platform/clipboard/common/clipboardService.js";import"../../../../../../platform/log/common/log.js";import r from"assert";import{VSBuffer as n}from"../../../../../../base/common/buffer.js";import"../../../common/notebookCommon.js";import{copyCellOutput as l}from"../../../browser/contrib/clipboard/cellOutputClipboard.js";import{ensureNoDisposablesAreLeakedInTestSuite as u}from"../../../../../../base/test/common/utils.js";suite("Cell Output Clipboard Tests",()=>{u();class s{_clipboardContent="";get clipboardContent(){return this._clipboardContent}async writeText(t){this._clipboardContent=t}}const a=new class extends c(){};function i(e,t){const o={model:{outputs:e}};return t?(t.outputsViewModels.push(o),t.model.outputs.push(o.model)):t={outputsViewModels:[o],model:{outputs:[o.model]}},o.cellViewModel=t,o}test("Copy text/plain output",async()=>{const e="text/plain",t=new s,o={data:n.fromString("output content"),mime:"text/plain"},p=i([o]);await l(e,p,t,a),r.strictEqual(t.clipboardContent,"output content")}),test("Nothing copied for invalid mimetype",async()=>{const e=new s,t=[{data:n.fromString("output content"),mime:"bad"},{data:n.fromString("output 2"),mime:"unknown"}],o=i(t);await l("bad",o,e,a),r.strictEqual(e.clipboardContent,"")}),test("Text copied if available instead of invalid mime type",async()=>{const e=new s,t=[{data:n.fromString("output content"),mime:"bad"},{data:n.fromString("text content"),mime:"text/plain"}],o=i(t);await l("bad",o,e,a),r.strictEqual(e.clipboardContent,"text content")}),test("Selected mimetype is preferred",async()=>{const e=new s,t=[{data:n.fromString("plain text"),mime:"text/plain"},{data:n.fromString("html content"),mime:"text/html"}],o=i(t);await l("text/html",o,e,a),r.strictEqual(e.clipboardContent,"html content")}),test("copy subsequent output",async()=>{const e=new s,t=i([{data:n.fromString("first"),mime:"text/plain"}]),o=i([{data:n.fromString("second"),mime:"text/plain"}],t.cellViewModel),p=i([{data:n.fromString("third"),mime:"text/plain"}],t.cellViewModel);await l("text/plain",o,e,a),r.strictEqual(e.clipboardContent,"second"),await l("text/plain",p,e,a),r.strictEqual(e.clipboardContent,"third")}),test("adjacent stream outputs are concanented",async()=>{const e=new s,t=i([{data:n.fromString("stdout"),mime:"application/vnd.code.notebook.stdout"}]);i([{data:n.fromString("stderr"),mime:"application/vnd.code.notebook.stderr"}],t.cellViewModel),i([{data:n.fromString("text content"),mime:"text/plain"}],t.cellViewModel),i([{data:n.fromString("non-adjacent"),mime:"application/vnd.code.notebook.stdout"}],t.cellViewModel),await l("application/vnd.code.notebook.stdout",t,e,a),r.strictEqual(e.clipboardContent,"stdoutstderr")})});