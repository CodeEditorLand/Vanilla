import{onUnexpectedError as n}from"../../../../base/common/errors.js";import{parse as o}from"../../../../base/common/marshalling.js";import{MergeEditorInput as p,MergeEditorInputData as r}from"./mergeEditorInput.js";class l{canSerialize(){return!0}serialize(i){return JSON.stringify(this.toJSON(i))}toJSON(i){return{base:i.base,input1:i.input1,input2:i.input2,result:i.result}}deserialize(i,e){try{const t=o(e);return i.createInstance(p,t.base,new r(t.input1.uri,t.input1.title,t.input1.detail,t.input1.description),new r(t.input2.uri,t.input2.title,t.input2.detail,t.input2.description),t.result)}catch(t){n(t);return}}}export{l as MergeEditorSerializer};
