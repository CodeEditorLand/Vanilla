import{strictEqual as s}from"assert";import{getKoreanAltChars as a}from"../../../common/naturalLanguage/korean.js";import{ensureNoDisposablesAreLeakedInTestSuite as i}from"../utils.js";function o(r){let e="";for(let t=0;t<r.length;t++){const n=a(r.charCodeAt(t));n?e+=String.fromCharCode(...Array.from(n)):e+=r.charAt(t)}return e}suite("Korean",()=>{i(),suite("getKoreanAltChars",()=>{test("Modern initial consonants",()=>{const r=new Map([["\u1100","r"],["\u1101","R"],["\u1102","s"],["\u1103","e"],["\u1104","E"],["\u1105","f"],["\u1106","a"],["\u1107","q"],["\u1108","Q"],["\u1109","t"],["\u110A","T"],["\u110B","d"],["\u110C","w"],["\u110D","W"],["\u110E","c"],["\u110F","z"],["\u1110","x"],["\u1111","v"],["\u1112","g"]]);for(const[e,t]of r.entries())s(o(e),t,`"${e}" should result in "${t}"`)}),test("Modern latter consonants",()=>{const r=new Map([["\u11A8","r"],["\u11A9","R"],["\u11AA","rt"],["\u11AB","s"],["\u11AC","sw"],["\u11AD","sg"],["\u11AE","e"],["\u11AF","f"],["\u11B0","fr"],["\u11B1","fa"],["\u11B2","fq"],["\u11B3","ft"],["\u11B4","fx"],["\u11B5","fv"],["\u11B6","fg"],["\u11B7","a"],["\u11B8","q"],["\u11B9","qt"],["\u11BA","t"],["\u11BB","T"],["\u11BC","d"],["\u11BD","w"],["\u11BE","c"],["\u11BF","z"],["\u11C0","x"],["\u11C1","v"],["\u11C2","g"]]);for(const[e,t]of r.entries())s(o(e),t,`"${e}" (0x${e.charCodeAt(0).toString(16)}) should result in "${t}"`)}),test("Modern vowels",()=>{const r=new Map([["\u1161","k"],["\u1162","o"],["\u1163","i"],["\u1164","O"],["\u1165","j"],["\u1166","p"],["\u1167","u"],["\u1168","P"],["\u1169","h"],["\u116A","hk"],["\u116B","ho"],["\u116C","hl"],["\u116D","y"],["\u116E","n"],["\u116F","nj"],["\u1170","np"],["\u1171","nl"],["\u1172","b"],["\u1173","m"],["\u1174","ml"],["\u1175","l"]]);for(const[e,t]of r.entries())s(o(e),t,`"${e}" (0x${e.charCodeAt(0).toString(16)}) should result in "${t}"`)}),test("Compatibility Jamo",()=>{const r=new Map([["\u3131","r"],["\u3132","R"],["\u3133","rt"],["\u3134","s"],["\u3135","sw"],["\u3136","sg"],["\u3137","e"],["\u3138","E"],["\u3139","f"],["\u313A","fr"],["\u313B","fa"],["\u313C","fq"],["\u313D","ft"],["\u313E","fx"],["\u313F","fv"],["\u3140","fg"],["\u3141","a"],["\u3142","q"],["\u3143","Q"],["\u3144","qt"],["\u3145","t"],["\u3146","T"],["\u3147","d"],["\u3148","w"],["\u3149","W"],["\u314A","c"],["\u314B","z"],["\u314C","x"],["\u314D","v"],["\u314E","g"],["\u314F","k"],["\u3150","o"],["\u3151","i"],["\u3152","O"],["\u3153","j"],["\u3154","p"],["\u3155","u"],["\u3156","P"],["\u3157","h"],["\u3158","hk"],["\u3159","ho"],["\u315A","hl"],["\u315B","y"],["\u315C","n"],["\u315D","nj"],["\u315E","np"],["\u315F","nl"],["\u3160","b"],["\u3161","m"],["\u3162","ml"],["\u3163","l"]]);for(const[e,t]of r.entries())s(o(e),t,`"${e}" (0x${e.charCodeAt(0).toString(16)}) should result in "${t}"`)}),test("Composed samples",()=>{const r=new Map([["\u3141\u314A\u314A\u3137\u3134\uB0D0\u3160\u3151\u3163\u3151\uC1FC","accessibility"],["\u3141\u314A\uCC44\u3155\u315C\u3145\uB69C\uC0E4\uC2DC\uB4DC\uB463\u3134","accountEntitlements"],["\uBA70\uC57C\u3150\uCCD7\u3134","audioCues"],["\u3160\u3131\u3141\uCC2F\uC170\uBA01\uCC44\u3163\u3150\uAC50\u3137\u31312\u3146\uB514\uB4E3\u3145\uAD50","bracketPairColorizer2Telemetry"],["\u3160\u3155\u3163\u314F\u3138\uC58F","bulkEdit"],["\u314A\uBBF8\u3163\u3157\u3151\u3137\u3131\u3141\u3131\uCD08\u315B","callHierarchy"],["\uCD18\u3145","chat"],["\uCC59\u3137\u3141\u314A\uC0E4\u3150\u315C\u3134","codeActions"],["\uCC59\u3137\u3138\uC57C\uC0C9","codeEditor"],["\uCC44\u3161\u3161\uBB49\u3134","commands"],["\uCC44\u3161\u3161\uB463\u3134","comments"],["\uCC44\u315C\uB7CF\u3138\uD14C\u3150\u3133\u3137\u3131","configExporter"],["\uCC44\u315C\u3145\u3137\u314C\uC2A4\uB450\u3155","contextmenu"],["\uCCD4\uC0C8\u3161\u3138\uC57C\uC0C9","customEditor"],["\u3147\uB4C0\u3155\u314E","debug"],["\u3147\uB371\u3137\u314A\u3141\u3145\u3137\u3147\u3138\u314C\u3145\uB450\uB0D0\u3150\u315C\u3161\u3151\u314E\u3131\u3141\uC0C9","deprecatedExtensionMigrator"],["\u3137\uC58F\u3134\u3137\u3134\uB0D0\u3150\u315C\u3134","editSessions"],["\uB4DC\u3161\u3137\u3145","emmet"],["\u3137\u314C\u3145\uB450\uB0D0\u3150\u315C\u3134","extensions"],["\u3137\u314C\u3145\u3137\uAD6C\uBC0C\u3137\uADF8\u3151\u315C\uBBF8","externalTerminal"],["\u3137\u314C\u3145\u3137\uAD6C\uBBF8\u3155\uAC38\u3152\u3154\uB457\u3131","externalUriOpener"],["\uB7B4\u3163\u3137\u3134","files"],["\uB798\u3163\uC57C\u315C\u314E","folding"],["\uB798\uAE08\u3145","format"],["\u3151\u315F\uBB18\u3157\u3151\u315C\u3145\u3134","inlayHints"],["\u3151\u315F\u3151\u315C\u3137\uCD18\u3145","inlineChat"],["\u3151\u315C\u3145\u3137\u3131\u3141\u314A\uC0FE\u3137","interactive"],["\u3151\u3134\uB147","issue"],["\u314F\uB434\u3160\u3151\u315C\uC57C\u315C\u314E\u3134","keybindings"],["\u3163\uBB34\uD610\u314E\u3137\u3147\u3137\u3145\u3137\u314A\uC0E4\u3150\u315C","languageDetection"],["\u3163\uBB34\uD610\u314E\u3137\u3134\u3145\u3141\uC158","languageStatus"],["\u3163\u3151\u3161\u3151\uC0E4\u315C\uC593\u3141\uC0C9","limitIndicator"],["\u3163\u3151\u3134\u3145","list"],["\u3163\u3150\u314A\uBBF8\u3157\u3151\u3134\uC0C8\uAD50","localHistory"],["\u3163\u3150\u314A\uBBF8\u3151\u314B\u3141\uC0E4\u3150\u315C","localization"],["\u3163\u3150\u314E\u3134","logs"],["\u3161\uBA54\u3154\u3137\u3147\u3138\uC58F\u3134","mappedEdits"],["\u3161\u3141\uAC00\uC560\uC8FC","markdown"],["\u3161\u3141\uAC07\u3131\u3134","markers"],["\u3161\u3137\u3131\u314E\u3137\u3138\uC57C\uC0C9","mergeEditor"],["\u3161\u3155\u3163\uC0E4\uC584\u3139\u3138\uC57C\uC0C9","multiDiffEditor"],["\u315C\u3150\u3145\uB4C0\u3150\u3150\u314F","notebook"],["\u3150\u3155\uC2DC\u3151\u315C\u3137","outline"],["\u3150\u3155\uC138\u3155\u3145","output"],["\u3154\u3137\u3131\uB798\uADF8\uBB4B\u3137","performance"],["\u3154\u3131\u3137\u3139\u3137\u3131\uB467\u3137\u3134","preferences"],["\uBCBC\u3151\uCC38\u314A\u314A\u3137\u3134\u3134","quickaccess"],["\u3131\uB514\uBA70\u315C\uCD0F\u3131","relauncher"],["\u3131\uB4DC\u3150\u3145\u3137","remote"],["\u3131\uB4DC\u3150\u3145\u3137\uC3A0\u315C\u315C\uB514","remoteTunnel"],["\u3134\u3141\uB178","sash"],["\u3134\uCE20","scm"],["\u3134\u3137\u3141\u3131\uCD08","search"],["\u3134\u3137\u3141\u3131\uCD08\u3138\uC57C\uC0C9","searchEditor"],["\uB188\u3131\u3137","share"],["\uB204\u3151\u3154\u3154\u3137\u3145\u3134","snippets"],["\uB12B\u3137\uCD08","speech"],["\uB124\u3163\u3141\uB178","splash"],["\uB141\u314D\uB438","surveys"],["\u3145\u3141\u314E\u3134","tags"],["\u3145\u3141\uB09C","tasks"],["\u3145\uB514\uB4E3\u3145\uAD50","telemetry"],["\u3145\u3137\uADF8\u3151\u315C\uBBF8","terminal"],["\u3145\u3137\uADF8\u3151\u315C\uBBF8\uCC44\u315C\u3145\uAC38\u3160","terminalContrib"],["\u3145\u3137\u3134\uC0E4\u315C\u314E","testing"],["\uC18C\uB4E3\u3134","themes"],["\uC0E4\u3161\uB514\u3151\u315C\u3137","timeline"],["\uC1FC\u3154\uB3C4\u3151\u3137\u3131\u3141\u3131\uCD08\u315B","typeHierarchy"],["\u3155\u3154\u3147\u3141\u3145\u3137","update"],["\u3155\uAE30","url"],["\u3155\u3134\u3137\u3131\u3147\u3141\u3145\uBA8C\uAC1C\uB7B4\u3163\u3137","userDataProfile"],["\u3155\u3134\u3137\u3131\u3147\u3141\u3145\u3141\uB1E8\u315C\u314A","userDataSync"],["\u3148\uB4C0\uD34B\u3148","webview"],["\u3148\uB4C0\uD34B\uC854\uBB34\uB514","webviewPanel"],["\u3148\uB4C0\uD34B\u3148\uD34B\u3148","webviewView"],["\u3148\uB514\uCC44\u3161\uB4C0\uBB34\u315C\u3137\u3131","welcomeBanner"],["\u3148\uB514\uCC44\u3161\u3137\uC57C\uBBF8\u3150\u314E","welcomeDialog"],["\u3148\uB514\uCC44\u3161\u3137\u314E\u3137\u3145\uC0E4\u315C\u314E\u3134\u3145\u3141\u3133\u3137\u3147","welcomeGettingStarted"],["\u3148\uB514\uCC44\u3161\u3137\uD34B\u3148\u3134","welcomeViews"],["\u3148\uB514\uCC44\u3161\u3137\u3149\uBBF8\u314F\uC18C\uAC1C\u3155\uD638","welcomeWalkthrough"],["\uC7AC\uAC00\uB134\u314A\u3137","workspace"],["\uC7AC\uAC00\uB134\u314A\u3137\u3134","workspaces"]]);for(const[e,t]of r.entries())s(o(e).toLowerCase(),t.toLowerCase(),`"${e}" (0x${e.charCodeAt(0).toString(16)}) should result in "${t}"`)})})});