import{Disposable as s}from"../../../../../vs/base/common/lifecycle.js";import{ToggleTabFocusModeAction as a}from"../../../../../vs/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js";import*as o from"../../../../../vs/nls.js";import{AccessibleViewProviderId as c,AccessibleViewType as r}from"../../../../../vs/platform/accessibility/browser/accessibleView.js";import"../../../../../vs/platform/accessibility/browser/accessibleViewRegistry.js";import{ContextKeyExpr as d}from"../../../../../vs/platform/contextkey/common/contextkey.js";import{IInstantiationService as p}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{AccessibilityVerbositySettingId as l}from"../../../../../vs/workbench/contrib/accessibility/browser/accessibilityConfiguration.js";import{ctxCommentEditorFocused as b}from"../../../../../vs/workbench/contrib/comments/browser/simpleCommentEditor.js";import{CommentCommandId as n}from"../../../../../vs/workbench/contrib/comments/common/commentCommandIds.js";import{CommentContextKeys as u}from"../../../../../vs/workbench/contrib/comments/common/commentContextKeys.js";var t;(e=>(e.intro=o.localize("intro","The editor contains commentable range(s). Some useful commands include:"),e.tabFocus=o.localize("introWidget","This widget contains a text area, for composition of new comments, and actions, that can be tabbed to once tab moves focus mode has been enabled with the command Toggle Tab Key Moves Focus{0}.",`<keybinding:${a.ID}>`),e.commentCommands=o.localize("commentCommands","Some useful comment commands include:"),e.escape=o.localize("escape","- Dismiss Comment (Escape)"),e.nextRange=o.localize("next","- Go to Next Commenting Range{0}.",`<keybinding:${n.NextRange}>`),e.previousRange=o.localize("previous","- Go to Previous Commenting Range{0}.",`<keybinding:${n.PreviousRange}>`),e.nextCommentThread=o.localize("nextCommentThreadKb","- Go to Next Comment Thread{0}.",`<keybinding:${n.NextThread}>`),e.previousCommentThread=o.localize("previousCommentThreadKb","- Go to Previous Comment Thread{0}.",`<keybinding:${n.PreviousThread}>`),e.addComment=o.localize("addCommentNoKb","- Add Comment on Current Selection{0}.",`<keybinding:${n.Add}>`),e.submitComment=o.localize("submitComment","- Submit Comment{0}.",`<keybinding:${n.Submit}>`)))(t||={});class g extends s{id=c.Comments;verbositySettingKey=l.Comments;options={type:r.Help};_element;provideContent(){return[t.tabFocus,t.commentCommands,t.escape,t.addComment,t.submitComment,t.nextRange,t.previousRange].join(`
`)}onClose(){this._element?.focus()}}class O{priority=110;name="comments";type=r.Help;when=d.or(b,u.commentFocused);getProvider(m){return m.get(p).createInstance(g)}}export{t as CommentAccessibilityHelpNLS,O as CommentsAccessibilityHelp,g as CommentsAccessibilityHelpProvider};
