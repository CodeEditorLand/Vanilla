import"../../../../platform/contextkey/common/contextkey.js";import{CONTEXT_CAN_VIEW_MEMORY as i,CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT as E,CONTEXT_DEBUG_TYPE as s,CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT as _,CONTEXT_VARIABLE_IS_READONLY as T}from"./debug.js";import"./debugModel.js";function N(n,e,o=[]){const t=e.getSession(),r=[[E.key,e.variableMenuContext||""],[_.key,!!e.evaluateName],[i.key,!!t?.capabilities.supportsReadMemoryRequest&&e.memoryReference!==void 0],[T.key,!!e.presentationHint?.attributes?.includes("readOnly")||e.presentationHint?.lazy],[s.key,t?.configuration.type],...o];return n.createOverlay(r)}export{N as getContextForVariable};
