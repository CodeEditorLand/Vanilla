import t from"assert";import{URI as q}from"../../../../base/common/uri.js";import{mock as f}from"../../../../base/test/common/mock.js";import{ensureNoDisposablesAreLeakedInTestSuite as R}from"../../../../base/test/common/utils.js";import"../../../dialogs/common/dialogs.js";import{TestDialogService as g}from"../../../dialogs/test/common/testDialogService.js";import{TestNotificationService as U}from"../../../notification/test/common/testNotificationService.js";import{UndoRedoElementType as i,UndoRedoGroup as m}from"../../common/undoRedo.js";import{UndoRedoService as y}from"../../common/undoRedoService.js";suite("UndoRedoService",()=>{function p(e=new g){const r=new U;return new y(e,r)}test("simple single resource elements",()=>{const e=q.file("test.txt"),r=p();t.strictEqual(r.canUndo(e),!1),t.strictEqual(r.canRedo(e),!1),t.strictEqual(r.hasElements(e),!1),t.ok(r.getLastElement(e)===null);let l=0,s=0;const c={type:i.Resource,resource:e,label:"typing 1",code:"typing",undo:()=>{l++},redo:()=>{s++}};r.pushElement(c),t.strictEqual(l,0),t.strictEqual(s,0),t.strictEqual(r.canUndo(e),!0),t.strictEqual(r.canRedo(e),!1),t.strictEqual(r.hasElements(e),!0),t.ok(r.getLastElement(e)===c),r.undo(e),t.strictEqual(l,1),t.strictEqual(s,0),t.strictEqual(r.canUndo(e),!1),t.strictEqual(r.canRedo(e),!0),t.strictEqual(r.hasElements(e),!0),t.ok(r.getLastElement(e)===null),r.redo(e),t.strictEqual(l,1),t.strictEqual(s,1),t.strictEqual(r.canUndo(e),!0),t.strictEqual(r.canRedo(e),!1),t.strictEqual(r.hasElements(e),!0),t.ok(r.getLastElement(e)===c);let o=0,a=0;const E={type:i.Resource,resource:e,label:"typing 2",code:"typing",undo:()=>{o++},redo:()=>{a++}};r.pushElement(E),t.strictEqual(l,1),t.strictEqual(s,1),t.strictEqual(o,0),t.strictEqual(a,0),t.strictEqual(r.canUndo(e),!0),t.strictEqual(r.canRedo(e),!1),t.strictEqual(r.hasElements(e),!0),t.ok(r.getLastElement(e)===E),r.undo(e),t.strictEqual(l,1),t.strictEqual(s,1),t.strictEqual(o,1),t.strictEqual(a,0),t.strictEqual(r.canUndo(e),!0),t.strictEqual(r.canRedo(e),!0),t.strictEqual(r.hasElements(e),!0),t.ok(r.getLastElement(e)===null);let u=0,n=0;const d={type:i.Resource,resource:e,label:"typing 2",code:"typing",undo:()=>{u++},redo:()=>{n++}};r.pushElement(d),t.strictEqual(l,1),t.strictEqual(s,1),t.strictEqual(o,1),t.strictEqual(a,0),t.strictEqual(u,0),t.strictEqual(n,0),t.strictEqual(r.canUndo(e),!0),t.strictEqual(r.canRedo(e),!1),t.strictEqual(r.hasElements(e),!0),t.ok(r.getLastElement(e)===d),r.undo(e),t.strictEqual(l,1),t.strictEqual(s,1),t.strictEqual(o,1),t.strictEqual(a,0),t.strictEqual(u,1),t.strictEqual(n,0),t.strictEqual(r.canUndo(e),!0),t.strictEqual(r.canRedo(e),!0),t.strictEqual(r.hasElements(e),!0),t.ok(r.getLastElement(e)===null)}),test("multi resource elements",async()=>{const e=q.file("test1.txt"),r=q.file("test2.txt"),l=p(new class extends f(){async prompt(d){return{result:d.buttons?.[0].run({checkboxChecked:!1})}}async confirm(){return{confirmed:!0}}});let s=0,c=0,o=0,a=0,E=0,u=0;const n={type:i.Workspace,resources:[e,r],label:"typing 1",code:"typing",undo:()=>{s++},redo:()=>{a++},split:()=>[{type:i.Resource,resource:e,label:"typing 1.1",code:"typing",undo:()=>{c++},redo:()=>{E++}},{type:i.Resource,resource:r,label:"typing 1.2",code:"typing",undo:()=>{o++},redo:()=>{u++}}]};l.pushElement(n),t.strictEqual(l.canUndo(e),!0),t.strictEqual(l.canRedo(e),!1),t.strictEqual(l.hasElements(e),!0),t.ok(l.getLastElement(e)===n),t.strictEqual(l.canUndo(r),!0),t.strictEqual(l.canRedo(r),!1),t.strictEqual(l.hasElements(r),!0),t.ok(l.getLastElement(r)===n),await l.undo(e),t.strictEqual(s,1),t.strictEqual(a,0),t.strictEqual(l.canUndo(e),!1),t.strictEqual(l.canRedo(e),!0),t.strictEqual(l.hasElements(e),!0),t.ok(l.getLastElement(e)===null),t.strictEqual(l.canUndo(r),!1),t.strictEqual(l.canRedo(r),!0),t.strictEqual(l.hasElements(r),!0),t.ok(l.getLastElement(r)===null),await l.redo(r),t.strictEqual(s,1),t.strictEqual(a,1),t.strictEqual(c,0),t.strictEqual(E,0),t.strictEqual(o,0),t.strictEqual(u,0),t.strictEqual(l.canUndo(e),!0),t.strictEqual(l.canRedo(e),!1),t.strictEqual(l.hasElements(e),!0),t.ok(l.getLastElement(e)===n),t.strictEqual(l.canUndo(r),!0),t.strictEqual(l.canRedo(r),!1),t.strictEqual(l.hasElements(r),!0),t.ok(l.getLastElement(r)===n)}),test("UndoRedoGroup.None uses id 0",()=>{t.strictEqual(m.None.id,0),t.strictEqual(m.None.nextOrder(),0),t.strictEqual(m.None.nextOrder(),0)}),R()});