import"../../../../vs/editor/common/core/range.js";import{AbstractText as n}from"../../../../vs/editor/common/core/textEdit.js";import{TextLength as o}from"../../../../vs/editor/common/core/textLength.js";import"../../../../vs/editor/common/model.js";class m extends n{constructor(e){super();this._textModel=e}getValueOfRange(e){return this._textModel.getValueInRange(e)}get length(){const e=this._textModel.getLineCount(),t=this._textModel.getLineLength(e);return new o(e-1,t)}}export{m as TextModelText};
