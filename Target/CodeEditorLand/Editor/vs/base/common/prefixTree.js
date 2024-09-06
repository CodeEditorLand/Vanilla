import{Iterable as f}from"../../../vs/base/common/iterator.js";const o=Symbol("unset");class v{root=new u;_size=0;get size(){return this._size}get nodes(){return this.root.children?.values()||f.empty()}get entries(){return this.root.children?.entries()||f.empty()}insert(n,e,r){this.opNode(n,t=>t._value=e,r)}mutate(n,e){this.opNode(n,r=>r._value=e(r._value===o?void 0:r._value))}mutatePath(n,e){this.opNode(n,()=>{},r=>e(r))}delete(n){const e=this.getPathToKey(n);if(!e)return;let r=e.length-1;const t=e[r].node._value;if(t!==o){for(this._size--,e[r].node._value=o;r>0;r--){const{node:i,part:a}=e[r];if(i.children?.size||i._value!==o)break;e[r-1].node.children.delete(a)}return t}}*deleteRecursive(n){const e=this.getPathToKey(n);if(!e)return;const r=e[e.length-1].node;for(let t=e.length-1;t>0;t--){const i=e[t-1];if(i.node.children.delete(e[t].part),i.node.children.size>0||i.node._value!==o)break}for(const t of c(r))t._value!==o&&(this._size--,yield t._value)}find(n){let e=this.root;for(const r of n){const t=e.children?.get(r);if(!t)return;e=t}return e._value===o?void 0:e._value}hasKeyOrParent(n){let e=this.root;for(const r of n){const t=e.children?.get(r);if(!t)return!1;if(t._value!==o)return!0;e=t}return!1}hasKeyOrChildren(n){let e=this.root;for(const r of n){const t=e.children?.get(r);if(!t)return!1;e=t}return!0}hasKey(n){let e=this.root;for(const r of n){const t=e.children?.get(r);if(!t)return!1;e=t}return e._value!==o}getPathToKey(n){const e=[{part:"",node:this.root}];let r=0;for(const t of n){const i=e[r].node.children?.get(t);if(!i)return;e.push({part:t,node:i}),r++}return e}opNode(n,e,r){let t=this.root;for(const s of n){if(t.children)if(t.children.has(s))t=t.children.get(s);else{const l=new u;t.children.set(s,l),t=l}else{const l=new u;t.children=new Map([[s,l]]),t=l}r?.(t)}const i=t._value===o?0:1;e(t);const a=t._value===o?0:1;this._size+=a-i}*values(){for(const{_value:n}of c(this.root))n!==o&&(yield n)}}function*c(d){const n=[d];for(;n.length>0;){const e=n.pop();if(yield e,e.children)for(const r of e.children.values())n.push(r)}}class u{children;get value(){return this._value===o?void 0:this._value}set value(n){this._value=n===void 0?o:n}_value=o}export{v as WellDefinedPrefixTree};
