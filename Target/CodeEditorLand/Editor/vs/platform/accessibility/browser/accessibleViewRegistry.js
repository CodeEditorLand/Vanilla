const t=new class{_implementations=[];register(e){return this._implementations.push(e),{dispose:()=>{const i=this._implementations.indexOf(e);i!==-1&&this._implementations.splice(i,1)}}}getImplementations(){return this._implementations}};export{t as AccessibleViewRegistry};
