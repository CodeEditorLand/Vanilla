import b from"assert";import{DisposableStore as I}from"../../../../../base/common/lifecycle.js";import{ensureNoDisposablesAreLeakedInTestSuite as f}from"../../../../../base/test/common/utils.js";import{LanguageAgnosticBracketTokens as h}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/brackets.js";import{SmallImmutableSet as p,DenseKeyProvider as B}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/smallImmutableSet.js";import{TokenKind as k}from"../../../../common/model/bracketPairsTextModelPart/bracketPairsTree/tokenizer.js";import{TestLanguageConfigurationService as u}from"../../modes/testLanguageConfigurationService.js";suite("Bracket Pair Colorizer - Brackets",()=>{f(),test("Basic",()=>{const n="testMode1",a=new B,e=r=>{let i=p.getEmpty();return r.forEach(o=>i=i.add(`${n}:::${o}`,a)),i},t=r=>a.getKey(`${n}:::${r}`),c=new I,d=c.add(new u);c.add(d.register(n,{brackets:[["{","}"],["[","]"],["(",")"],["begin","end"],["case","endcase"],["casez","endcase"],["\\left(","\\right)"],["\\left(","\\right."],["\\left.","\\right)"],["\\left[","\\right]"],["\\left[","\\right."],["\\left.","\\right]"]]}));const g=new h(a,r=>d.getLanguageConfiguration(r)),s=[{text:"{",length:1,kind:"OpeningBracket",bracketId:t("{"),bracketIds:e(["{"])},{text:"[",length:1,kind:"OpeningBracket",bracketId:t("["),bracketIds:e(["["])},{text:"(",length:1,kind:"OpeningBracket",bracketId:t("("),bracketIds:e(["("])},{text:"begin",length:5,kind:"OpeningBracket",bracketId:t("begin"),bracketIds:e(["begin"])},{text:"case",length:4,kind:"OpeningBracket",bracketId:t("case"),bracketIds:e(["case"])},{text:"casez",length:5,kind:"OpeningBracket",bracketId:t("casez"),bracketIds:e(["casez"])},{text:"\\left(",length:6,kind:"OpeningBracket",bracketId:t("\\left("),bracketIds:e(["\\left("])},{text:"\\left.",length:6,kind:"OpeningBracket",bracketId:t("\\left."),bracketIds:e(["\\left."])},{text:"\\left[",length:6,kind:"OpeningBracket",bracketId:t("\\left["),bracketIds:e(["\\left["])},{text:"}",length:1,kind:"ClosingBracket",bracketId:t("{"),bracketIds:e(["{"])},{text:"]",length:1,kind:"ClosingBracket",bracketId:t("["),bracketIds:e(["["])},{text:")",length:1,kind:"ClosingBracket",bracketId:t("("),bracketIds:e(["("])},{text:"end",length:3,kind:"ClosingBracket",bracketId:t("begin"),bracketIds:e(["begin"])},{text:"endcase",length:7,kind:"ClosingBracket",bracketId:t("case"),bracketIds:e(["case","casez"])},{text:"\\right)",length:7,kind:"ClosingBracket",bracketId:t("\\left("),bracketIds:e(["\\left(","\\left."])},{text:"\\right.",length:7,kind:"ClosingBracket",bracketId:t("\\left("),bracketIds:e(["\\left(","\\left["])},{text:"\\right]",length:7,kind:"ClosingBracket",bracketId:t("\\left["),bracketIds:e(["\\left[","\\left."])}],l=s.map(r=>x(g.getToken(r.text,n),r.text));b.deepStrictEqual(l,s),c.dispose()})});function x(n,a){if(n!==void 0)return{text:a,length:n.length,bracketId:n.bracketId,bracketIds:n.bracketIds,kind:{[k.ClosingBracket]:"ClosingBracket",[k.OpeningBracket]:"OpeningBracket",[k.Text]:"Text"}[n.kind]}}