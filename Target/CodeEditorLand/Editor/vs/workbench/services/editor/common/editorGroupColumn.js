import"../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../vs/workbench/common/editor.js";import{GroupsOrder as e,preferredSideBySideGroupDirection as I}from"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{ACTIVE_GROUP as u,SIDE_GROUP as G}from"../../../../../vs/workbench/services/editor/common/editorService.js";function m(o,t,r=u){if(r===u||r===G)return r;let p=o.getGroups(e.GRID_APPEARANCE)[r];if(!p&&r<9){for(let i=0;i<=r;i++){const E=o.getGroups(e.GRID_APPEARANCE);E[i]||o.addGroup(E[i-1],I(t))}p=o.getGroups(e.GRID_APPEARANCE)[r]}return p?.id??G}function T(o,t){const r=typeof t=="number"?o.getGroup(t):t;return o.getGroups(e.GRID_APPEARANCE).indexOf(r??o.activeGroup)}export{m as columnToEditorGroup,T as editorGroupToColumn};
