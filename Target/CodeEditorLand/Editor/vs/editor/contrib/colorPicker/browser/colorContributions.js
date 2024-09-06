import{Disposable as s}from"../../../../../vs/base/common/lifecycle.js";import{MouseTargetType as a}from"../../../../../vs/editor/browser/editorBrowser.js";import{EditorContributionInstantiation as d,registerEditorContribution as c}from"../../../../../vs/editor/browser/editorExtensions.js";import{EditorOption as m}from"../../../../../vs/editor/common/config/editorOptions.js";import{Range as u}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/editorCommon.js";import{ColorDecorationInjectedTextMarker as l}from"../../../../../vs/editor/contrib/colorPicker/browser/colorDetector.js";import{ColorHoverParticipant as p}from"../../../../../vs/editor/contrib/colorPicker/browser/colorHoverParticipant.js";import{ContentHoverController as C}from"../../../../../vs/editor/contrib/hover/browser/contentHoverController2.js";import{HoverStartMode as f,HoverStartSource as g}from"../../../../../vs/editor/contrib/hover/browser/hoverOperation.js";import{HoverParticipantRegistry as v}from"../../../../../vs/editor/contrib/hover/browser/hoverTypes.js";class i extends s{constructor(r){super();this._editor=r;this._register(r.onMouseDown(t=>this.onMouseDown(t)))}static ID="editor.contrib.colorContribution";static RECOMPUTE_TIME=1e3;dispose(){super.dispose()}onMouseDown(r){const t=this._editor.getOption(m.colorDecoratorsActivatedOn);if(t!=="click"&&t!=="clickAndHover")return;const o=r.target;if(o.type!==a.CONTENT_TEXT||!o.detail.injectedText||o.detail.injectedText.options.attachedData!==l||!o.range)return;const e=this._editor.getContribution(C.ID);if(e&&!e.isColorPickerVisible){const n=new u(o.range.startLineNumber,o.range.startColumn+1,o.range.endLineNumber,o.range.endColumn+1);e.showContentHover(n,f.Immediate,g.Mouse,!1,!0)}}}c(i.ID,i,d.BeforeFirstInteraction),v.register(p);export{i as ColorContribution};
