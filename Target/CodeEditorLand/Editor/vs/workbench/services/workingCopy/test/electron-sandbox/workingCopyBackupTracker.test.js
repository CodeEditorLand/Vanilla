var j=Object.defineProperty;var G=Object.getOwnPropertyDescriptor;var X=(S,k,v,m)=>{for(var f=m>1?void 0:m?G(k,v):k,u=S.length-1,p;u>=0;u--)(p=S[u])&&(f=(m?p(k,v,f):p(f))||f);return m&&f&&j(k,v,f),f},d=(S,k)=>(v,m)=>k(v,m,S);import a from"assert";import{isMacintosh as g,isWindows as K}from"../../../../../base/common/platform.js";import{join as z}from"../../../../../base/common/path.js";import{URI as R}from"../../../../../base/common/uri.js";import{hash as J}from"../../../../../base/common/hash.js";import{NativeWorkingCopyBackupTracker as Y}from"../../electron-sandbox/workingCopyBackupTracker.js";import"../../../textfile/common/textFileEditorModelManager.js";import{IEditorService as B}from"../../../editor/common/editorService.js";import"../../../../browser/parts/editor/editorPart.js";import{IEditorGroupsService as U}from"../../../editor/common/editorGroupsService.js";import{EditorService as Z}from"../../../editor/browser/editorService.js";import{IWorkingCopyBackupService as $}from"../../common/workingCopyBackup.js";import{DisposableStore as ee}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as te,toResource as h}from"../../../../../base/test/common/utils.js";import{IFilesConfigurationService as b}from"../../../filesConfiguration/common/filesConfigurationService.js";import{IWorkingCopyService as oe}from"../../common/workingCopyService.js";import{ILogService as ie}from"../../../../../platform/log/common/log.js";import{HotExitConfiguration as i}from"../../../../../platform/files/common/files.js";import{ShutdownReason as o,ILifecycleService as se}from"../../../lifecycle/common/lifecycle.js";import{IFileDialogService as re,ConfirmResult as N,IDialogService as ne}from"../../../../../platform/dialogs/common/dialogs.js";import{IWorkspaceContextService as ae}from"../../../../../platform/workspace/common/workspace.js";import{INativeHostService as ce}from"../../../../../platform/native/common/native.js";import"../../../../../platform/instantiation/common/instantiation.js";import{TestConfigurationService as le}from"../../../../../platform/configuration/test/common/testConfigurationService.js";import{IConfigurationService as ue}from"../../../../../platform/configuration/common/configuration.js";import{createEditorPart as pe,registerTestFileEditor as fe,TestBeforeShutdownEvent as O,TestEnvironmentService as de,TestFilesConfigurationService as we,TestFileService as Q,TestTextResourceConfigurationService as he,workbenchTeardown as Oe}from"../../../../test/browser/workbenchTestServices.js";import{MockContextKeyService as Ee}from"../../../../../platform/keybinding/test/common/mockKeybindingService.js";import"../../../../../platform/contextkey/common/contextkey.js";import{IEnvironmentService as Se}from"../../../../../platform/environment/common/environment.js";import{TestWorkspace as ve,Workspace as F}from"../../../../../platform/workspace/test/common/testWorkspace.js";import{IProgressService as ke}from"../../../../../platform/progress/common/progress.js";import{IWorkingCopyEditorService as me}from"../../common/workingCopyEditorService.js";import{TestContextService as Ie,TestMarkerService as _e,TestWorkingCopy as L}from"../../../../test/common/workbenchTestServices.js";import"../../../../../base/common/cancellation.js";import{WorkingCopyCapabilities as y}from"../../common/workingCopy.js";import{Event as M,Emitter as P}from"../../../../../base/common/event.js";import{generateUuid as Ce}from"../../../../../base/common/uuid.js";import{Schemas as q}from"../../../../../base/common/network.js";import{joinPath as x}from"../../../../../base/common/resources.js";import{VSBuffer as De}from"../../../../../base/common/buffer.js";import{TestServiceAccessor as V,workbenchInstantiationService as H}from"../../../../test/electron-sandbox/workbenchTestServices.js";import{UriIdentityService as ge}from"../../../../../platform/uriIdentity/common/uriIdentityService.js";suite("WorkingCopyBackupTracker (native)",function(){let S=class extends Y{constructor(t,s,n,r,c,w,l,I,_,C,E,D,W,T){super(t,s,n,r,c,w,l,I,_,E,D,W,C,T)}getBackupScheduleDelay(){return 10}waitForReady(){return this.whenReady}get pendingBackupOperationCount(){return this.pendingBackupOperations.size}dispose(){super.dispose();for(const[t,s]of this.pendingBackupOperations)s.cancel(),s.disposable.dispose()}_onDidResume=this._register(new P);onDidResume=this._onDidResume.event;_onDidSuspend=this._register(new P);onDidSuspend=this._onDidSuspend.event;suspendBackupOperations(){const{resume:t}=super.suspendBackupOperations();return this._onDidSuspend.fire(),{resume:()=>{t(),this._onDidResume.fire()}}}};S=X([d(0,$),d(1,b),d(2,oe),d(3,se),d(4,re),d(5,ne),d(6,ae),d(7,ce),d(8,ie),d(9,B),d(10,Se),d(11,ke),d(12,me),d(13,U)],S);let k,v,m,f;const u=new ee;setup(async()=>{k=R.file(z(Ce(),"vsctests","workingcopybackuptracker")).with({scheme:q.inMemory}),v=x(k,"Backups");const e=x(v,"workspaces.json"),t=R.file(K?"c:\\workspace":"/workspace").with({scheme:q.inMemory});return m=x(v,J(t.toString()).toString(16)),f=H(void 0,u).createInstance(V),u.add(f.textFileService.files),u.add(fe()),await f.fileService.createFolder(v),await f.fileService.createFolder(m),f.fileService.writeFile(e,De.fromString(""))}),teardown(()=>{u.clear()});async function p(e=!1){const t=H(void 0,u),s=new le;e?s.setUserConfiguration("files",{autoSave:"afterDelay",autoSaveDelay:1}):s.setUserConfiguration("files",{autoSave:"off",autoSaveDelay:1}),t.stub(ue,s),t.stub(b,u.add(new we(t.createInstance(Ee),s,new Ie(ve),de,u.add(new ge(u.add(new Q))),u.add(new Q),new _e,new he(s))));const n=await pe(t,u);t.stub(U,n);const r=u.add(t.createInstance(Z,void 0));t.stub(B,r),f=t.createInstance(V);const c=t.createInstance(S);return{accessor:f,part:n,tracker:c,instantiationService:t,cleanup:async()=>{await f.workingCopyBackupService.waitForAllBackups(),await Oe(t),n.dispose(),c.dispose()}}}test("Track backups (file, auto save off)",function(){return A(h.call(this,"/path/index.txt"),!1)}),test("Track backups (file, auto save on)",function(){return A(h.call(this,"/path/index.txt"),!0)});async function A(e,t){const{accessor:s,cleanup:n}=await p(t);await s.editorService.openEditor({resource:e,options:{pinned:!0}});const r=s.textFileService.files.get(e);a.ok(r),r.textEditorModel?.setValue("Super Good"),await s.workingCopyBackupService.joinBackupResource(),a.strictEqual(s.workingCopyBackupService.hasBackupSync(r),!0),r.dispose(),await s.workingCopyBackupService.joinDiscardBackup(),a.strictEqual(s.workingCopyBackupService.hasBackupSync(r),!1),await n()}test("onWillShutdown - no veto if no dirty files",async function(){const{accessor:e,cleanup:t}=await p(),s=h.call(this,"/path/index.txt");await e.editorService.openEditor({resource:s,options:{pinned:!0}});const n=new O;e.lifecycleService.fireBeforeShutdown(n);const r=await n.value;a.ok(!r),await t()}),test("onWillShutdown - veto if user cancels (hot.exit: off)",async function(){const{accessor:e,cleanup:t}=await p(),s=h.call(this,"/path/index.txt");await e.editorService.openEditor({resource:s,options:{pinned:!0}});const n=e.textFileService.files.get(s);e.fileDialogService.setConfirmResult(N.CANCEL),e.filesConfigurationService.testOnFilesConfigurationChange({files:{hotExit:"off"}}),await n?.resolve(),n?.textEditorModel?.setValue("foo"),a.strictEqual(e.workingCopyService.dirtyCount,1);const r=new O;e.lifecycleService.fireBeforeShutdown(r);const c=await r.value;a.ok(c),await t()}),test("onWillShutdown - no veto if auto save is on",async function(){const{accessor:e,cleanup:t}=await p(!0),s=h.call(this,"/path/index.txt");await e.editorService.openEditor({resource:s,options:{pinned:!0}});const n=e.textFileService.files.get(s);await n?.resolve(),n?.textEditorModel?.setValue("foo"),a.strictEqual(e.workingCopyService.dirtyCount,1);const r=new O;e.lifecycleService.fireBeforeShutdown(r);const c=await r.value;a.ok(!c),a.strictEqual(e.workingCopyService.dirtyCount,0),await t()}),test("onWillShutdown - no veto and backups cleaned up if user does not want to save (hot.exit: off)",async function(){const{accessor:e,cleanup:t}=await p(),s=h.call(this,"/path/index.txt");await e.editorService.openEditor({resource:s,options:{pinned:!0}});const n=e.textFileService.files.get(s);e.fileDialogService.setConfirmResult(N.DONT_SAVE),e.filesConfigurationService.testOnFilesConfigurationChange({files:{hotExit:"off"}}),await n?.resolve(),n?.textEditorModel?.setValue("foo"),a.strictEqual(e.workingCopyService.dirtyCount,1);const r=new O;e.lifecycleService.fireBeforeShutdown(r);const c=await r.value;a.ok(!c),a.ok(e.workingCopyBackupService.discardedBackups.length>0),await t()}),test("onWillShutdown - no backups discarded when shutdown without dirty but tracker not ready",async function(){const{accessor:e,cleanup:t}=await p(),s=new O;e.lifecycleService.fireBeforeShutdown(s);const n=await s.value;a.ok(!n),a.ok(!e.workingCopyBackupService.discardedAllBackups),await t()}),test("onWillShutdown - backups discarded when shutdown without dirty",async function(){const{accessor:e,tracker:t,cleanup:s}=await p();await t.waitForReady();const n=new O;e.lifecycleService.fireBeforeShutdown(n);const r=await n.value;a.ok(!r),a.ok(e.workingCopyBackupService.discardedAllBackups),await s()}),test("onWillShutdown - save (hot.exit: off)",async function(){const{accessor:e,cleanup:t}=await p(),s=h.call(this,"/path/index.txt");await e.editorService.openEditor({resource:s,options:{pinned:!0}});const n=e.textFileService.files.get(s);e.fileDialogService.setConfirmResult(N.SAVE),e.filesConfigurationService.testOnFilesConfigurationChange({files:{hotExit:"off"}}),await n?.resolve(),n?.textEditorModel?.setValue("foo"),a.strictEqual(e.workingCopyService.dirtyCount,1);const r=new O;e.lifecycleService.fireBeforeShutdown(r);const c=await r.value;a.ok(!c),a.ok(!n?.isDirty()),await t()}),test("onWillShutdown - veto if backup fails",async function(){const{accessor:e,cleanup:t}=await p();class s extends L{constructor(_){super(_),this._register(e.workingCopyService.registerWorkingCopy(this))}async backup(_){throw new Error("unable to backup")}}const n=h.call(this,"/path/custom.txt");u.add(new s(n)).setDirty(!0);const c=new O;c.reason=o.QUIT,e.lifecycleService.fireBeforeShutdown(c);const w=await c.value;a.ok(w);const l=await c.finalValue?.();a.ok(l),await t()}),test("onWillShutdown - scratchpads - veto if backup fails",async function(){const{accessor:e,cleanup:t}=await p();class s extends L{constructor(I){super(I),this._register(e.workingCopyService.registerWorkingCopy(this))}capabilities=y.Untitled|y.Scratchpad;async backup(I){throw new Error("unable to backup")}isDirty(){return!1}isModified(){return!0}}const n=h.call(this,"/path/custom.txt");u.add(new s(n));const r=new O;r.reason=o.QUIT,e.lifecycleService.fireBeforeShutdown(r);const c=await r.value;a.ok(c);const w=await r.finalValue?.();a.ok(w),await t()}),test("onWillShutdown - pending backup operations canceled and tracker suspended/resumsed",async function(){const{accessor:e,tracker:t,cleanup:s}=await p(),n=h.call(this,"/path/index.txt");await e.editorService.openEditor({resource:n,options:{pinned:!0}});const r=e.textFileService.files.get(n);await r?.resolve(),r?.textEditorModel?.setValue("foo"),a.strictEqual(e.workingCopyService.dirtyCount,1),a.strictEqual(t.pendingBackupOperationCount,1);const c=M.toPromise(t.onDidSuspend),w=new O;w.reason=o.QUIT,e.lifecycleService.fireBeforeShutdown(w),await c,a.strictEqual(t.pendingBackupOperationCount,0),r?.textEditorModel?.setValue("bar"),a.strictEqual(e.workingCopyService.dirtyCount,1),a.strictEqual(t.pendingBackupOperationCount,0);const l=M.toPromise(t.onDidResume);await w.value,r?.textEditorModel?.setValue("foo"),await l,a.strictEqual(t.pendingBackupOperationCount,1),await s()}),suite("Hot Exit",()=>{suite('"onExit" setting',()=>{test("should hot exit on non-Mac (reason: CLOSE, windows: single, workspace)",function(){return e.call(this,i.ON_EXIT,o.CLOSE,!1,!0,!!g)}),test("should hot exit on non-Mac (reason: CLOSE, windows: single, empty workspace)",function(){return e.call(this,i.ON_EXIT,o.CLOSE,!1,!1,!!g)}),test("should NOT hot exit (reason: CLOSE, windows: multiple, workspace)",function(){return e.call(this,i.ON_EXIT,o.CLOSE,!0,!0,!0)}),test("should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)",function(){return e.call(this,i.ON_EXIT,o.CLOSE,!0,!1,!0)}),test("should hot exit (reason: QUIT, windows: single, workspace)",function(){return e.call(this,i.ON_EXIT,o.QUIT,!1,!0,!1)}),test("should hot exit (reason: QUIT, windows: single, empty workspace)",function(){return e.call(this,i.ON_EXIT,o.QUIT,!1,!1,!1)}),test("should hot exit (reason: QUIT, windows: multiple, workspace)",function(){return e.call(this,i.ON_EXIT,o.QUIT,!0,!0,!1)}),test("should hot exit (reason: QUIT, windows: multiple, empty workspace)",function(){return e.call(this,i.ON_EXIT,o.QUIT,!0,!1,!1)}),test("should hot exit (reason: RELOAD, windows: single, workspace)",function(){return e.call(this,i.ON_EXIT,o.RELOAD,!1,!0,!1)}),test("should hot exit (reason: RELOAD, windows: single, empty workspace)",function(){return e.call(this,i.ON_EXIT,o.RELOAD,!1,!1,!1)}),test("should hot exit (reason: RELOAD, windows: multiple, workspace)",function(){return e.call(this,i.ON_EXIT,o.RELOAD,!0,!0,!1)}),test("should hot exit (reason: RELOAD, windows: multiple, empty workspace)",function(){return e.call(this,i.ON_EXIT,o.RELOAD,!0,!1,!1)}),test("should NOT hot exit (reason: LOAD, windows: single, workspace)",function(){return e.call(this,i.ON_EXIT,o.LOAD,!1,!0,!0)}),test("should NOT hot exit (reason: LOAD, windows: single, empty workspace)",function(){return e.call(this,i.ON_EXIT,o.LOAD,!1,!1,!0)}),test("should NOT hot exit (reason: LOAD, windows: multiple, workspace)",function(){return e.call(this,i.ON_EXIT,o.LOAD,!0,!0,!0)}),test("should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)",function(){return e.call(this,i.ON_EXIT,o.LOAD,!0,!1,!0)})}),suite('"onExitAndWindowClose" setting',()=>{test("should hot exit (reason: CLOSE, windows: single, workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.CLOSE,!1,!0,!1)}),test("should hot exit (reason: CLOSE, windows: single, empty workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.CLOSE,!1,!1,!!g)}),test("should hot exit (reason: CLOSE, windows: multiple, workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.CLOSE,!0,!0,!1)}),test("should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.CLOSE,!0,!1,!0)}),test("should hot exit (reason: QUIT, windows: single, workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.QUIT,!1,!0,!1)}),test("should hot exit (reason: QUIT, windows: single, empty workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.QUIT,!1,!1,!1)}),test("should hot exit (reason: QUIT, windows: multiple, workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.QUIT,!0,!0,!1)}),test("should hot exit (reason: QUIT, windows: multiple, empty workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.QUIT,!0,!1,!1)}),test("should hot exit (reason: RELOAD, windows: single, workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.RELOAD,!1,!0,!1)}),test("should hot exit (reason: RELOAD, windows: single, empty workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.RELOAD,!1,!1,!1)}),test("should hot exit (reason: RELOAD, windows: multiple, workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.RELOAD,!0,!0,!1)}),test("should hot exit (reason: RELOAD, windows: multiple, empty workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.RELOAD,!0,!1,!1)}),test("should hot exit (reason: LOAD, windows: single, workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.LOAD,!1,!0,!1)}),test("should NOT hot exit (reason: LOAD, windows: single, empty workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.LOAD,!1,!1,!0)}),test("should hot exit (reason: LOAD, windows: multiple, workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.LOAD,!0,!0,!1)}),test("should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)",function(){return e.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.LOAD,!0,!1,!0)})}),suite('"onExit" setting - scratchpad',()=>{test("should hot exit (reason: CLOSE, windows: single, workspace)",function(){return t.call(this,i.ON_EXIT,o.CLOSE,!1,!0,!1)}),test("should hot exit (reason: CLOSE, windows: single, empty workspace)",function(){return t.call(this,i.ON_EXIT,o.CLOSE,!1,!1,!!g)}),test("should hot exit (reason: CLOSE, windows: multiple, workspace)",function(){return t.call(this,i.ON_EXIT,o.CLOSE,!0,!0,!1)}),test("should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)",function(){return t.call(this,i.ON_EXIT,o.CLOSE,!0,!1,!0)}),test("should hot exit (reason: QUIT, windows: single, workspace)",function(){return t.call(this,i.ON_EXIT,o.QUIT,!1,!0,!1)}),test("should hot exit (reason: QUIT, windows: single, empty workspace)",function(){return t.call(this,i.ON_EXIT,o.QUIT,!1,!1,!1)}),test("should hot exit (reason: QUIT, windows: multiple, workspace)",function(){return t.call(this,i.ON_EXIT,o.QUIT,!0,!0,!1)}),test("should hot exit (reason: QUIT, windows: multiple, empty workspace)",function(){return t.call(this,i.ON_EXIT,o.QUIT,!0,!1,!1)}),test("should hot exit (reason: RELOAD, windows: single, workspace)",function(){return t.call(this,i.ON_EXIT,o.RELOAD,!1,!0,!1)}),test("should hot exit (reason: RELOAD, windows: single, empty workspace)",function(){return t.call(this,i.ON_EXIT,o.RELOAD,!1,!1,!1)}),test("should hot exit (reason: RELOAD, windows: multiple, workspace)",function(){return t.call(this,i.ON_EXIT,o.RELOAD,!0,!0,!1)}),test("should hot exit (reason: RELOAD, windows: multiple, empty workspace)",function(){return t.call(this,i.ON_EXIT,o.RELOAD,!0,!1,!1)}),test("should hot exit (reason: LOAD, windows: single, workspace)",function(){return t.call(this,i.ON_EXIT,o.LOAD,!1,!0,!1)}),test("should NOT hot exit (reason: LOAD, windows: single, empty workspace)",function(){return t.call(this,i.ON_EXIT,o.LOAD,!1,!1,!0)}),test("should hot exit (reason: LOAD, windows: multiple, workspace)",function(){return t.call(this,i.ON_EXIT,o.LOAD,!0,!0,!1)}),test("should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)",function(){return t.call(this,i.ON_EXIT,o.LOAD,!0,!1,!0)})}),suite('"onExitAndWindowClose" setting - scratchpad',()=>{test("should hot exit (reason: CLOSE, windows: single, workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.CLOSE,!1,!0,!1)}),test("should hot exit (reason: CLOSE, windows: single, empty workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.CLOSE,!1,!1,!!g)}),test("should hot exit (reason: CLOSE, windows: multiple, workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.CLOSE,!0,!0,!1)}),test("should NOT hot exit (reason: CLOSE, windows: multiple, empty workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.CLOSE,!0,!1,!0)}),test("should hot exit (reason: QUIT, windows: single, workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.QUIT,!1,!0,!1)}),test("should hot exit (reason: QUIT, windows: single, empty workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.QUIT,!1,!1,!1)}),test("should hot exit (reason: QUIT, windows: multiple, workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.QUIT,!0,!0,!1)}),test("should hot exit (reason: QUIT, windows: multiple, empty workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.QUIT,!0,!1,!1)}),test("should hot exit (reason: RELOAD, windows: single, workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.RELOAD,!1,!0,!1)}),test("should hot exit (reason: RELOAD, windows: single, empty workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.RELOAD,!1,!1,!1)}),test("should hot exit (reason: RELOAD, windows: multiple, workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.RELOAD,!0,!0,!1)}),test("should hot exit (reason: RELOAD, windows: multiple, empty workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.RELOAD,!0,!1,!1)}),test("should hot exit (reason: LOAD, windows: single, workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.LOAD,!1,!0,!1)}),test("should NOT hot exit (reason: LOAD, windows: single, empty workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.LOAD,!1,!1,!0)}),test("should hot exit (reason: LOAD, windows: multiple, workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.LOAD,!0,!0,!1)}),test("should NOT hot exit (reason: LOAD, windows: multiple, empty workspace)",function(){return t.call(this,i.ON_EXIT_AND_WINDOW_CLOSE,o.LOAD,!0,!1,!0)})});async function e(s,n,r,c,w){const{accessor:l,cleanup:I}=await p(),_=h.call(this,"/path/index.txt");await l.editorService.openEditor({resource:_,options:{pinned:!0}});const C=l.textFileService.files.get(_);l.filesConfigurationService.testOnFilesConfigurationChange({files:{hotExit:s}}),c||l.contextService.setWorkspace(new F("empty:1508317022751")),r&&(l.nativeHostService.windowCount=Promise.resolve(2)),l.fileDialogService.setConfirmResult(N.CANCEL),await C?.resolve(),C?.textEditorModel?.setValue("foo"),a.strictEqual(l.workingCopyService.dirtyCount,1);const E=new O;E.reason=n,l.lifecycleService.fireBeforeShutdown(E);const D=await E.value;a.ok(typeof E.finalValue=="function"),a.strictEqual(l.workingCopyBackupService.discardedBackups.length,0),a.strictEqual(D,w),await I()}async function t(s,n,r,c,w){const{accessor:l,cleanup:I}=await p();class _ extends L{constructor(T){super(T),this._register(l.workingCopyService.registerWorkingCopy(this))}capabilities=y.Untitled|y.Scratchpad;isDirty(){return!1}isModified(){return!0}}l.filesConfigurationService.testOnFilesConfigurationChange({files:{hotExit:s}}),c||l.contextService.setWorkspace(new F("empty:1508317022751")),r&&(l.nativeHostService.windowCount=Promise.resolve(2)),l.fileDialogService.setConfirmResult(N.CANCEL);const C=h.call(this,"/path/custom.txt");u.add(new _(C));const E=new O;E.reason=n,l.lifecycleService.fireBeforeShutdown(E);const D=await E.value;a.ok(typeof E.finalValue=="function"),a.strictEqual(l.workingCopyBackupService.discardedBackups.length,0),a.strictEqual(D,w),await I()}}),te()});
