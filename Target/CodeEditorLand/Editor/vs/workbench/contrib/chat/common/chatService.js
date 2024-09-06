import"../../../../../vs/base/common/async.js";import"../../../../../vs/base/common/cancellation.js";import"../../../../../vs/base/common/event.js";import"../../../../../vs/base/common/htmlContent.js";import"../../../../../vs/base/common/themables.js";import{URI as a}from"../../../../../vs/base/common/uri.js";import{Range as o}from"../../../../../vs/editor/common/core/range.js";import"../../../../../vs/editor/common/core/selection.js";import"../../../../../vs/editor/common/languages.js";import"../../../../../vs/platform/files/common/files.js";import{createDecorator as r}from"../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../vs/workbench/contrib/chat/common/chatAgents.js";import"../../../../../vs/workbench/contrib/chat/common/chatModel.js";import"../../../../../vs/workbench/contrib/chat/common/chatParserTypes.js";import"../../../../../vs/workbench/contrib/chat/common/chatRequestParser.js";import"../../../../../vs/workbench/contrib/chat/common/chatVariables.js";function i(e){return!!e&&typeof e=="object"&&"uri"in e&&e.uri instanceof a&&"version"in e&&typeof e.version=="number"&&"ranges"in e&&Array.isArray(e.ranges)&&e.ranges.every(o.isIRange)}function K(e){return!!e&&typeof e=="object"&&"documents"in e&&Array.isArray(e.documents)&&e.documents.every(i)}var s=(n=>(n[n.Complete=1]="Complete",n[n.Partial=2]="Partial",n[n.Omitted=3]="Omitted",n))(s||{}),d=(t=>(t[t.Down=0]="Down",t[t.Up=1]="Up",t))(d||{}),I=(t=>(t[t.Action=1]="Action",t[t.Toolbar=2]="Toolbar",t))(I||{});const j=r("IChatService"),ee="accessibility.voice.keywordActivation";export{d as ChatAgentVoteDirection,I as ChatCopyKind,s as ChatResponseReferencePartStatusKind,j as IChatService,ee as KEYWORD_ACTIVIATION_SETTING_ID,i as isIDocumentContext,K as isIUsedContext};