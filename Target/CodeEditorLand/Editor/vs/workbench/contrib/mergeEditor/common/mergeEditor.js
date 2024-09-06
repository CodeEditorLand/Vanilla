import{localize as e}from"../../../../../vs/nls.js";import{RawContextKey as t}from"../../../../../vs/platform/contextkey/common/contextkey.js";const i=new t("isMergeEditor",!1,{type:"boolean",description:e("is","The editor is a merge editor")}),s=new t("isMergeResultEditor",!1,{type:"boolean",description:e("isr","The editor is a the result editor of a merge editor.")}),n=new t("mergeEditorLayout","mixed",{type:"string",description:e("editorLayout","The layout mode of a merge editor")}),a=new t("mergeEditorShowBase",!1,{type:"boolean",description:e("showBase","If the merge editor shows the base version")}),g=new t("mergeEditorShowBaseAtTop",!1,{type:"boolean",description:e("showBaseAtTop","If base should be shown at the top")}),d=new t("mergeEditorShowNonConflictingChanges",!1,{type:"boolean",description:e("showNonConflictingChanges","If the merge editor shows non-conflicting changes")}),l=new t("mergeEditorBaseUri","",{type:"string",description:e("baseUri","The uri of the baser of a merge editor")}),c=new t("mergeEditorResultUri","",{type:"string",description:e("resultUri","The uri of the result of a merge editor")}),p="mergeEditorCloseWithConflicts";export{p as StorageCloseWithConflicts,i as ctxIsMergeEditor,s as ctxIsMergeResultEditor,l as ctxMergeBaseUri,n as ctxMergeEditorLayout,a as ctxMergeEditorShowBase,g as ctxMergeEditorShowBaseAtTop,d as ctxMergeEditorShowNonConflictingChanges,c as ctxMergeResultUri};
