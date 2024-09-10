import{findFirstIdxMonotonousOrArrLen as R}from"../../../../base/common/arraysFind.js";import{RunOnceScheduler as P,TimeoutTimer as x}from"../../../../base/common/async.js";import{KeyCode as g,KeyMod as l}from"../../../../base/common/keyCodes.js";import{DisposableStore as A,dispose as F}from"../../../../base/common/lifecycle.js";import{Constants as C}from"../../../../base/common/uint.js";import{ReplaceCommand as T,ReplaceCommandThatPreservesSelection as y}from"../../../common/commands/replaceCommand.js";import{EditorOption as _}from"../../../common/config/editorOptions.js";import{CursorChangeReason as S}from"../../../common/cursorEvents.js";import{Position as p}from"../../../common/core/position.js";import{Range as M}from"../../../common/core/range.js";import{Selection as E}from"../../../common/core/selection.js";import{ScrollType as v}from"../../../common/editorCommon.js";import{EndOfLinePreference as b}from"../../../common/model.js";import{SearchParams as I}from"../../../common/model/textModelSearch.js";import{FindDecorations as N}from"./findDecorations.js";import{ReplaceAllCommand as w}from"./replaceAllCommand.js";import{parseReplaceString as D,ReplacePattern as L}from"./replacePattern.js";import{RawContextKey as f}from"../../../../platform/contextkey/common/contextkey.js";const O=new f("findWidgetVisible",!1),_e=O.toNegated(),pe=new f("findInputFocussed",!1),me=new f("replaceInputFocussed",!1),ue={primary:l.Alt|g.KeyC,mac:{primary:l.CtrlCmd|l.Alt|g.KeyC}},Se={primary:l.Alt|g.KeyW,mac:{primary:l.CtrlCmd|l.Alt|g.KeyW}},fe={primary:l.Alt|g.KeyR,mac:{primary:l.CtrlCmd|l.Alt|g.KeyR}},Ce={primary:l.Alt|g.KeyL,mac:{primary:l.CtrlCmd|l.Alt|g.KeyL}},Me={primary:l.Alt|g.KeyP,mac:{primary:l.CtrlCmd|l.Alt|g.KeyP}},ve={StartFindAction:"actions.find",StartFindWithSelection:"actions.findWithSelection",StartFindWithArgs:"editor.actions.findWithArgs",NextMatchFindAction:"editor.action.nextMatchFindAction",PreviousMatchFindAction:"editor.action.previousMatchFindAction",GoToMatchFindAction:"editor.action.goToMatchFindAction",NextSelectionMatchFindAction:"editor.action.nextSelectionMatchFindAction",PreviousSelectionMatchFindAction:"editor.action.previousSelectionMatchFindAction",StartFindReplaceAction:"editor.action.startFindReplaceAction",CloseFindWidgetCommand:"closeFindWidget",ToggleCaseSensitiveCommand:"toggleFindCaseSensitive",ToggleWholeWordCommand:"toggleFindWholeWord",ToggleRegexCommand:"toggleFindRegex",ToggleSearchScopeCommand:"toggleFindInSelection",TogglePreserveCaseCommand:"togglePreserveCase",ReplaceOneAction:"editor.action.replaceOne",ReplaceAllAction:"editor.action.replaceAll",SelectAllMatchesAction:"editor.action.selectAllMatches"},m=19999,K=240;class u{_editor;_state;_toDispose=new A;_decorations;_ignoreModelContentChanged;_startSearchingTimer;_updateDecorationsScheduler;_isDisposed;constructor(e,i){this._editor=e,this._state=i,this._isDisposed=!1,this._startSearchingTimer=new x,this._decorations=new N(e),this._toDispose.add(this._decorations),this._updateDecorationsScheduler=new P(()=>{if(this._editor.hasModel())return this.research(!1)},100),this._toDispose.add(this._updateDecorationsScheduler),this._toDispose.add(this._editor.onDidChangeCursorPosition(t=>{(t.reason===S.Explicit||t.reason===S.Undo||t.reason===S.Redo)&&this._decorations.setStartPosition(this._editor.getPosition())})),this._ignoreModelContentChanged=!1,this._toDispose.add(this._editor.onDidChangeModelContent(t=>{this._ignoreModelContentChanged||(t.isFlush&&this._decorations.reset(),this._decorations.setStartPosition(this._editor.getPosition()),this._updateDecorationsScheduler.schedule())})),this._toDispose.add(this._state.onFindReplaceStateChange(t=>this._onStateChanged(t))),this.research(!1,this._state.searchScope)}dispose(){this._isDisposed=!0,F(this._startSearchingTimer),this._toDispose.dispose()}_onStateChanged(e){this._isDisposed||this._editor.hasModel()&&(e.searchString||e.isReplaceRevealed||e.isRegex||e.wholeWord||e.matchCase||e.searchScope)&&(this._editor.getModel().isTooLargeForSyncing()?(this._startSearchingTimer.cancel(),this._startSearchingTimer.setIfNotSet(()=>{e.searchScope?this.research(e.moveCursor,this._state.searchScope):this.research(e.moveCursor)},K)):e.searchScope?this.research(e.moveCursor,this._state.searchScope):this.research(e.moveCursor))}static _getSearchRange(e,i){return i||e.getFullModelRange()}research(e,i){let t=null;typeof i<"u"?i!==null&&(Array.isArray(i)?t=i:t=[i]):t=this._decorations.getFindScopes(),t!==null&&(t=t.map(r=>{if(r.startLineNumber!==r.endLineNumber){let a=r.endLineNumber;return r.endColumn===1&&(a=a-1),new M(r.startLineNumber,1,a,this._editor.getModel().getLineMaxColumn(a))}return r}));const o=this._findMatches(t,!1,m);this._decorations.set(o,t);const s=this._editor.getSelection();let n=this._decorations.getCurrentMatchesPosition(s);if(n===0&&o.length>0){const r=R(o.map(a=>a.range),a=>M.compareRangesUsingStarts(a,s)>=0);n=r>0?r-1+1:n}this._state.changeMatchInfo(n,this._decorations.getCount(),void 0),e&&this._editor.getOption(_.find).cursorMoveOnType&&this._moveToNextMatch(this._decorations.getStartPosition())}_hasMatches(){return this._state.matchesCount>0}_cannotFind(){if(!this._hasMatches()){const e=this._decorations.getFindScope();return e&&this._editor.revealRangeInCenterIfOutsideViewport(e,v.Smooth),!0}return!1}_setCurrentFindMatch(e){const i=this._decorations.setCurrentFindMatch(e);this._state.changeMatchInfo(i,this._decorations.getCount(),e),this._editor.setSelection(e),this._editor.revealRangeInCenterIfOutsideViewport(e,v.Smooth)}_prevSearchPosition(e){const i=this._state.isRegex&&(this._state.searchString.indexOf("^")>=0||this._state.searchString.indexOf("$")>=0);let{lineNumber:t,column:o}=e;const s=this._editor.getModel();return i||o===1?(t===1?t=s.getLineCount():t--,o=s.getLineMaxColumn(t)):o--,new p(t,o)}_moveToPrevMatch(e,i=!1){if(!this._state.canNavigateBack()){const c=this._decorations.matchAfterPosition(e);c&&this._setCurrentFindMatch(c);return}if(this._decorations.getCount()<m){let c=this._decorations.matchBeforePosition(e);c&&c.isEmpty()&&c.getStartPosition().equals(e)&&(e=this._prevSearchPosition(e),c=this._decorations.matchBeforePosition(e)),c&&this._setCurrentFindMatch(c);return}if(this._cannotFind())return;const t=this._decorations.getFindScope(),o=u._getSearchRange(this._editor.getModel(),t);o.getEndPosition().isBefore(e)&&(e=o.getEndPosition()),e.isBefore(o.getStartPosition())&&(e=o.getEndPosition());const{lineNumber:s,column:n}=e,r=this._editor.getModel();let a=new p(s,n),h=r.findPreviousMatch(this._state.searchString,a,this._state.isRegex,this._state.matchCase,this._state.wholeWord?this._editor.getOption(_.wordSeparators):null,!1);if(h&&h.range.isEmpty()&&h.range.getStartPosition().equals(a)&&(a=this._prevSearchPosition(a),h=r.findPreviousMatch(this._state.searchString,a,this._state.isRegex,this._state.matchCase,this._state.wholeWord?this._editor.getOption(_.wordSeparators):null,!1)),!!h){if(!i&&!o.containsRange(h.range))return this._moveToPrevMatch(h.range.getStartPosition(),!0);this._setCurrentFindMatch(h.range)}}moveToPrevMatch(){this._moveToPrevMatch(this._editor.getSelection().getStartPosition())}_nextSearchPosition(e){const i=this._state.isRegex&&(this._state.searchString.indexOf("^")>=0||this._state.searchString.indexOf("$")>=0);let{lineNumber:t,column:o}=e;const s=this._editor.getModel();return i||o===s.getLineMaxColumn(t)?(t===s.getLineCount()?t=1:t++,o=1):o++,new p(t,o)}_moveToNextMatch(e){if(!this._state.canNavigateForward()){const t=this._decorations.matchBeforePosition(e);t&&this._setCurrentFindMatch(t);return}if(this._decorations.getCount()<m){let t=this._decorations.matchAfterPosition(e);t&&t.isEmpty()&&t.getStartPosition().equals(e)&&(e=this._nextSearchPosition(e),t=this._decorations.matchAfterPosition(e)),t&&this._setCurrentFindMatch(t);return}const i=this._getNextMatch(e,!1,!0);i&&this._setCurrentFindMatch(i.range)}_getNextMatch(e,i,t,o=!1){if(this._cannotFind())return null;const s=this._decorations.getFindScope(),n=u._getSearchRange(this._editor.getModel(),s);n.getEndPosition().isBefore(e)&&(e=n.getStartPosition()),e.isBefore(n.getStartPosition())&&(e=n.getStartPosition());const{lineNumber:r,column:a}=e,h=this._editor.getModel();let c=new p(r,a),d=h.findNextMatch(this._state.searchString,c,this._state.isRegex,this._state.matchCase,this._state.wholeWord?this._editor.getOption(_.wordSeparators):null,i);return t&&d&&d.range.isEmpty()&&d.range.getStartPosition().equals(c)&&(c=this._nextSearchPosition(c),d=h.findNextMatch(this._state.searchString,c,this._state.isRegex,this._state.matchCase,this._state.wholeWord?this._editor.getOption(_.wordSeparators):null,i)),d?!o&&!n.containsRange(d.range)?this._getNextMatch(d.range.getEndPosition(),i,t,!0):d:null}moveToNextMatch(){this._moveToNextMatch(this._editor.getSelection().getEndPosition())}_moveToMatch(e){const i=this._decorations.getDecorationRangeAt(e);i&&this._setCurrentFindMatch(i)}moveToMatch(e){this._moveToMatch(e)}_getReplacePattern(){return this._state.isRegex?D(this._state.replaceString):L.fromStaticValue(this._state.replaceString)}replace(){if(!this._hasMatches())return;const e=this._getReplacePattern(),i=this._editor.getSelection(),t=this._getNextMatch(i.getStartPosition(),!0,!1);if(t)if(i.equalsRange(t.range)){const o=e.buildReplaceString(t.matches,this._state.preserveCase),s=new T(i,o);this._executeEditorCommand("replace",s),this._decorations.setStartPosition(new p(i.startLineNumber,i.startColumn+o.length)),this.research(!0)}else this._decorations.setStartPosition(this._editor.getPosition()),this._setCurrentFindMatch(t.range)}_findMatches(e,i,t){const o=(e||[null]).map(s=>u._getSearchRange(this._editor.getModel(),s));return this._editor.getModel().findMatches(this._state.searchString,o,this._state.isRegex,this._state.matchCase,this._state.wholeWord?this._editor.getOption(_.wordSeparators):null,i,t)}replaceAll(){if(!this._hasMatches())return;const e=this._decorations.getFindScopes();e===null&&this._state.matchesCount>=m?this._largeReplaceAll():this._regularReplaceAll(e),this.research(!1)}_largeReplaceAll(){const i=new I(this._state.searchString,this._state.isRegex,this._state.matchCase,this._state.wholeWord?this._editor.getOption(_.wordSeparators):null).parseSearchRequest();if(!i)return;let t=i.regex;if(!t.multiline){let d="mu";t.ignoreCase&&(d+="i"),t.global&&(d+="g"),t=new RegExp(t.source,d)}const o=this._editor.getModel(),s=o.getValue(b.LF),n=o.getFullModelRange(),r=this._getReplacePattern();let a;const h=this._state.preserveCase;r.hasReplacementPatterns||h?a=s.replace(t,function(){return r.buildReplaceString(arguments,h)}):a=s.replace(t,r.buildReplaceString(null,h));const c=new y(n,a,this._editor.getSelection());this._executeEditorCommand("replaceAll",c)}_regularReplaceAll(e){const i=this._getReplacePattern(),t=this._findMatches(e,i.hasReplacementPatterns||this._state.preserveCase,C.MAX_SAFE_SMALL_INTEGER),o=[];for(let n=0,r=t.length;n<r;n++)o[n]=i.buildReplaceString(t[n].matches,this._state.preserveCase);const s=new w(this._editor.getSelection(),t.map(n=>n.range),o);this._executeEditorCommand("replaceAll",s)}selectAllMatches(){if(!this._hasMatches())return;const e=this._decorations.getFindScopes();let t=this._findMatches(e,!1,C.MAX_SAFE_SMALL_INTEGER).map(s=>new E(s.range.startLineNumber,s.range.startColumn,s.range.endLineNumber,s.range.endColumn));const o=this._editor.getSelection();for(let s=0,n=t.length;s<n;s++)if(t[s].equalsRange(o)){t=[o].concat(t.slice(0,s)).concat(t.slice(s+1));break}this._editor.setSelections(t)}_executeEditorCommand(e,i){try{this._ignoreModelContentChanged=!0,this._editor.pushUndoStop(),this._editor.executeCommand(e,i),this._editor.pushUndoStop()}finally{this._ignoreModelContentChanged=!1}}}export{pe as CONTEXT_FIND_INPUT_FOCUSED,_e as CONTEXT_FIND_WIDGET_NOT_VISIBLE,O as CONTEXT_FIND_WIDGET_VISIBLE,me as CONTEXT_REPLACE_INPUT_FOCUSED,ve as FIND_IDS,u as FindModelBoundToEditorModel,m as MATCHES_LIMIT,ue as ToggleCaseSensitiveKeybinding,Me as TogglePreserveCaseKeybinding,fe as ToggleRegexKeybinding,Ce as ToggleSearchScopeKeybinding,Se as ToggleWholeWordKeybinding};
