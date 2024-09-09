import{IndentAction as e}from"../../../../common/languages/languageConfiguration.js";const n=[{beforeText:/^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,afterText:/^\s*\*\/$/,action:{indentAction:e.IndentOutdent,appendText:" * "}},{beforeText:/^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,action:{indentAction:e.None,appendText:" * "}},{beforeText:/^(\t|[ ])*[ ]\*([ ]([^\*]|\*(?!\/))*)?$/,previousLineText:/(?=^(\s*(\/\*\*|\*)).*)(?=(?!(\s*\*\/)))/,action:{indentAction:e.None,appendText:"* "}},{beforeText:/^(\t|[ ])*[ ]\*\/\s*$/,action:{indentAction:e.None,removeText:1}},{beforeText:/^(\t|[ ])*[ ]\*[^/]*\*\/\s*$/,action:{indentAction:e.None,removeText:1}},{beforeText:/^\s*(\bcase\s.+:|\bdefault:)$/,afterText:/^(?!\s*(\bcase\b|\bdefault\b))/,action:{indentAction:e.Indent}},{previousLineText:/^\s*(((else ?)?if|for|while)\s*\(.*\)\s*|else\s*)$/,beforeText:/^\s+([^{i\s]|i(?!f\b))/,action:{indentAction:e.Outdent}},{beforeText:/^.*\([^\)]*$/,afterText:/^\s*\).*$/,action:{indentAction:e.IndentOutdent,appendText:"	"}},{beforeText:/^.*\{[^\}]*$/,afterText:/^\s*\}.*$/,action:{indentAction:e.IndentOutdent,appendText:"	"}},{beforeText:/^.*\[[^\]]*$/,afterText:/^\s*\].*$/,action:{indentAction:e.IndentOutdent,appendText:"	"}}],i=[{beforeText:/^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,afterText:/^\s*\*\/$/,action:{indentAction:e.IndentOutdent,appendText:" * "}},{beforeText:/^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,action:{indentAction:e.None,appendText:" * "}},{beforeText:/^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,action:{indentAction:e.None,appendText:"* "}},{beforeText:/^(\t|(\ \ ))*\ \*\/\s*$/,action:{indentAction:e.None,removeText:1}},{beforeText:/^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,action:{indentAction:e.None,removeText:1}},{beforeText:/^\s+([^{i\s]|i(?!f\b))/,previousLineText:/^\s*(((else ?)?if|for(each)?|while)\s*\(.*\)\s*|else\s*)$/,action:{indentAction:e.Outdent}}],o=[{previousLineText:/^\s*(((else ?)?if|for|while)\s*\(.*\)\s*|else\s*)$/,beforeText:/^\s+([^{i\s]|i(?!f\b))/,action:{indentAction:e.Outdent}}],r=[{beforeText:/<(?!(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr))([_:\w][_:\w\-.\d]*)(?:(?:[^'"/>]|"[^"]*"|'[^']*')*?(?!\/)>)[^<]*$/i,afterText:/^<\/([_:\w][_:\w\-.\d]*)\s*>/i,action:{indentAction:e.IndentOutdent}},{beforeText:/<(?!(?:area|base|br|col|embed|hr|img|input|keygen|link|menuitem|meta|param|source|track|wbr))([_:\w][_:\w\-.\d]*)(?:(?:[^'"/>]|"[^"]*"|'[^']*')*?(?!\/)>)[^<]*$/i,action:{indentAction:e.Indent}}];export{o as cppOnEnterRules,r as htmlOnEnterRules,n as javascriptOnEnterRules,i as phpOnEnterRules};
