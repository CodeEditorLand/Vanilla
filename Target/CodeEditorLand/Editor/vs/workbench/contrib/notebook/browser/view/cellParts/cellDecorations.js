import*as i from"../../../../../../base/browser/dom.js";import{CellContentPart as s}from"../cellPart.js";class c extends s{constructor(o,t){super();this.rootContainer=o;this.decorationContainer=t}didRenderCell(o){const t=[];this.rootContainer.classList.forEach(e=>{/^nb-.*$/.test(e)&&t.push(e)}),t.forEach(e=>{this.rootContainer.classList.remove(e)}),this.decorationContainer.innerText="";const r=()=>{this.decorationContainer.innerText="",o.getCellDecorations().filter(e=>e.topClassName!==void 0).forEach(e=>{this.decorationContainer.append(i.$(`.${e.topClassName}`))})};this.cellDisposables.add(o.onCellDecorationsChanged(e=>{(e.added.find(n=>n.topClassName)||e.removed.find(n=>n.topClassName))&&r()})),r()}}export{c as CellDecorations};
