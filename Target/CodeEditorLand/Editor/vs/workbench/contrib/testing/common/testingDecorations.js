import"../../../../../vs/base/common/actions.js";import{binarySearch as r}from"../../../../../vs/base/common/arrays.js";import"../../../../../vs/base/common/event.js";import"../../../../../vs/base/common/uri.js";import"../../../../../vs/editor/common/core/position.js";import"../../../../../vs/editor/common/model.js";import{createDecorator as n}from"../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../vs/workbench/contrib/testing/common/testTypes.js";class b{value=[];push(i){const e=r(this.value,i,(t,o)=>t.line-o.line);this.value.splice(e<0?~e:e,0,i)}*lines(){if(!this.value.length)return;let i=0,e=this.value[0].line;for(let t=1;t<this.value.length;t++){const o=this.value[t];o.line!==e&&(yield[e,this.value.slice(i,t)],e=o.line,i=t)}yield[e,this.value.slice(i)]}}const y=n("testingDecorationService");export{y as ITestingDecorationsService,b as TestDecorations};