var i=(_=>(_[_.Null=0]="Null",_[_.Backspace=8]="Backspace",_[_.Tab=9]="Tab",_[_.LineFeed=10]="LineFeed",_[_.CarriageReturn=13]="CarriageReturn",_[_.Space=32]="Space",_[_.ExclamationMark=33]="ExclamationMark",_[_.DoubleQuote=34]="DoubleQuote",_[_.Hash=35]="Hash",_[_.DollarSign=36]="DollarSign",_[_.PercentSign=37]="PercentSign",_[_.Ampersand=38]="Ampersand",_[_.SingleQuote=39]="SingleQuote",_[_.OpenParen=40]="OpenParen",_[_.CloseParen=41]="CloseParen",_[_.Asterisk=42]="Asterisk",_[_.Plus=43]="Plus",_[_.Comma=44]="Comma",_[_.Dash=45]="Dash",_[_.Period=46]="Period",_[_.Slash=47]="Slash",_[_.Digit0=48]="Digit0",_[_.Digit1=49]="Digit1",_[_.Digit2=50]="Digit2",_[_.Digit3=51]="Digit3",_[_.Digit4=52]="Digit4",_[_.Digit5=53]="Digit5",_[_.Digit6=54]="Digit6",_[_.Digit7=55]="Digit7",_[_.Digit8=56]="Digit8",_[_.Digit9=57]="Digit9",_[_.Colon=58]="Colon",_[_.Semicolon=59]="Semicolon",_[_.LessThan=60]="LessThan",_[_.Equals=61]="Equals",_[_.GreaterThan=62]="GreaterThan",_[_.QuestionMark=63]="QuestionMark",_[_.AtSign=64]="AtSign",_[_.A=65]="A",_[_.B=66]="B",_[_.C=67]="C",_[_.D=68]="D",_[_.E=69]="E",_[_.F=70]="F",_[_.G=71]="G",_[_.H=72]="H",_[_.I=73]="I",_[_.J=74]="J",_[_.K=75]="K",_[_.L=76]="L",_[_.M=77]="M",_[_.N=78]="N",_[_.O=79]="O",_[_.P=80]="P",_[_.Q=81]="Q",_[_.R=82]="R",_[_.S=83]="S",_[_.T=84]="T",_[_.U=85]="U",_[_.V=86]="V",_[_.W=87]="W",_[_.X=88]="X",_[_.Y=89]="Y",_[_.Z=90]="Z",_[_.OpenSquareBracket=91]="OpenSquareBracket",_[_.Backslash=92]="Backslash",_[_.CloseSquareBracket=93]="CloseSquareBracket",_[_.Caret=94]="Caret",_[_.Underline=95]="Underline",_[_.BackTick=96]="BackTick",_[_.a=97]="a",_[_.b=98]="b",_[_.c=99]="c",_[_.d=100]="d",_[_.e=101]="e",_[_.f=102]="f",_[_.g=103]="g",_[_.h=104]="h",_[_.i=105]="i",_[_.j=106]="j",_[_.k=107]="k",_[_.l=108]="l",_[_.m=109]="m",_[_.n=110]="n",_[_.o=111]="o",_[_.p=112]="p",_[_.q=113]="q",_[_.r=114]="r",_[_.s=115]="s",_[_.t=116]="t",_[_.u=117]="u",_[_.v=118]="v",_[_.w=119]="w",_[_.x=120]="x",_[_.y=121]="y",_[_.z=122]="z",_[_.OpenCurlyBrace=123]="OpenCurlyBrace",_[_.Pipe=124]="Pipe",_[_.CloseCurlyBrace=125]="CloseCurlyBrace",_[_.Tilde=126]="Tilde",_[_.NoBreakSpace=160]="NoBreakSpace",_[_.U_Combining_Grave_Accent=768]="U_Combining_Grave_Accent",_[_.U_Combining_Acute_Accent=769]="U_Combining_Acute_Accent",_[_.U_Combining_Circumflex_Accent=770]="U_Combining_Circumflex_Accent",_[_.U_Combining_Tilde=771]="U_Combining_Tilde",_[_.U_Combining_Macron=772]="U_Combining_Macron",_[_.U_Combining_Overline=773]="U_Combining_Overline",_[_.U_Combining_Breve=774]="U_Combining_Breve",_[_.U_Combining_Dot_Above=775]="U_Combining_Dot_Above",_[_.U_Combining_Diaeresis=776]="U_Combining_Diaeresis",_[_.U_Combining_Hook_Above=777]="U_Combining_Hook_Above",_[_.U_Combining_Ring_Above=778]="U_Combining_Ring_Above",_[_.U_Combining_Double_Acute_Accent=779]="U_Combining_Double_Acute_Accent",_[_.U_Combining_Caron=780]="U_Combining_Caron",_[_.U_Combining_Vertical_Line_Above=781]="U_Combining_Vertical_Line_Above",_[_.U_Combining_Double_Vertical_Line_Above=782]="U_Combining_Double_Vertical_Line_Above",_[_.U_Combining_Double_Grave_Accent=783]="U_Combining_Double_Grave_Accent",_[_.U_Combining_Candrabindu=784]="U_Combining_Candrabindu",_[_.U_Combining_Inverted_Breve=785]="U_Combining_Inverted_Breve",_[_.U_Combining_Turned_Comma_Above=786]="U_Combining_Turned_Comma_Above",_[_.U_Combining_Comma_Above=787]="U_Combining_Comma_Above",_[_.U_Combining_Reversed_Comma_Above=788]="U_Combining_Reversed_Comma_Above",_[_.U_Combining_Comma_Above_Right=789]="U_Combining_Comma_Above_Right",_[_.U_Combining_Grave_Accent_Below=790]="U_Combining_Grave_Accent_Below",_[_.U_Combining_Acute_Accent_Below=791]="U_Combining_Acute_Accent_Below",_[_.U_Combining_Left_Tack_Below=792]="U_Combining_Left_Tack_Below",_[_.U_Combining_Right_Tack_Below=793]="U_Combining_Right_Tack_Below",_[_.U_Combining_Left_Angle_Above=794]="U_Combining_Left_Angle_Above",_[_.U_Combining_Horn=795]="U_Combining_Horn",_[_.U_Combining_Left_Half_Ring_Below=796]="U_Combining_Left_Half_Ring_Below",_[_.U_Combining_Up_Tack_Below=797]="U_Combining_Up_Tack_Below",_[_.U_Combining_Down_Tack_Below=798]="U_Combining_Down_Tack_Below",_[_.U_Combining_Plus_Sign_Below=799]="U_Combining_Plus_Sign_Below",_[_.U_Combining_Minus_Sign_Below=800]="U_Combining_Minus_Sign_Below",_[_.U_Combining_Palatalized_Hook_Below=801]="U_Combining_Palatalized_Hook_Below",_[_.U_Combining_Retroflex_Hook_Below=802]="U_Combining_Retroflex_Hook_Below",_[_.U_Combining_Dot_Below=803]="U_Combining_Dot_Below",_[_.U_Combining_Diaeresis_Below=804]="U_Combining_Diaeresis_Below",_[_.U_Combining_Ring_Below=805]="U_Combining_Ring_Below",_[_.U_Combining_Comma_Below=806]="U_Combining_Comma_Below",_[_.U_Combining_Cedilla=807]="U_Combining_Cedilla",_[_.U_Combining_Ogonek=808]="U_Combining_Ogonek",_[_.U_Combining_Vertical_Line_Below=809]="U_Combining_Vertical_Line_Below",_[_.U_Combining_Bridge_Below=810]="U_Combining_Bridge_Below",_[_.U_Combining_Inverted_Double_Arch_Below=811]="U_Combining_Inverted_Double_Arch_Below",_[_.U_Combining_Caron_Below=812]="U_Combining_Caron_Below",_[_.U_Combining_Circumflex_Accent_Below=813]="U_Combining_Circumflex_Accent_Below",_[_.U_Combining_Breve_Below=814]="U_Combining_Breve_Below",_[_.U_Combining_Inverted_Breve_Below=815]="U_Combining_Inverted_Breve_Below",_[_.U_Combining_Tilde_Below=816]="U_Combining_Tilde_Below",_[_.U_Combining_Macron_Below=817]="U_Combining_Macron_Below",_[_.U_Combining_Low_Line=818]="U_Combining_Low_Line",_[_.U_Combining_Double_Low_Line=819]="U_Combining_Double_Low_Line",_[_.U_Combining_Tilde_Overlay=820]="U_Combining_Tilde_Overlay",_[_.U_Combining_Short_Stroke_Overlay=821]="U_Combining_Short_Stroke_Overlay",_[_.U_Combining_Long_Stroke_Overlay=822]="U_Combining_Long_Stroke_Overlay",_[_.U_Combining_Short_Solidus_Overlay=823]="U_Combining_Short_Solidus_Overlay",_[_.U_Combining_Long_Solidus_Overlay=824]="U_Combining_Long_Solidus_Overlay",_[_.U_Combining_Right_Half_Ring_Below=825]="U_Combining_Right_Half_Ring_Below",_[_.U_Combining_Inverted_Bridge_Below=826]="U_Combining_Inverted_Bridge_Below",_[_.U_Combining_Square_Below=827]="U_Combining_Square_Below",_[_.U_Combining_Seagull_Below=828]="U_Combining_Seagull_Below",_[_.U_Combining_X_Above=829]="U_Combining_X_Above",_[_.U_Combining_Vertical_Tilde=830]="U_Combining_Vertical_Tilde",_[_.U_Combining_Double_Overline=831]="U_Combining_Double_Overline",_[_.U_Combining_Grave_Tone_Mark=832]="U_Combining_Grave_Tone_Mark",_[_.U_Combining_Acute_Tone_Mark=833]="U_Combining_Acute_Tone_Mark",_[_.U_Combining_Greek_Perispomeni=834]="U_Combining_Greek_Perispomeni",_[_.U_Combining_Greek_Koronis=835]="U_Combining_Greek_Koronis",_[_.U_Combining_Greek_Dialytika_Tonos=836]="U_Combining_Greek_Dialytika_Tonos",_[_.U_Combining_Greek_Ypogegrammeni=837]="U_Combining_Greek_Ypogegrammeni",_[_.U_Combining_Bridge_Above=838]="U_Combining_Bridge_Above",_[_.U_Combining_Equals_Sign_Below=839]="U_Combining_Equals_Sign_Below",_[_.U_Combining_Double_Vertical_Line_Below=840]="U_Combining_Double_Vertical_Line_Below",_[_.U_Combining_Left_Angle_Below=841]="U_Combining_Left_Angle_Below",_[_.U_Combining_Not_Tilde_Above=842]="U_Combining_Not_Tilde_Above",_[_.U_Combining_Homothetic_Above=843]="U_Combining_Homothetic_Above",_[_.U_Combining_Almost_Equal_To_Above=844]="U_Combining_Almost_Equal_To_Above",_[_.U_Combining_Left_Right_Arrow_Below=845]="U_Combining_Left_Right_Arrow_Below",_[_.U_Combining_Upwards_Arrow_Below=846]="U_Combining_Upwards_Arrow_Below",_[_.U_Combining_Grapheme_Joiner=847]="U_Combining_Grapheme_Joiner",_[_.U_Combining_Right_Arrowhead_Above=848]="U_Combining_Right_Arrowhead_Above",_[_.U_Combining_Left_Half_Ring_Above=849]="U_Combining_Left_Half_Ring_Above",_[_.U_Combining_Fermata=850]="U_Combining_Fermata",_[_.U_Combining_X_Below=851]="U_Combining_X_Below",_[_.U_Combining_Left_Arrowhead_Below=852]="U_Combining_Left_Arrowhead_Below",_[_.U_Combining_Right_Arrowhead_Below=853]="U_Combining_Right_Arrowhead_Below",_[_.U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below=854]="U_Combining_Right_Arrowhead_And_Up_Arrowhead_Below",_[_.U_Combining_Right_Half_Ring_Above=855]="U_Combining_Right_Half_Ring_Above",_[_.U_Combining_Dot_Above_Right=856]="U_Combining_Dot_Above_Right",_[_.U_Combining_Asterisk_Below=857]="U_Combining_Asterisk_Below",_[_.U_Combining_Double_Ring_Below=858]="U_Combining_Double_Ring_Below",_[_.U_Combining_Zigzag_Above=859]="U_Combining_Zigzag_Above",_[_.U_Combining_Double_Breve_Below=860]="U_Combining_Double_Breve_Below",_[_.U_Combining_Double_Breve=861]="U_Combining_Double_Breve",_[_.U_Combining_Double_Macron=862]="U_Combining_Double_Macron",_[_.U_Combining_Double_Macron_Below=863]="U_Combining_Double_Macron_Below",_[_.U_Combining_Double_Tilde=864]="U_Combining_Double_Tilde",_[_.U_Combining_Double_Inverted_Breve=865]="U_Combining_Double_Inverted_Breve",_[_.U_Combining_Double_Rightwards_Arrow_Below=866]="U_Combining_Double_Rightwards_Arrow_Below",_[_.U_Combining_Latin_Small_Letter_A=867]="U_Combining_Latin_Small_Letter_A",_[_.U_Combining_Latin_Small_Letter_E=868]="U_Combining_Latin_Small_Letter_E",_[_.U_Combining_Latin_Small_Letter_I=869]="U_Combining_Latin_Small_Letter_I",_[_.U_Combining_Latin_Small_Letter_O=870]="U_Combining_Latin_Small_Letter_O",_[_.U_Combining_Latin_Small_Letter_U=871]="U_Combining_Latin_Small_Letter_U",_[_.U_Combining_Latin_Small_Letter_C=872]="U_Combining_Latin_Small_Letter_C",_[_.U_Combining_Latin_Small_Letter_D=873]="U_Combining_Latin_Small_Letter_D",_[_.U_Combining_Latin_Small_Letter_H=874]="U_Combining_Latin_Small_Letter_H",_[_.U_Combining_Latin_Small_Letter_M=875]="U_Combining_Latin_Small_Letter_M",_[_.U_Combining_Latin_Small_Letter_R=876]="U_Combining_Latin_Small_Letter_R",_[_.U_Combining_Latin_Small_Letter_T=877]="U_Combining_Latin_Small_Letter_T",_[_.U_Combining_Latin_Small_Letter_V=878]="U_Combining_Latin_Small_Letter_V",_[_.U_Combining_Latin_Small_Letter_X=879]="U_Combining_Latin_Small_Letter_X",_[_.LINE_SEPARATOR=8232]="LINE_SEPARATOR",_[_.PARAGRAPH_SEPARATOR=8233]="PARAGRAPH_SEPARATOR",_[_.NEXT_LINE=133]="NEXT_LINE",_[_.U_CIRCUMFLEX=94]="U_CIRCUMFLEX",_[_.U_GRAVE_ACCENT=96]="U_GRAVE_ACCENT",_[_.U_DIAERESIS=168]="U_DIAERESIS",_[_.U_MACRON=175]="U_MACRON",_[_.U_ACUTE_ACCENT=180]="U_ACUTE_ACCENT",_[_.U_CEDILLA=184]="U_CEDILLA",_[_.U_MODIFIER_LETTER_LEFT_ARROWHEAD=706]="U_MODIFIER_LETTER_LEFT_ARROWHEAD",_[_.U_MODIFIER_LETTER_RIGHT_ARROWHEAD=707]="U_MODIFIER_LETTER_RIGHT_ARROWHEAD",_[_.U_MODIFIER_LETTER_UP_ARROWHEAD=708]="U_MODIFIER_LETTER_UP_ARROWHEAD",_[_.U_MODIFIER_LETTER_DOWN_ARROWHEAD=709]="U_MODIFIER_LETTER_DOWN_ARROWHEAD",_[_.U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING=722]="U_MODIFIER_LETTER_CENTRED_RIGHT_HALF_RING",_[_.U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING=723]="U_MODIFIER_LETTER_CENTRED_LEFT_HALF_RING",_[_.U_MODIFIER_LETTER_UP_TACK=724]="U_MODIFIER_LETTER_UP_TACK",_[_.U_MODIFIER_LETTER_DOWN_TACK=725]="U_MODIFIER_LETTER_DOWN_TACK",_[_.U_MODIFIER_LETTER_PLUS_SIGN=726]="U_MODIFIER_LETTER_PLUS_SIGN",_[_.U_MODIFIER_LETTER_MINUS_SIGN=727]="U_MODIFIER_LETTER_MINUS_SIGN",_[_.U_BREVE=728]="U_BREVE",_[_.U_DOT_ABOVE=729]="U_DOT_ABOVE",_[_.U_RING_ABOVE=730]="U_RING_ABOVE",_[_.U_OGONEK=731]="U_OGONEK",_[_.U_SMALL_TILDE=732]="U_SMALL_TILDE",_[_.U_DOUBLE_ACUTE_ACCENT=733]="U_DOUBLE_ACUTE_ACCENT",_[_.U_MODIFIER_LETTER_RHOTIC_HOOK=734]="U_MODIFIER_LETTER_RHOTIC_HOOK",_[_.U_MODIFIER_LETTER_CROSS_ACCENT=735]="U_MODIFIER_LETTER_CROSS_ACCENT",_[_.U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR=741]="U_MODIFIER_LETTER_EXTRA_HIGH_TONE_BAR",_[_.U_MODIFIER_LETTER_HIGH_TONE_BAR=742]="U_MODIFIER_LETTER_HIGH_TONE_BAR",_[_.U_MODIFIER_LETTER_MID_TONE_BAR=743]="U_MODIFIER_LETTER_MID_TONE_BAR",_[_.U_MODIFIER_LETTER_LOW_TONE_BAR=744]="U_MODIFIER_LETTER_LOW_TONE_BAR",_[_.U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR=745]="U_MODIFIER_LETTER_EXTRA_LOW_TONE_BAR",_[_.U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK=746]="U_MODIFIER_LETTER_YIN_DEPARTING_TONE_MARK",_[_.U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK=747]="U_MODIFIER_LETTER_YANG_DEPARTING_TONE_MARK",_[_.U_MODIFIER_LETTER_UNASPIRATED=749]="U_MODIFIER_LETTER_UNASPIRATED",_[_.U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD=751]="U_MODIFIER_LETTER_LOW_DOWN_ARROWHEAD",_[_.U_MODIFIER_LETTER_LOW_UP_ARROWHEAD=752]="U_MODIFIER_LETTER_LOW_UP_ARROWHEAD",_[_.U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD=753]="U_MODIFIER_LETTER_LOW_LEFT_ARROWHEAD",_[_.U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD=754]="U_MODIFIER_LETTER_LOW_RIGHT_ARROWHEAD",_[_.U_MODIFIER_LETTER_LOW_RING=755]="U_MODIFIER_LETTER_LOW_RING",_[_.U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT=756]="U_MODIFIER_LETTER_MIDDLE_GRAVE_ACCENT",_[_.U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT=757]="U_MODIFIER_LETTER_MIDDLE_DOUBLE_GRAVE_ACCENT",_[_.U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT=758]="U_MODIFIER_LETTER_MIDDLE_DOUBLE_ACUTE_ACCENT",_[_.U_MODIFIER_LETTER_LOW_TILDE=759]="U_MODIFIER_LETTER_LOW_TILDE",_[_.U_MODIFIER_LETTER_RAISED_COLON=760]="U_MODIFIER_LETTER_RAISED_COLON",_[_.U_MODIFIER_LETTER_BEGIN_HIGH_TONE=761]="U_MODIFIER_LETTER_BEGIN_HIGH_TONE",_[_.U_MODIFIER_LETTER_END_HIGH_TONE=762]="U_MODIFIER_LETTER_END_HIGH_TONE",_[_.U_MODIFIER_LETTER_BEGIN_LOW_TONE=763]="U_MODIFIER_LETTER_BEGIN_LOW_TONE",_[_.U_MODIFIER_LETTER_END_LOW_TONE=764]="U_MODIFIER_LETTER_END_LOW_TONE",_[_.U_MODIFIER_LETTER_SHELF=765]="U_MODIFIER_LETTER_SHELF",_[_.U_MODIFIER_LETTER_OPEN_SHELF=766]="U_MODIFIER_LETTER_OPEN_SHELF",_[_.U_MODIFIER_LETTER_LOW_LEFT_ARROW=767]="U_MODIFIER_LETTER_LOW_LEFT_ARROW",_[_.U_GREEK_LOWER_NUMERAL_SIGN=885]="U_GREEK_LOWER_NUMERAL_SIGN",_[_.U_GREEK_TONOS=900]="U_GREEK_TONOS",_[_.U_GREEK_DIALYTIKA_TONOS=901]="U_GREEK_DIALYTIKA_TONOS",_[_.U_GREEK_KORONIS=8125]="U_GREEK_KORONIS",_[_.U_GREEK_PSILI=8127]="U_GREEK_PSILI",_[_.U_GREEK_PERISPOMENI=8128]="U_GREEK_PERISPOMENI",_[_.U_GREEK_DIALYTIKA_AND_PERISPOMENI=8129]="U_GREEK_DIALYTIKA_AND_PERISPOMENI",_[_.U_GREEK_PSILI_AND_VARIA=8141]="U_GREEK_PSILI_AND_VARIA",_[_.U_GREEK_PSILI_AND_OXIA=8142]="U_GREEK_PSILI_AND_OXIA",_[_.U_GREEK_PSILI_AND_PERISPOMENI=8143]="U_GREEK_PSILI_AND_PERISPOMENI",_[_.U_GREEK_DASIA_AND_VARIA=8157]="U_GREEK_DASIA_AND_VARIA",_[_.U_GREEK_DASIA_AND_OXIA=8158]="U_GREEK_DASIA_AND_OXIA",_[_.U_GREEK_DASIA_AND_PERISPOMENI=8159]="U_GREEK_DASIA_AND_PERISPOMENI",_[_.U_GREEK_DIALYTIKA_AND_VARIA=8173]="U_GREEK_DIALYTIKA_AND_VARIA",_[_.U_GREEK_DIALYTIKA_AND_OXIA=8174]="U_GREEK_DIALYTIKA_AND_OXIA",_[_.U_GREEK_VARIA=8175]="U_GREEK_VARIA",_[_.U_GREEK_OXIA=8189]="U_GREEK_OXIA",_[_.U_GREEK_DASIA=8190]="U_GREEK_DASIA",_[_.U_IDEOGRAPHIC_FULL_STOP=12290]="U_IDEOGRAPHIC_FULL_STOP",_[_.U_LEFT_CORNER_BRACKET=12300]="U_LEFT_CORNER_BRACKET",_[_.U_RIGHT_CORNER_BRACKET=12301]="U_RIGHT_CORNER_BRACKET",_[_.U_LEFT_BLACK_LENTICULAR_BRACKET=12304]="U_LEFT_BLACK_LENTICULAR_BRACKET",_[_.U_RIGHT_BLACK_LENTICULAR_BRACKET=12305]="U_RIGHT_BLACK_LENTICULAR_BRACKET",_[_.U_OVERLINE=8254]="U_OVERLINE",_[_.UTF8_BOM=65279]="UTF8_BOM",_[_.U_FULLWIDTH_SEMICOLON=65307]="U_FULLWIDTH_SEMICOLON",_[_.U_FULLWIDTH_COMMA=65292]="U_FULLWIDTH_COMMA",_))(i||{});export{i as CharCode};
