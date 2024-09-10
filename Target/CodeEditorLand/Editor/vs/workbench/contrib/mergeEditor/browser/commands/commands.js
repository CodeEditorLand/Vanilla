import{Codicon as m}from"../../../../../base/common/codicons.js";import{basename as R}from"../../../../../base/common/resources.js";import{URI as C}from"../../../../../base/common/uri.js";import{localize as h,localize2 as s}from"../../../../../nls.js";import{Action2 as g,MenuId as d}from"../../../../../platform/actions/common/actions.js";import{ContextKeyExpr as v}from"../../../../../platform/contextkey/common/contextkey.js";import{IDialogService as V}from"../../../../../platform/dialogs/common/dialogs.js";import{IOpenerService as W}from"../../../../../platform/opener/common/opener.js";import{IStorageService as U,StorageScope as N}from"../../../../../platform/storage/common/storage.js";import{MergeEditorInputData as A}from"../mergeEditorInput.js";import{MergeEditor as f}from"../view/mergeEditor.js";import{ctxIsMergeEditor as n,ctxMergeEditorLayout as M,ctxMergeEditorShowBase as y,ctxMergeEditorShowBaseAtTop as T,ctxMergeEditorShowNonConflictingChanges as b,StorageCloseWithConflicts as L}from"../../common/mergeEditor.js";import{IEditorService as a}from"../../../../services/editor/common/editorService.js";class l extends g{constructor(e){super(e)}run(e){const{activeEditorPane:t}=e.get(a);if(t instanceof f){const o=t.viewModel.get();if(!o)return;this.runWithViewModel(o,e)}}}class O extends g{constructor(e){super(e)}run(e,...t){const{activeEditorPane:o}=e.get(a);if(o instanceof f){const p=o.viewModel.get();return p?this.runWithMergeEditor({viewModel:p,inputModel:o.inputModel.get(),input:o.input,editorIdentifier:{editor:o.input,groupId:o.group.id}},e,...t):void 0}}}class pe extends g{constructor(){super({id:"_open.mergeEditor",title:s("title","Open Merge Editor")})}run(e,...t){const o=S.validate(t[0]),p={base:{resource:o.base},input1:{resource:o.input1.uri,label:o.input1.title,description:o.input1.description,detail:o.input1.detail},input2:{resource:o.input2.uri,label:o.input2.title,description:o.input2.description,detail:o.input2.detail},result:{resource:o.output},options:{preserveFocus:!0}};e.get(a).openEditor(p)}}var S;(p=>{function r(i){if(!i||typeof i!="object")throw new TypeError("invalid argument");const c=i,E=t(c.base),w=t(c.output),I=e(c.input1),x=e(c.input2);return{base:E,input1:I,input2:x,output:w}}p.validate=r;function e(i){if(typeof i=="string")return new A(C.parse(i,!0),void 0,void 0,void 0);if(!i||typeof i!="object")throw new TypeError("invalid argument");if(o(i))return new A(C.revive(i),void 0,void 0,void 0);const c=i,E=c.title,w=t(c.uri),I=c.detail,x=c.description;return new A(w,E,I,x)}function t(i){if(typeof i=="string")return C.parse(i,!0);if(i&&typeof i=="object")return C.revive(i);throw new TypeError("invalid argument")}function o(i){if(!i||typeof i!="object")return!1;const c=i;return typeof c.scheme=="string"&&typeof c.authority=="string"&&typeof c.path=="string"&&typeof c.query=="string"&&typeof c.fragment=="string"}})(S||={});class ge extends g{constructor(){super({id:"merge.mixedLayout",title:s("layout.mixed","Mixed Layout"),toggled:M.isEqualTo("mixed"),menu:[{id:d.EditorTitle,when:n,group:"1_merge",order:9}],precondition:n})}run(e){const{activeEditorPane:t}=e.get(a);t instanceof f&&t.setLayoutKind("mixed")}}class me extends g{constructor(){super({id:"merge.columnLayout",title:s("layout.column","Column Layout"),toggled:M.isEqualTo("columns"),menu:[{id:d.EditorTitle,when:n,group:"1_merge",order:10}],precondition:n})}run(e){const{activeEditorPane:t}=e.get(a);t instanceof f&&t.setLayoutKind("columns")}}class fe extends g{constructor(){super({id:"merge.showNonConflictingChanges",title:s("showNonConflictingChanges","Show Non-Conflicting Changes"),toggled:b.isEqualTo(!0),menu:[{id:d.EditorTitle,when:n,group:"3_merge",order:9}],precondition:n})}run(e){const{activeEditorPane:t}=e.get(a);t instanceof f&&t.toggleShowNonConflictingChanges()}}class he extends g{constructor(){super({id:"merge.showBase",title:s("layout.showBase","Show Base"),toggled:y.isEqualTo(!0),menu:[{id:d.EditorTitle,when:v.and(n,M.isEqualTo("columns")),group:"2_merge",order:9}]})}run(e){const{activeEditorPane:t}=e.get(a);t instanceof f&&t.toggleBase()}}class Ee extends g{constructor(){super({id:"merge.showBaseTop",title:s("layout.showBaseTop","Show Base Top"),toggled:v.and(y,T),menu:[{id:d.EditorTitle,when:v.and(n,M.isEqualTo("mixed")),group:"2_merge",order:10}]})}run(e){const{activeEditorPane:t}=e.get(a);t instanceof f&&t.toggleShowBaseTop()}}class ve extends g{constructor(){super({id:"merge.showBaseCenter",title:s("layout.showBaseCenter","Show Base Center"),toggled:v.and(y,T.negate()),menu:[{id:d.EditorTitle,when:v.and(n,M.isEqualTo("mixed")),group:"2_merge",order:11}]})}run(e){const{activeEditorPane:t}=e.get(a);t instanceof f&&t.toggleShowBaseCenter()}}const u=s("mergeEditor","Merge Editor");class Me extends l{constructor(){super({id:"merge.openResult",icon:m.goToFile,title:s("openfile","Open File"),category:u,menu:[{id:d.EditorTitle,when:n,group:"navigation",order:1}],precondition:n})}runWithViewModel(e,t){t.get(a).openEditor({resource:e.model.resultTextModel.uri})}}class Ce extends l{constructor(){super({id:"merge.goToNextUnhandledConflict",category:u,title:s("merge.goToNextUnhandledConflict","Go to Next Unhandled Conflict"),icon:m.arrowDown,menu:[{id:d.EditorTitle,when:n,group:"navigation",order:3}],f1:!0,precondition:n})}runWithViewModel(e){e.model.telemetry.reportNavigationToNextConflict(),e.goToNextModifiedBaseRange(t=>!e.model.isHandled(t).get())}}class we extends l{constructor(){super({id:"merge.goToPreviousUnhandledConflict",category:u,title:s("merge.goToPreviousUnhandledConflict","Go to Previous Unhandled Conflict"),icon:m.arrowUp,menu:[{id:d.EditorTitle,when:n,group:"navigation",order:2}],f1:!0,precondition:n})}runWithViewModel(e){e.model.telemetry.reportNavigationToPreviousConflict(),e.goToPreviousModifiedBaseRange(t=>!e.model.isHandled(t).get())}}class Ie extends l{constructor(){super({id:"merge.toggleActiveConflictInput1",category:u,title:s("merge.toggleCurrentConflictFromLeft","Toggle Current Conflict from Left"),f1:!0,precondition:n})}runWithViewModel(e){e.toggleActiveConflict(1)}}class xe extends l{constructor(){super({id:"merge.toggleActiveConflictInput2",category:u,title:s("merge.toggleCurrentConflictFromRight","Toggle Current Conflict from Right"),f1:!0,precondition:n})}runWithViewModel(e){e.toggleActiveConflict(2)}}class Ae extends l{constructor(){super({id:"mergeEditor.compareInput1WithBase",category:u,title:s("mergeEditor.compareInput1WithBase","Compare Input 1 With Base"),shortTitle:h("mergeEditor.compareWithBase","Compare With Base"),f1:!0,precondition:n,menu:{id:d.MergeInput1Toolbar,group:"primary"},icon:m.compareChanges})}runWithViewModel(e,t){const o=t.get(a);B(e,o,1)}}class ye extends l{constructor(){super({id:"mergeEditor.compareInput2WithBase",category:u,title:s("mergeEditor.compareInput2WithBase","Compare Input 2 With Base"),shortTitle:h("mergeEditor.compareWithBase","Compare With Base"),f1:!0,precondition:n,menu:{id:d.MergeInput2Toolbar,group:"primary"},icon:m.compareChanges})}runWithViewModel(e,t){const o=t.get(a);B(e,o,2)}}async function B(r,e,t){e.openEditor(e.activeEditor,{pinned:!0});const p=r.model.base,i=t===1?r.inputCodeEditorView1.editor:r.inputCodeEditorView2.editor,c=i.getPosition().lineNumber;await e.openEditor({original:{resource:p.uri},modified:{resource:i.getModel().uri},options:{selection:{startLineNumber:c,startColumn:1},revealIfOpened:!0,revealIfVisible:!0}})}class Te extends l{constructor(){super({id:"merge.openBaseEditor",category:u,title:s("merge.openBaseEditor","Open Base File"),f1:!0,precondition:n})}runWithViewModel(e,t){t.get(W).open(e.model.base.uri)}}class Se extends l{constructor(){super({id:"merge.acceptAllInput1",category:u,title:s("merge.acceptAllInput1","Accept All Changes from Left"),f1:!0,precondition:n,menu:{id:d.MergeInput1Toolbar,group:"primary"},icon:m.checkAll})}runWithViewModel(e){e.acceptAll(1)}}class Be extends l{constructor(){super({id:"merge.acceptAllInput2",category:u,title:s("merge.acceptAllInput2","Accept All Changes from Right"),f1:!0,precondition:n,menu:{id:d.MergeInput2Toolbar,group:"primary"},icon:m.checkAll})}runWithViewModel(e){e.acceptAll(2)}}class Re extends l{constructor(){super({id:"mergeEditor.resetResultToBaseAndAutoMerge",category:u,title:s("mergeEditor.resetResultToBaseAndAutoMerge","Reset Result"),shortTitle:h("mergeEditor.resetResultToBaseAndAutoMerge.short","Reset"),f1:!0,precondition:n,menu:{id:d.MergeInputResultToolbar,group:"primary"},icon:m.discard})}runWithViewModel(e,t){e.model.reset()}}class Ve extends g{constructor(){super({id:"mergeEditor.resetCloseWithConflictsChoice",category:u,title:s("mergeEditor.resetChoice","Reset Choice for 'Close with Conflicts'"),f1:!0})}run(e){e.get(U).remove(L,N.PROFILE)}}class We extends O{constructor(){super({id:"mergeEditor.acceptMerge",category:u,title:s("mergeEditor.acceptMerge","Complete Merge"),f1:!1,precondition:n})}async runWithMergeEditor({inputModel:e,editorIdentifier:t,viewModel:o},p){const i=p.get(V),c=p.get(a);if(o.model.unhandledConflictsCount.get()>0){const{confirmed:E}=await i.confirm({message:h("mergeEditor.acceptMerge.unhandledConflicts.message","Do you want to complete the merge of {0}?",R(e.resultUri)),detail:h("mergeEditor.acceptMerge.unhandledConflicts.detail","The file contains unhandled conflicts."),primaryButton:h({key:"mergeEditor.acceptMerge.unhandledConflicts.accept",comment:["&& denotes a mnemonic"]},"&&Complete with Conflicts")});if(!E)return{successful:!1}}return await e.accept(),await c.closeEditor(t),{successful:!0}}}export{Se as AcceptAllInput1,Be as AcceptAllInput2,We as AcceptMerge,Ae as CompareInput1WithBaseCommand,ye as CompareInput2WithBaseCommand,Ce as GoToNextUnhandledConflict,we as GoToPreviousUnhandledConflict,Te as OpenBaseFile,pe as OpenMergeEditor,Me as OpenResultResource,Ve as ResetCloseWithConflictsChoice,Re as ResetToBaseAndAutoMergeCommand,me as SetColumnLayout,ge as SetMixedLayout,he as ShowHideBase,ve as ShowHideCenterBase,Ee as ShowHideTopBase,fe as ShowNonConflictingChanges,Ie as ToggleActiveConflictInput1,xe as ToggleActiveConflictInput2};
