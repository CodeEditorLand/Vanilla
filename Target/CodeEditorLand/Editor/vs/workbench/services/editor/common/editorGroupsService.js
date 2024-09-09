import"../../../../base/common/event.js";import{createDecorator as d}from"../../../../platform/instantiation/common/instantiation.js";import{isEditorInput as n}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import"../../../../platform/editor/common/editor.js";import"../../../../platform/configuration/common/configuration.js";import"../../../../editor/common/core/dimension.js";import"../../../../base/common/lifecycle.js";import"../../../../platform/contextkey/common/contextkey.js";import"../../../../base/common/uri.js";import"../../../common/editor/editorGroupModel.js";import"../../../../platform/window/common/window.js";import"../../../../platform/actions/common/actions.js";import"../../../../base/common/types.js";const no=d("editorGroupsService");var a=(e=>(e[e.UP=0]="UP",e[e.DOWN=1]="DOWN",e[e.LEFT=2]="LEFT",e[e.RIGHT=3]="RIGHT",e))(a||{}),p=(r=>(r[r.HORIZONTAL=0]="HORIZONTAL",r[r.VERTICAL=1]="VERTICAL",r))(p||{}),E=(e=>(e[e.FIRST=0]="FIRST",e[e.LAST=1]="LAST",e[e.NEXT=2]="NEXT",e[e.PREVIOUS=3]="PREVIOUS",e))(E||{}),u=(o=>(o[o.MAXIMIZE=0]="MAXIMIZE",o[o.EXPAND=1]="EXPAND",o[o.EVEN=2]="EVEN",o))(u||{}),l=(r=>(r[r.COPY_EDITORS=0]="COPY_EDITORS",r[r.MOVE_EDITORS=1]="MOVE_EDITORS",r))(l||{});function ao(i){const t=i;return n(t?.editor)&&n(t?.replacement)}var I=(o=>(o[o.CREATION_TIME=0]="CREATION_TIME",o[o.MOST_RECENTLY_ACTIVE=1]="MOST_RECENTLY_ACTIVE",o[o.GRID_APPEARANCE=2]="GRID_APPEARANCE",o))(I||{}),s=(o=>(o[o.NEW_EDITOR=1]="NEW_EDITOR",o[o.MOVE_EDITOR=2]="MOVE_EDITOR",o[o.COPY_EDITOR=3]="COPY_EDITOR",o))(s||{});function po(i){const t=i;return!!t&&typeof t.id=="number"&&Array.isArray(t.editors)}function Eo(i){return i.getValue("workbench.editor.openSideBySideDirection")==="down"?1:3}export{a as GroupDirection,E as GroupLocation,p as GroupOrientation,u as GroupsArrangement,I as GroupsOrder,no as IEditorGroupsService,l as MergeGroupMode,s as OpenEditorContext,po as isEditorGroup,ao as isEditorReplacement,Eo as preferredSideBySideGroupDirection};
