import{compareBy as _,numberComparator as K}from"../../../../../base/common/arrays.js";import{findFirstMax as P}from"../../../../../base/common/arraysFind.js";import{Emitter as w,Event as A}from"../../../../../base/common/event.js";import{Disposable as E}from"../../../../../base/common/lifecycle.js";import{Position as W}from"../../../../common/core/position.js";import{Range as D}from"../../../../common/core/range.js";import{SingleTextEdit as R}from"../../../../common/core/textEdit.js";import{CompletionItemInsertTextRule as M,SelectedSuggestionInfo as F}from"../../../../common/languages.js";import{SnippetParser as V}from"../../../snippet/browser/snippetParser.js";import{SnippetSession as j}from"../../../snippet/browser/snippetSession.js";import{SuggestController as c}from"../../../suggest/browser/suggestController.js";import{singleTextEditAugments as q,singleTextRemoveCommonPrefix as v}from"./singleTextEdit.js";class Z extends E{constructor(e,s,n){super();this.editor=e;this.suggestControllerPreselector=s;this.onWillAccept=n;this._register(e.onKeyDown(o=>{o.shiftKey&&!this.isShiftKeyPressed&&(this.isShiftKeyPressed=!0,this.update(this._isActive))})),this._register(e.onKeyUp(o=>{o.shiftKey&&this.isShiftKeyPressed&&(this.isShiftKeyPressed=!1,this.update(this._isActive))}));const t=c.get(this.editor);if(t){this._register(t.registerSelector({priority:100,select:(d,r,m)=>{const l=this.editor.getModel();if(!l)return-1;const a=this.suggestControllerPreselector(),h=a?v(a,l):void 0;if(!h)return-1;const x=W.lift(r),b=m.map((g,T)=>{const y=u.fromSuggestion(t,l,x,g,this.isShiftKeyPressed),I=v(y.toSingleTextEdit(),l),C=q(h,I);return{index:T,valid:C,prefixLength:I.text.length,suggestItem:g}}).filter(g=>g&&g.valid&&g.prefixLength>0),S=P(b,_(g=>g.prefixLength,K));return S?S.index:-1}}));let o=!1;const p=()=>{o||(o=!0,this._register(t.widget.value.onDidShow(()=>{this.isSuggestWidgetVisible=!0,this.update(!0)})),this._register(t.widget.value.onDidHide(()=>{this.isSuggestWidgetVisible=!1,this.update(!1)})),this._register(t.widget.value.onDidFocus(()=>{this.isSuggestWidgetVisible=!0,this.update(!0)})))};this._register(A.once(t.model.onDidTrigger)(d=>{p()})),this._register(t.onWillInsertSuggestItem(d=>{const r=this.editor.getPosition(),m=this.editor.getModel();if(!r||!m)return;const l=u.fromSuggestion(t,m,r,d.item,this.isShiftKeyPressed);this.onWillAccept(l)}))}this.update(this._isActive)}isSuggestWidgetVisible=!1;isShiftKeyPressed=!1;_isActive=!1;_currentSuggestItemInfo=void 0;get selectedItem(){return this._currentSuggestItemInfo}_onDidSelectedItemChange=this._register(new w);onDidSelectedItemChange=this._onDidSelectedItemChange.event;update(e){const s=this.getSuggestItemInfo();(this._isActive!==e||!B(this._currentSuggestItemInfo,s))&&(this._isActive=e,this._currentSuggestItemInfo=s,this._onDidSelectedItemChange.fire())}getSuggestItemInfo(){const e=c.get(this.editor);if(!e||!this.isSuggestWidgetVisible)return;const s=e.widget.value.getFocusedItem(),n=this.editor.getPosition(),t=this.editor.getModel();if(!(!s||!n||!t))return u.fromSuggestion(e,t,n,s.item,this.isShiftKeyPressed)}stopForceRenderingAbove(){c.get(this.editor)?.stopForceRenderingAbove()}forceRenderingAbove(){c.get(this.editor)?.forceRenderingAbove()}}class u{constructor(i,e,s,n){this.range=i;this.insertText=e;this.completionItemKind=s;this.isSnippetText=n}static fromSuggestion(i,e,s,n,t){let{insertText:o}=n.completion,p=!1;if(n.completion.insertTextRules&M.InsertAsSnippet){const r=new V().parse(o);r.children.length<100&&j.adjustWhitespace(e,s,!0,r),o=r.toString(),p=!0}const d=i.getOverwriteInfo(n,t);return new u(D.fromPositions(s.delta(0,-d.overwriteBefore),s.delta(0,Math.max(d.overwriteAfter,0))),o,n.completion.kind,p)}equals(i){return this.range.equalsRange(i.range)&&this.insertText===i.insertText&&this.completionItemKind===i.completionItemKind&&this.isSnippetText===i.isSnippetText}toSelectedSuggestionInfo(){return new F(this.range,this.insertText,this.completionItemKind,this.isSnippetText)}toSingleTextEdit(){return new R(this.range,this.insertText)}}function B(f,i){return f===i?!0:!f||!i?!1:f.equals(i)}export{u as SuggestItemInfo,Z as SuggestWidgetAdaptor};
