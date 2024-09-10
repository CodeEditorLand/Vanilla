import{VSBuffer as i,decodeBase64 as u,encodeBase64 as m}from"../../../../base/common/buffer.js";import{ResourceMap as a}from"../../../../base/common/map.js";import{Schemas as r}from"../../../../base/common/network.js";import{InstantiationType as f,registerSingleton as b}from"../../../../platform/instantiation/common/extensions.js";import{createDecorator as g}from"../../../../platform/instantiation/common/instantiation.js";const I=g("notebookDocumentService"),c=["W","X","Y","Z","a","b","c","d","e","f"],h=new RegExp(`^[${c.join("")}]+`),s=7;function k(o){if(o.scheme!==r.vscodeNotebookCell)return;const e=o.fragment.indexOf("s");if(e<0)return;const t=parseInt(o.fragment.substring(0,e).replace(h,""),s),n=u(o.fragment.substring(e+1)).toString();if(!isNaN(t))return{handle:t,notebook:o.with({scheme:n,fragment:null})}}function S(o,e){const t=e.toString(s),d=`${t.length<c.length?c[t.length-1]:"z"}${t}s${m(i.fromString(o.scheme),!0,!0)}`;return o.with({scheme:r.vscodeNotebookCell,fragment:d})}function _(o){if(o.scheme!==r.vscodeNotebookMetadata)return;const e=u(o.fragment).toString();return o.with({scheme:e,fragment:null})}function w(o){const e=`${m(i.fromString(o.scheme),!0,!0)}`;return o.with({scheme:r.vscodeNotebookMetadata,fragment:e})}class p{_documents=new a;getNotebook(e){if(e.scheme===r.vscodeNotebookCell){const t=k(e);if(t){const n=this._documents.get(t.notebook);if(n)return n}}return this._documents.get(e)}addNotebookDocument(e){this._documents.set(e.uri,e)}removeNotebookDocument(e){this._documents.delete(e.uri)}}b(I,p,f.Delayed);export{I as INotebookDocumentService,p as NotebookDocumentWorkbenchService,S as generate,w as generateMetadataUri,k as parse,_ as parseMetadataUri};
