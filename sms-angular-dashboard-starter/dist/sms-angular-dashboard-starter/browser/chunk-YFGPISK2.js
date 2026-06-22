import{a as Mt}from"./chunk-OSP4J273.js";import{a as Ut}from"./chunk-GODDY7X5.js";import{b as Vt}from"./chunk-FXWWUJWZ.js";import{g as Gt,p as Yt}from"./chunk-6Q2KHROM.js";import{N as V,T as Nt,U as Rt,V as wt,W as $t,X as Pt,Y as Bt,Z as Ft,_ as w}from"./chunk-J3M6WMYZ.js";import{b as p,d as m}from"./chunk-7ZZKAWUS.js";import{g as Ot}from"./chunk-XCHY7BTY.js";var vt=(function(){var t=p(function(Y,l,u,o){for(u=u||{},o=Y.length;o--;u[Y[o]]=l);return u},"o"),a=[1,2],k=[1,3],e=[1,4],r=[2,4],d=[1,9],i=[1,11],h=[1,16],n=[1,17],b=[1,18],v=[1,19],g=[1,33],T=[1,20],_=[1,21],f=[1,22],L=[1,23],C=[1,24],$=[1,26],I=[1,27],P=[1,28],O=[1,29],J=[1,30],st=[1,31],rt=[1,32],it=[1,35],at=[1,36],nt=[1,37],ot=[1,38],j=[1,34],S=[1,4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],lt=[1,4,5,14,15,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,39,40,41,45,48,51,52,53,54,57],xt=[4,5,16,17,19,21,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],gt={trace:p(function(){},"trace"),yy:{},symbols_:{error:2,start:3,SPACE:4,NL:5,SD:6,document:7,line:8,statement:9,classDefStatement:10,styleStatement:11,cssClassStatement:12,idStatement:13,DESCR:14,"-->":15,HIDE_EMPTY:16,scale:17,WIDTH:18,COMPOSIT_STATE:19,STRUCT_START:20,STRUCT_STOP:21,STATE_DESCR:22,AS:23,ID:24,FORK:25,JOIN:26,CHOICE:27,CONCURRENT:28,note:29,notePosition:30,NOTE_TEXT:31,direction:32,acc_title:33,acc_title_value:34,acc_descr:35,acc_descr_value:36,acc_descr_multiline_value:37,CLICK:38,STRING:39,HREF:40,classDef:41,CLASSDEF_ID:42,CLASSDEF_STYLEOPTS:43,DEFAULT:44,style:45,STYLE_IDS:46,STYLEDEF_STYLEOPTS:47,class:48,CLASSENTITY_IDS:49,STYLECLASS:50,direction_tb:51,direction_bt:52,direction_rl:53,direction_lr:54,eol:55,";":56,EDGE_STATE:57,STYLE_SEPARATOR:58,left_of:59,right_of:60,$accept:0,$end:1},terminals_:{2:"error",4:"SPACE",5:"NL",6:"SD",14:"DESCR",15:"-->",16:"HIDE_EMPTY",17:"scale",18:"WIDTH",19:"COMPOSIT_STATE",20:"STRUCT_START",21:"STRUCT_STOP",22:"STATE_DESCR",23:"AS",24:"ID",25:"FORK",26:"JOIN",27:"CHOICE",28:"CONCURRENT",29:"note",31:"NOTE_TEXT",33:"acc_title",34:"acc_title_value",35:"acc_descr",36:"acc_descr_value",37:"acc_descr_multiline_value",38:"CLICK",39:"STRING",40:"HREF",41:"classDef",42:"CLASSDEF_ID",43:"CLASSDEF_STYLEOPTS",44:"DEFAULT",45:"style",46:"STYLE_IDS",47:"STYLEDEF_STYLEOPTS",48:"class",49:"CLASSENTITY_IDS",50:"STYLECLASS",51:"direction_tb",52:"direction_bt",53:"direction_rl",54:"direction_lr",56:";",57:"EDGE_STATE",58:"STYLE_SEPARATOR",59:"left_of",60:"right_of"},productions_:[0,[3,2],[3,2],[3,2],[7,0],[7,2],[8,2],[8,1],[8,1],[9,1],[9,1],[9,1],[9,1],[9,2],[9,3],[9,4],[9,1],[9,2],[9,1],[9,4],[9,3],[9,6],[9,1],[9,1],[9,1],[9,1],[9,4],[9,4],[9,1],[9,2],[9,2],[9,1],[9,5],[9,5],[10,3],[10,3],[11,3],[12,3],[32,1],[32,1],[32,1],[32,1],[55,1],[55,1],[13,1],[13,1],[13,3],[13,3],[30,1],[30,1]],performAction:p(function(l,u,o,y,E,s,H){var c=s.length-1;switch(E){case 3:return y.setRootDoc(s[c]),s[c];break;case 4:this.$=[];break;case 5:s[c]!="nl"&&(s[c-1].push(s[c]),this.$=s[c-1]);break;case 6:case 7:this.$=s[c];break;case 8:this.$="nl";break;case 12:this.$=s[c];break;case 13:let ht=s[c-1];ht.description=y.trimColon(s[c]),this.$=ht;break;case 14:this.$={stmt:"relation",state1:s[c-2],state2:s[c]};break;case 15:let ut=y.trimColon(s[c]);this.$={stmt:"relation",state1:s[c-3],state2:s[c-1],description:ut};break;case 19:this.$={stmt:"state",id:s[c-3],type:"default",description:"",doc:s[c-1]};break;case 20:var B=s[c],F=s[c-2].trim();if(s[c].match(":")){var q=s[c].split(":");B=q[0],F=[F,q[1]]}this.$={stmt:"state",id:B,type:"default",description:F};break;case 21:this.$={stmt:"state",id:s[c-3],type:"default",description:s[c-5],doc:s[c-1]};break;case 22:this.$={stmt:"state",id:s[c],type:"fork"};break;case 23:this.$={stmt:"state",id:s[c],type:"join"};break;case 24:this.$={stmt:"state",id:s[c],type:"choice"};break;case 25:this.$={stmt:"state",id:y.getDividerId(),type:"divider"};break;case 26:this.$={stmt:"state",id:s[c-1].trim(),note:{position:s[c-2].trim(),text:s[c].trim()}};break;case 29:this.$=s[c].trim(),y.setAccTitle(this.$);break;case 30:case 31:this.$=s[c].trim(),y.setAccDescription(this.$);break;case 32:this.$={stmt:"click",id:s[c-3],url:s[c-2],tooltip:s[c-1]};break;case 33:this.$={stmt:"click",id:s[c-3],url:s[c-1],tooltip:""};break;case 34:case 35:this.$={stmt:"classDef",id:s[c-1].trim(),classes:s[c].trim()};break;case 36:this.$={stmt:"style",id:s[c-1].trim(),styleClass:s[c].trim()};break;case 37:this.$={stmt:"applyClass",id:s[c-1].trim(),styleClass:s[c].trim()};break;case 38:y.setDirection("TB"),this.$={stmt:"dir",value:"TB"};break;case 39:y.setDirection("BT"),this.$={stmt:"dir",value:"BT"};break;case 40:y.setDirection("RL"),this.$={stmt:"dir",value:"RL"};break;case 41:y.setDirection("LR"),this.$={stmt:"dir",value:"LR"};break;case 44:case 45:this.$={stmt:"state",id:s[c].trim(),type:"default",description:""};break;case 46:this.$={stmt:"state",id:s[c-2].trim(),classes:[s[c].trim()],type:"default",description:""};break;case 47:this.$={stmt:"state",id:s[c-2].trim(),classes:[s[c].trim()],type:"default",description:""};break}},"anonymous"),table:[{3:1,4:a,5:k,6:e},{1:[3]},{3:5,4:a,5:k,6:e},{3:6,4:a,5:k,6:e},t([1,4,5,16,17,19,22,24,25,26,27,28,29,33,35,37,38,41,45,48,51,52,53,54,57],r,{7:7}),{1:[2,1]},{1:[2,2]},{1:[2,3],4:d,5:i,8:8,9:10,10:12,11:13,12:14,13:15,16:h,17:n,19:b,22:v,24:g,25:T,26:_,27:f,28:L,29:C,32:25,33:$,35:I,37:P,38:O,41:J,45:st,48:rt,51:it,52:at,53:nt,54:ot,57:j},t(S,[2,5]),{9:39,10:12,11:13,12:14,13:15,16:h,17:n,19:b,22:v,24:g,25:T,26:_,27:f,28:L,29:C,32:25,33:$,35:I,37:P,38:O,41:J,45:st,48:rt,51:it,52:at,53:nt,54:ot,57:j},t(S,[2,7]),t(S,[2,8]),t(S,[2,9]),t(S,[2,10]),t(S,[2,11]),t(S,[2,12],{14:[1,40],15:[1,41]}),t(S,[2,16]),{18:[1,42]},t(S,[2,18],{20:[1,43]}),{23:[1,44]},t(S,[2,22]),t(S,[2,23]),t(S,[2,24]),t(S,[2,25]),{30:45,31:[1,46],59:[1,47],60:[1,48]},t(S,[2,28]),{34:[1,49]},{36:[1,50]},t(S,[2,31]),{13:51,24:g,57:j},{42:[1,52],44:[1,53]},{46:[1,54]},{49:[1,55]},t(lt,[2,44],{58:[1,56]}),t(lt,[2,45],{58:[1,57]}),t(S,[2,38]),t(S,[2,39]),t(S,[2,40]),t(S,[2,41]),t(S,[2,6]),t(S,[2,13]),{13:58,24:g,57:j},t(S,[2,17]),t(xt,r,{7:59}),{24:[1,60]},{24:[1,61]},{23:[1,62]},{24:[2,48]},{24:[2,49]},t(S,[2,29]),t(S,[2,30]),{39:[1,63],40:[1,64]},{43:[1,65]},{43:[1,66]},{47:[1,67]},{50:[1,68]},{24:[1,69]},{24:[1,70]},t(S,[2,14],{14:[1,71]}),{4:d,5:i,8:8,9:10,10:12,11:13,12:14,13:15,16:h,17:n,19:b,21:[1,72],22:v,24:g,25:T,26:_,27:f,28:L,29:C,32:25,33:$,35:I,37:P,38:O,41:J,45:st,48:rt,51:it,52:at,53:nt,54:ot,57:j},t(S,[2,20],{20:[1,73]}),{31:[1,74]},{24:[1,75]},{39:[1,76]},{39:[1,77]},t(S,[2,34]),t(S,[2,35]),t(S,[2,36]),t(S,[2,37]),t(lt,[2,46]),t(lt,[2,47]),t(S,[2,15]),t(S,[2,19]),t(xt,r,{7:78}),t(S,[2,26]),t(S,[2,27]),{5:[1,79]},{5:[1,80]},{4:d,5:i,8:8,9:10,10:12,11:13,12:14,13:15,16:h,17:n,19:b,21:[1,81],22:v,24:g,25:T,26:_,27:f,28:L,29:C,32:25,33:$,35:I,37:P,38:O,41:J,45:st,48:rt,51:it,52:at,53:nt,54:ot,57:j},t(S,[2,32]),t(S,[2,33]),t(S,[2,21])],defaultActions:{5:[2,1],6:[2,2],47:[2,48],48:[2,49]},parseError:p(function(l,u){if(u.recoverable)this.trace(l);else{var o=new Error(l);throw o.hash=u,o}},"parseError"),parse:p(function(l){var u=this,o=[0],y=[],E=[null],s=[],H=this.table,c="",B=0,F=0,q=0,ht=2,ut=1,ue=s.slice.call(arguments,1),D=Object.create(this.lexer),U={yy:{}};for(var Tt in this.yy)Object.prototype.hasOwnProperty.call(this.yy,Tt)&&(U.yy[Tt]=this.yy[Tt]);D.setInput(l,U.yy),U.yy.lexer=D,U.yy.parser=this,typeof D.yylloc>"u"&&(D.yylloc={});var bt=D.yylloc;s.push(bt);var de=D.options&&D.options.ranges;typeof U.yy.parseError=="function"?this.parseError=U.yy.parseError:this.parseError=Object.getPrototypeOf(this).parseError;function fe(N){o.length=o.length-2*N,E.length=E.length-N,s.length=s.length-N}p(fe,"popStack");function Lt(){var N;return N=y.pop()||D.lex()||ut,typeof N!="number"&&(N instanceof Array&&(y=N,N=y.pop()),N=u.symbols_[N]||N),N}p(Lt,"lex");for(var A,Et,W,R,Ge,kt,z={},dt,G,It,ft;;){if(W=o[o.length-1],this.defaultActions[W]?R=this.defaultActions[W]:((A===null||typeof A>"u")&&(A=Lt()),R=H[W]&&H[W][A]),typeof R>"u"||!R.length||!R[0]){var _t="";ft=[];for(dt in H[W])this.terminals_[dt]&&dt>ht&&ft.push("'"+this.terminals_[dt]+"'");D.showPosition?_t="Parse error on line "+(B+1)+`:
`+D.showPosition()+`
Expecting `+ft.join(", ")+", got '"+(this.terminals_[A]||A)+"'":_t="Parse error on line "+(B+1)+": Unexpected "+(A==ut?"end of input":"'"+(this.terminals_[A]||A)+"'"),this.parseError(_t,{text:D.match,token:this.terminals_[A]||A,line:D.yylineno,loc:bt,expected:ft})}if(R[0]instanceof Array&&R.length>1)throw new Error("Parse Error: multiple actions possible at state: "+W+", token: "+A);switch(R[0]){case 1:o.push(A),E.push(D.yytext),s.push(D.yylloc),o.push(R[1]),A=null,Et?(A=Et,Et=null):(F=D.yyleng,c=D.yytext,B=D.yylineno,bt=D.yylloc,q>0&&q--);break;case 2:if(G=this.productions_[R[1]][1],z.$=E[E.length-G],z._$={first_line:s[s.length-(G||1)].first_line,last_line:s[s.length-1].last_line,first_column:s[s.length-(G||1)].first_column,last_column:s[s.length-1].last_column},de&&(z._$.range=[s[s.length-(G||1)].range[0],s[s.length-1].range[1]]),kt=this.performAction.apply(z,[c,F,B,U.yy,R[1],E,s].concat(ue)),typeof kt<"u")return kt;G&&(o=o.slice(0,-1*G*2),E=E.slice(0,-1*G),s=s.slice(0,-1*G)),o.push(this.productions_[R[1]][0]),E.push(z.$),s.push(z._$),It=H[o[o.length-2]][o[o.length-1]],o.push(It);break;case 3:return!0}}return!0},"parse")},he=(function(){var Y={EOF:1,parseError:p(function(u,o){if(this.yy.parser)this.yy.parser.parseError(u,o);else throw new Error(u)},"parseError"),setInput:p(function(l,u){return this.yy=u||this.yy||{},this._input=l,this._more=this._backtrack=this.done=!1,this.yylineno=this.yyleng=0,this.yytext=this.matched=this.match="",this.conditionStack=["INITIAL"],this.yylloc={first_line:1,first_column:0,last_line:1,last_column:0},this.options.ranges&&(this.yylloc.range=[0,0]),this.offset=0,this},"setInput"),input:p(function(){var l=this._input[0];this.yytext+=l,this.yyleng++,this.offset++,this.match+=l,this.matched+=l;var u=l.match(/(?:\r\n?|\n).*/g);return u?(this.yylineno++,this.yylloc.last_line++):this.yylloc.last_column++,this.options.ranges&&this.yylloc.range[1]++,this._input=this._input.slice(1),l},"input"),unput:p(function(l){var u=l.length,o=l.split(/(?:\r\n?|\n)/g);this._input=l+this._input,this.yytext=this.yytext.substr(0,this.yytext.length-u),this.offset-=u;var y=this.match.split(/(?:\r\n?|\n)/g);this.match=this.match.substr(0,this.match.length-1),this.matched=this.matched.substr(0,this.matched.length-1),o.length-1&&(this.yylineno-=o.length-1);var E=this.yylloc.range;return this.yylloc={first_line:this.yylloc.first_line,last_line:this.yylineno+1,first_column:this.yylloc.first_column,last_column:o?(o.length===y.length?this.yylloc.first_column:0)+y[y.length-o.length].length-o[0].length:this.yylloc.first_column-u},this.options.ranges&&(this.yylloc.range=[E[0],E[0]+this.yyleng-u]),this.yyleng=this.yytext.length,this},"unput"),more:p(function(){return this._more=!0,this},"more"),reject:p(function(){if(this.options.backtrack_lexer)this._backtrack=!0;else return this.parseError("Lexical error on line "+(this.yylineno+1)+`. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
`+this.showPosition(),{text:"",token:null,line:this.yylineno});return this},"reject"),less:p(function(l){this.unput(this.match.slice(l))},"less"),pastInput:p(function(){var l=this.matched.substr(0,this.matched.length-this.match.length);return(l.length>20?"...":"")+l.substr(-20).replace(/\n/g,"")},"pastInput"),upcomingInput:p(function(){var l=this.match;return l.length<20&&(l+=this._input.substr(0,20-l.length)),(l.substr(0,20)+(l.length>20?"...":"")).replace(/\n/g,"")},"upcomingInput"),showPosition:p(function(){var l=this.pastInput(),u=new Array(l.length+1).join("-");return l+this.upcomingInput()+`
`+u+"^"},"showPosition"),test_match:p(function(l,u){var o,y,E;if(this.options.backtrack_lexer&&(E={yylineno:this.yylineno,yylloc:{first_line:this.yylloc.first_line,last_line:this.last_line,first_column:this.yylloc.first_column,last_column:this.yylloc.last_column},yytext:this.yytext,match:this.match,matches:this.matches,matched:this.matched,yyleng:this.yyleng,offset:this.offset,_more:this._more,_input:this._input,yy:this.yy,conditionStack:this.conditionStack.slice(0),done:this.done},this.options.ranges&&(E.yylloc.range=this.yylloc.range.slice(0))),y=l[0].match(/(?:\r\n?|\n).*/g),y&&(this.yylineno+=y.length),this.yylloc={first_line:this.yylloc.last_line,last_line:this.yylineno+1,first_column:this.yylloc.last_column,last_column:y?y[y.length-1].length-y[y.length-1].match(/\r?\n?/)[0].length:this.yylloc.last_column+l[0].length},this.yytext+=l[0],this.match+=l[0],this.matches=l,this.yyleng=this.yytext.length,this.options.ranges&&(this.yylloc.range=[this.offset,this.offset+=this.yyleng]),this._more=!1,this._backtrack=!1,this._input=this._input.slice(l[0].length),this.matched+=l[0],o=this.performAction.call(this,this.yy,this,u,this.conditionStack[this.conditionStack.length-1]),this.done&&this._input&&(this.done=!1),o)return o;if(this._backtrack){for(var s in E)this[s]=E[s];return!1}return!1},"test_match"),next:p(function(){if(this.done)return this.EOF;this._input||(this.done=!0);var l,u,o,y;this._more||(this.yytext="",this.match="");for(var E=this._currentRules(),s=0;s<E.length;s++)if(o=this._input.match(this.rules[E[s]]),o&&(!u||o[0].length>u[0].length)){if(u=o,y=s,this.options.backtrack_lexer){if(l=this.test_match(o,E[s]),l!==!1)return l;if(this._backtrack){u=!1;continue}else return!1}else if(!this.options.flex)break}return u?(l=this.test_match(u,E[y]),l!==!1?l:!1):this._input===""?this.EOF:this.parseError("Lexical error on line "+(this.yylineno+1)+`. Unrecognized text.
`+this.showPosition(),{text:"",token:null,line:this.yylineno})},"next"),lex:p(function(){var u=this.next();return u||this.lex()},"lex"),begin:p(function(u){this.conditionStack.push(u)},"begin"),popState:p(function(){var u=this.conditionStack.length-1;return u>0?this.conditionStack.pop():this.conditionStack[0]},"popState"),_currentRules:p(function(){return this.conditionStack.length&&this.conditionStack[this.conditionStack.length-1]?this.conditions[this.conditionStack[this.conditionStack.length-1]].rules:this.conditions.INITIAL.rules},"_currentRules"),topState:p(function(u){return u=this.conditionStack.length-1-Math.abs(u||0),u>=0?this.conditionStack[u]:"INITIAL"},"topState"),pushState:p(function(u){this.begin(u)},"pushState"),stateStackSize:p(function(){return this.conditionStack.length},"stateStackSize"),options:{"case-insensitive":!0},performAction:p(function(u,o,y,E){function s(){let c=o.yytext.indexOf("%%");if(c===0)return!1;if(c>0){let B=o.yytext.slice(0,c),F=o.yytext.slice(c);F&&u.lexer.unput(F),o.yytext=B}return!0}p(s,"processId");var H=E;switch(y){case 0:return 38;case 1:return 40;case 2:return 39;case 3:return 44;case 4:return 51;case 5:return 52;case 6:return 53;case 7:return 54;case 8:return 5;case 9:break;case 10:break;case 11:break;case 12:break;case 13:return this.pushState("SCALE"),17;break;case 14:return 18;case 15:this.popState();break;case 16:return this.begin("acc_title"),33;break;case 17:return this.popState(),"acc_title_value";break;case 18:return this.begin("acc_descr"),35;break;case 19:return this.popState(),"acc_descr_value";break;case 20:this.begin("acc_descr_multiline");break;case 21:this.popState();break;case 22:return"acc_descr_multiline_value";case 23:return this.pushState("CLASSDEF"),41;break;case 24:return this.popState(),this.pushState("CLASSDEFID"),"DEFAULT_CLASSDEF_ID";break;case 25:return this.popState(),this.pushState("CLASSDEFID"),42;break;case 26:return this.popState(),43;break;case 27:return this.pushState("CLASS"),48;break;case 28:return this.popState(),this.pushState("CLASS_STYLE"),49;break;case 29:return this.popState(),50;break;case 30:return this.pushState("STYLE"),45;break;case 31:return this.popState(),this.pushState("STYLEDEF_STYLES"),46;break;case 32:return this.popState(),47;break;case 33:return this.pushState("SCALE"),17;break;case 34:return 18;case 35:this.popState();break;case 36:this.pushState("STATE");break;case 37:return this.popState(),o.yytext=o.yytext.slice(0,-8).trim(),25;break;case 38:return this.popState(),o.yytext=o.yytext.slice(0,-8).trim(),26;break;case 39:return this.popState(),o.yytext=o.yytext.slice(0,-10).trim(),27;break;case 40:return this.popState(),o.yytext=o.yytext.slice(0,-8).trim(),25;break;case 41:return this.popState(),o.yytext=o.yytext.slice(0,-8).trim(),26;break;case 42:return this.popState(),o.yytext=o.yytext.slice(0,-10).trim(),27;break;case 43:return 51;case 44:return 52;case 45:return 53;case 46:return 54;case 47:this.pushState("STATE_STRING");break;case 48:return this.pushState("STATE_ID"),"AS";break;case 49:if(!s())return;return this.popState(),"ID";break;case 50:this.popState();break;case 51:return"STATE_DESCR";case 52:return 19;case 53:this.popState();break;case 54:return this.popState(),this.pushState("struct"),20;break;case 55:return this.popState(),21;break;case 56:break;case 57:return this.begin("NOTE"),29;break;case 58:return this.popState(),this.pushState("NOTE_ID"),59;break;case 59:return this.popState(),this.pushState("NOTE_ID"),60;break;case 60:this.popState(),this.pushState("FLOATING_NOTE");break;case 61:return this.popState(),this.pushState("FLOATING_NOTE_ID"),"AS";break;case 62:break;case 63:return"NOTE_TEXT";case 64:if(!s())return;return this.popState(),"ID";break;case 65:if(!s())return;return this.popState(),this.pushState("NOTE_TEXT"),24;break;case 66:return this.popState(),o.yytext=o.yytext.substr(2).trim(),31;break;case 67:return this.popState(),o.yytext=o.yytext.slice(0,-8).trim(),31;break;case 68:return 6;case 69:return 6;case 70:return 16;case 71:return 57;case 72:return s()?24:void 0;case 73:return o.yytext=o.yytext.trim(),14;break;case 74:return 15;case 75:return 28;case 76:return 58;case 77:return 5;case 78:return"INVALID"}},"anonymous"),rules:[/^(?:click\b)/i,/^(?:href\b)/i,/^(?:"[^"]*")/i,/^(?:default\b)/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:[\n]+)/i,/^(?:[\s]+)/i,/^(?:((?!\n)\s)+)/i,/^(?:#[^\n]*)/i,/^(?:%%(?!\{)[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:accTitle\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*:\s*)/i,/^(?:(?!\n||)*[^\n]*)/i,/^(?:accDescr\s*\{\s*)/i,/^(?:[\}])/i,/^(?:[^\}]*)/i,/^(?:classDef\s+)/i,/^(?:DEFAULT\s+)/i,/^(?:\w+\s+)/i,/^(?:[^\n]*)/i,/^(?:class\s+)/i,/^(?:(\w+)+((,\s*\w+)*))/i,/^(?:[^\n]*)/i,/^(?:style\s+)/i,/^(?:[\w,]+\s+)/i,/^(?:[^\n]*)/i,/^(?:scale\s+)/i,/^(?:\d+)/i,/^(?:\s+width\b)/i,/^(?:state\s+)/i,/^(?:.*<<fork>>)/i,/^(?:.*<<join>>)/i,/^(?:.*<<choice>>)/i,/^(?:.*\[\[fork\]\])/i,/^(?:.*\[\[join\]\])/i,/^(?:.*\[\[choice\]\])/i,/^(?:.*direction\s+TB[^\n]*)/i,/^(?:.*direction\s+BT[^\n]*)/i,/^(?:.*direction\s+RL[^\n]*)/i,/^(?:.*direction\s+LR[^\n]*)/i,/^(?:["])/i,/^(?:\s*as\s+)/i,/^(?:[^\n\{]*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n\s\{]+)/i,/^(?:\n)/i,/^(?:\{)/i,/^(?:\})/i,/^(?:[\n])/i,/^(?:note\s+)/i,/^(?:left of\b)/i,/^(?:right of\b)/i,/^(?:")/i,/^(?:\s*as\s*)/i,/^(?:["])/i,/^(?:[^"]*)/i,/^(?:[^\n]*)/i,/^(?:\s*[^:\n\s\-]+)/i,/^(?:\s*:[^:\n;]+)/i,/^(?:[\s\S]*?\n\s*end note\b)/i,/^(?:stateDiagram\s+)/i,/^(?:stateDiagram-v2\s+)/i,/^(?:hide empty description\b)/i,/^(?:\[\*\])/i,/^(?:[^:\n\s\-\{]+)/i,/^(?:\s*:(?:[^:\n;]|:[^:\n;])+)/i,/^(?:-->)/i,/^(?:--)/i,/^(?::::)/i,/^(?:$)/i,/^(?:.)/i],conditions:{LINE:{rules:[10,11,12],inclusive:!1},struct:{rules:[10,11,12,23,27,30,36,43,44,45,46,55,56,57,71,72,73,74,75,76],inclusive:!1},FLOATING_NOTE_ID:{rules:[64],inclusive:!1},FLOATING_NOTE:{rules:[61,62,63],inclusive:!1},NOTE_TEXT:{rules:[66,67],inclusive:!1},NOTE_ID:{rules:[65],inclusive:!1},NOTE:{rules:[58,59,60],inclusive:!1},STYLEDEF_STYLEOPTS:{rules:[],inclusive:!1},STYLEDEF_STYLES:{rules:[32],inclusive:!1},STYLE_IDS:{rules:[],inclusive:!1},STYLE:{rules:[31],inclusive:!1},CLASS_STYLE:{rules:[29],inclusive:!1},CLASS:{rules:[28],inclusive:!1},CLASSDEFID:{rules:[26],inclusive:!1},CLASSDEF:{rules:[24,25],inclusive:!1},acc_descr_multiline:{rules:[21,22],inclusive:!1},acc_descr:{rules:[19],inclusive:!1},acc_title:{rules:[17],inclusive:!1},SCALE:{rules:[14,15,34,35],inclusive:!1},ALIAS:{rules:[],inclusive:!1},STATE_ID:{rules:[49],inclusive:!1},STATE_STRING:{rules:[50,51],inclusive:!1},FORK_STATE:{rules:[],inclusive:!1},STATE:{rules:[10,11,12,37,38,39,40,41,42,47,48,52,53,54],inclusive:!1},ID:{rules:[10,11,12],inclusive:!1},INITIAL:{rules:[0,1,2,3,4,5,6,7,8,9,11,12,13,16,18,20,23,27,30,33,36,54,57,68,69,70,71,72,73,74,76,77,78],inclusive:!0}}};return Y})();gt.lexer=he;function ct(){this.yy={}}return p(ct,"Parser"),ct.prototype=gt,gt.Parser=ct,new ct})();vt.parser=vt;var He=vt,pe="TB",qt="TB",Wt="dir",X="state",K="root",Ct="relation",Se="classDef",ye="style",ge="applyClass",tt="default",Qt="divider",Zt="fill:none",te="fill: #333",ee="c",se="markdown",re="normal",mt="rect",Dt="rectWithTitle",Te="stateStart",be="stateEnd",jt="divider",Ht="roundedWithTitle",Ee="note",ke="noteGroup",et="statediagram",_e="state",me=`${et}-${_e}`,ie="transition",De="note",ve="note-edge",Ce=`${ie} ${ve}`,Ae=`${et}-${De}`,xe="cluster",Le=`${et}-${xe}`,Ie="cluster-alt",Oe=`${et}-${Ie}`,ae="parent",ne="note",Ne="state",At="----",Re=`${At}${ne}`,zt=`${At}${ae}`,oe=p((t,a=qt)=>{if(!t.doc)return a;let k=a;for(let e of t.doc)e.stmt==="dir"&&(k=e.value);return k},"getDir"),we=p(function(t,a){return a.db.getClasses()},"getClasses"),$e=p(function(t,a,k,e){return Ot(this,null,function*(){m.info("REF0:"),m.info("Drawing state diagram (v2)",a);let{securityLevel:r,state:d,layout:i}=w();e.db.extract(e.db.getRootDocV2());let h=e.db.getData(),n=Mt(a,r);h.type=e.type,h.layoutAlgorithm=i,h.nodeSpacing=d?.nodeSpacing||50,h.rankSpacing=d?.rankSpacing||50,w().look==="neo"?h.markers=["barbNeo"]:h.markers=["barb"],h.diagramId=a,yield Vt(h,n);let v=8;try{(typeof e.db.getLinks=="function"?e.db.getLinks():new Map).forEach((T,_)=>{let f=typeof _=="string"?_:typeof _?.id=="string"?_.id:"";if(!f){m.warn("\u26A0\uFE0F Invalid or missing stateId from key:",JSON.stringify(_));return}let L=n.node()?.querySelectorAll("g"),C;if(L?.forEach(O=>{O.textContent?.trim()===f&&(C=O)}),!C){m.warn("\u26A0\uFE0F Could not find node matching text:",f);return}let $=C.parentNode;if(!$){m.warn("\u26A0\uFE0F Node has no parent, cannot wrap:",f);return}let I=document.createElementNS("http://www.w3.org/2000/svg","a"),P=T.url.replace(/^"+|"+$/g,"");if(I.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",P),I.setAttribute("target","_blank"),T.tooltip){let O=T.tooltip.replace(/^"+|"+$/g,"");I.setAttribute("title",O)}$.replaceChild(I,C),I.appendChild(C),m.info("\u{1F517} Wrapped node in <a> tag for:",f,T.url)})}catch(g){m.error("\u274C Error injecting clickable links:",g)}Yt.insertTitle(n,"statediagramTitleText",d?.titleTopMargin??25,e.db.getDiagramTitle()),Ut(n,v,et,d?.useMaxWidth??!0)})},"draw"),ze={getClasses:we,draw:$e,getDir:oe},St=new Map,M=0;function yt(t="",a=0,k="",e=At){let r=k!==null&&k.length>0?`${e}${k}`:"";return`${Ne}-${t}${r}-${a}`}p(yt,"stateDomId");var Pe=p((t,a,k,e,r,d,i,h)=>{m.trace("items",a),a.forEach(n=>{switch(n.stmt){case X:Z(t,n,k,e,r,d,i,h);break;case tt:Z(t,n,k,e,r,d,i,h);break;case Ct:{Z(t,n.state1,k,e,r,d,i,h),Z(t,n.state2,k,e,r,d,i,h);let b=i==="neo",v={id:"edge"+M,start:n.state1.id,end:n.state2.id,arrowhead:"normal",arrowTypeEnd:b?"arrow_barb_neo":"arrow_barb",style:Zt,labelStyle:"",label:V.sanitizeText(n.description??"",w()),arrowheadStyle:te,labelpos:ee,labelType:se,thickness:re,classes:ie,look:i};r.push(v),M++}break}})},"setupDoc"),Kt=p((t,a=qt)=>{let k=a;if(t.doc)for(let e of t.doc)e.stmt==="dir"&&(k=e.value);return k},"getDir");function Q(t,a,k){if(!a.id||a.id==="</join></fork>"||a.id==="</choice>")return;a.cssClasses&&(Array.isArray(a.cssCompiledStyles)||(a.cssCompiledStyles=[]),a.cssClasses.split(" ").forEach(r=>{let d=k.get(r);d&&(a.cssCompiledStyles=[...a.cssCompiledStyles??[],...d.styles])}));let e=t.find(r=>r.id===a.id);e?Object.assign(e,a):t.push(a)}p(Q,"insertOrUpdateNode");function le(t){return t?.classes?.join(" ")??""}p(le,"getClassesFromDbInfo");function ce(t){return t?.styles??[]}p(ce,"getStylesFromDbInfo");var Z=p((t,a,k,e,r,d,i,h)=>{let n=a.id,b=k.get(n),v=le(b),g=ce(b),T=w();if(m.info("dataFetcher parsedItem",a,b,g),n!=="root"){let _=mt;a.start===!0?_=Te:a.start===!1&&(_=be),a.type!==tt&&(_=a.type),St.get(n)||St.set(n,{id:n,shape:_,description:V.sanitizeText(n,T),cssClasses:`${v} ${me}`,cssStyles:g});let f=St.get(n);a.description&&(Array.isArray(f.description)?(f.shape=Dt,f.description.push(a.description)):f.description?.length&&f.description.length>0?(f.shape=Dt,f.description===n?f.description=[a.description]:f.description=[f.description,a.description]):(f.shape=mt,f.description=a.description),f.description=V.sanitizeTextOrArray(f.description,T)),f.description?.length===1&&f.shape===Dt&&(f.type==="group"?f.shape=Ht:f.shape=mt),!f.type&&a.doc&&(m.info("Setting cluster for XCX",n,Kt(a)),f.type="group",f.isGroup=!0,f.dir=Kt(a),f.shape=a.type===Qt?jt:Ht,f.cssClasses=`${f.cssClasses} ${Le} ${d?Oe:""}`);let L={labelStyle:"",shape:f.shape,label:f.description,cssClasses:f.cssClasses,cssCompiledStyles:[],cssStyles:f.cssStyles,id:n,dir:f.dir,domId:yt(n,M),type:f.type,isGroup:f.type==="group",padding:8,rx:10,ry:10,look:i,labelType:"markdown"};if(L.shape===jt&&(L.label=""),t&&t.id!=="root"&&(m.trace("Setting node ",n," to be child of its parent ",t.id),L.parentId=t.id),L.centerLabel=!0,a.note){let C={labelStyle:"",shape:Ee,label:a.note.text,labelType:"markdown",cssClasses:Ae,cssStyles:[],cssCompiledStyles:[],id:n+Re+"-"+M,domId:yt(n,M,ne),type:f.type,isGroup:f.type==="group",padding:T.flowchart?.padding,look:i,position:a.note.position},$=n+zt,I={labelStyle:"",shape:ke,label:a.note.text,cssClasses:f.cssClasses,cssStyles:[],id:n+zt,domId:yt(n,M,ae),type:"group",isGroup:!0,padding:16,look:i,position:a.note.position};M++,I.id=$,C.parentId=$,Q(e,I,h),Q(e,C,h),Q(e,L,h);let P=n,O=C.id;a.note.position==="left of"&&(P=C.id,O=n),r.push({id:P+"-"+O,start:P,end:O,arrowhead:"none",arrowTypeEnd:"",style:Zt,labelStyle:"",classes:Ce,arrowheadStyle:te,labelpos:ee,labelType:se,thickness:re,look:i})}else Q(e,L,h)}a.doc&&(m.trace("Adding nodes children "),Pe(a,a.doc,k,e,r,!d,i,h))},"dataFetcher"),Be=p(()=>{St.clear(),M=0},"reset"),x={START_NODE:"[*]",START_TYPE:"start",END_NODE:"[*]",END_TYPE:"end",COLOR_KEYWORD:"color",FILL_KEYWORD:"fill",BG_FILL:"bgFill",STYLECLASS_SEP:","},Xt=p(()=>new Map,"newClassesList"),Jt=p(()=>({relations:[],states:new Map,documents:{}}),"newDoc"),pt=p(t=>JSON.parse(JSON.stringify(t)),"clone"),Ke=(()=>{var a;return a=class{constructor(e){this.version=e,this.nodes=[],this.edges=[],this.rootDoc=[],this.classes=Xt(),this.documents={root:Jt()},this.currentDocument=this.documents.root,this.startEndCount=0,this.dividerCnt=0,this.links=new Map,this.getAccTitle=wt,this.setAccTitle=Rt,this.getAccDescription=Pt,this.setAccDescription=$t,this.setDiagramTitle=Bt,this.getDiagramTitle=Ft,this.clear(),this.setRootDoc=this.setRootDoc.bind(this),this.getDividerId=this.getDividerId.bind(this),this.setDirection=this.setDirection.bind(this),this.trimColon=this.trimColon.bind(this)}extract(e){this.clear(!0);for(let i of Array.isArray(e)?e:e.doc)switch(i.stmt){case X:this.addState(i.id.trim(),i.type,i.doc,i.description,i.note);break;case Ct:this.addRelation(i.state1,i.state2,i.description);break;case Se:this.addStyleClass(i.id.trim(),i.classes);break;case ye:this.handleStyleDef(i);break;case ge:this.setCssClass(i.id.trim(),i.styleClass);break;case"click":this.addLink(i.id,i.url,i.tooltip);break}let r=this.getStates(),d=w();Be(),Z(void 0,this.getRootDocV2(),r,this.nodes,this.edges,!0,d.look,this.classes);for(let i of this.nodes)if(Array.isArray(i.label)){if(i.description=i.label.slice(1),i.isGroup&&i.description.length>0)throw new Error(`Group nodes can only have label. Remove the additional description for node [${i.id}]`);i.label=i.label[0]}}handleStyleDef(e){let r=e.id.trim().split(","),d=e.styleClass.split(",");for(let i of r){let h=this.getState(i);if(!h){let n=i.trim();this.addState(n),h=this.getState(n)}h&&(h.styles=d.map(n=>n.replace(/;/g,"")?.trim()))}}setRootDoc(e){m.info("Setting root doc",e),this.rootDoc=e,this.version===1?this.extract(e):this.extract(this.getRootDocV2())}docTranslator(e,r,d){if(r.stmt===Ct){this.docTranslator(e,r.state1,!0),this.docTranslator(e,r.state2,!1);return}if(r.stmt===X&&(r.id===x.START_NODE?(r.id=e.id+(d?"_start":"_end"),r.start=d):r.id=r.id.trim()),r.stmt!==K&&r.stmt!==X||!r.doc)return;let i=[],h=[];for(let n of r.doc)if(n.type===Qt){let b=pt(n);b.doc=pt(h),i.push(b),h=[]}else h.push(n);if(i.length>0&&h.length>0){let n={stmt:X,id:Gt(),type:"divider",doc:pt(h)};i.push(pt(n)),r.doc=i}r.doc.forEach(n=>this.docTranslator(r,n,!0))}getRootDocV2(){return this.docTranslator({id:K,stmt:K},{id:K,stmt:K,doc:this.rootDoc},!0),{id:K,doc:this.rootDoc}}addState(e,r=tt,d=void 0,i=void 0,h=void 0,n=void 0,b=void 0,v=void 0){let g=e?.trim();if(!this.currentDocument.states.has(g))m.info("Adding state ",g,i),this.currentDocument.states.set(g,{stmt:X,id:g,descriptions:[],type:r,doc:d,note:h,classes:[],styles:[],textStyles:[]});else{let T=this.currentDocument.states.get(g);if(!T)throw new Error(`State not found: ${g}`);T.doc||(T.doc=d),T.type||(T.type=r)}if(i&&(m.info("Setting state description",g,i),(Array.isArray(i)?i:[i]).forEach(_=>this.addDescription(g,_.trim()))),h){let T=this.currentDocument.states.get(g);if(!T)throw new Error(`State not found: ${g}`);T.note=h,T.note.text=V.sanitizeText(T.note.text,w())}n&&(m.info("Setting state classes",g,n),(Array.isArray(n)?n:[n]).forEach(_=>this.setCssClass(g,_.trim()))),b&&(m.info("Setting state styles",g,b),(Array.isArray(b)?b:[b]).forEach(_=>this.setStyle(g,_.trim()))),v&&(m.info("Setting state styles",g,b),(Array.isArray(v)?v:[v]).forEach(_=>this.setTextStyle(g,_.trim())))}clear(e){this.nodes=[],this.edges=[],this.documents={root:Jt()},this.currentDocument=this.documents.root,this.startEndCount=0,this.classes=Xt(),e||(this.links=new Map,Nt())}getState(e){return this.currentDocument.states.get(e)}getStates(){return this.currentDocument.states}logDocuments(){m.info("Documents = ",this.documents)}getRelations(){return this.currentDocument.relations}addLink(e,r,d){this.links.set(e,{url:r,tooltip:d}),m.warn("Adding link",e,r,d)}getLinks(){return this.links}startIdIfNeeded(e=""){return e===x.START_NODE?(this.startEndCount++,`${x.START_TYPE}${this.startEndCount}`):e}startTypeIfNeeded(e="",r=tt){return e===x.START_NODE?x.START_TYPE:r}endIdIfNeeded(e=""){return e===x.END_NODE?(this.startEndCount++,`${x.END_TYPE}${this.startEndCount}`):e}endTypeIfNeeded(e="",r=tt){return e===x.END_NODE?x.END_TYPE:r}addRelationObjs(e,r,d=""){let i=this.startIdIfNeeded(e.id.trim()),h=this.startTypeIfNeeded(e.id.trim(),e.type),n=this.startIdIfNeeded(r.id.trim()),b=this.startTypeIfNeeded(r.id.trim(),r.type);this.addState(i,h,e.doc,e.description,e.note,e.classes,e.styles,e.textStyles),this.addState(n,b,r.doc,r.description,r.note,r.classes,r.styles,r.textStyles),this.currentDocument.relations.push({id1:i,id2:n,relationTitle:V.sanitizeText(d,w())})}addRelation(e,r,d){if(typeof e=="object"&&typeof r=="object")this.addRelationObjs(e,r,d);else if(typeof e=="string"&&typeof r=="string"){let i=this.startIdIfNeeded(e.trim()),h=this.startTypeIfNeeded(e),n=this.endIdIfNeeded(r.trim()),b=this.endTypeIfNeeded(r);this.addState(i,h),this.addState(n,b),this.currentDocument.relations.push({id1:i,id2:n,relationTitle:d?V.sanitizeText(d,w()):void 0})}}addDescription(e,r){let d=this.currentDocument.states.get(e),i=r.startsWith(":")?r.replace(":","").trim():r;d?.descriptions?.push(V.sanitizeText(i,w()))}cleanupLabel(e){return e.startsWith(":")?e.slice(2).trim():e.trim()}getDividerId(){return this.dividerCnt++,`divider-id-${this.dividerCnt}`}addStyleClass(e,r=""){this.classes.has(e)||this.classes.set(e,{id:e,styles:[],textStyles:[]});let d=this.classes.get(e);r&&d&&r.split(x.STYLECLASS_SEP).forEach(i=>{let h=i.replace(/([^;]*);/,"$1").trim();if(RegExp(x.COLOR_KEYWORD).exec(i)){let b=h.replace(x.FILL_KEYWORD,x.BG_FILL).replace(x.COLOR_KEYWORD,x.FILL_KEYWORD);d.textStyles.push(b)}d.styles.push(h)})}getClasses(){return this.classes}setCssClass(e,r){e.split(",").forEach(d=>{let i=this.getState(d);if(!i){let h=d.trim();this.addState(h),i=this.getState(h)}i?.classes?.push(r)})}setStyle(e,r){this.getState(e)?.styles?.push(r)}setTextStyle(e,r){this.getState(e)?.textStyles?.push(r)}getDirectionStatement(){return this.rootDoc.find(e=>e.stmt===Wt)}getDirection(){return this.getDirectionStatement()?.value??pe}setDirection(e){let r=this.getDirectionStatement();r?r.value=e:this.rootDoc.unshift({stmt:Wt,value:e})}trimColon(e){return e.startsWith(":")?e.slice(1).trim():e.trim()}getData(){let e=w();return{nodes:this.nodes,edges:this.edges,other:{},config:e,direction:oe(this.getRootDocV2())}}getConfig(){return w().state}},p(a,"StateDB"),a.relationType={AGGREGATION:0,EXTENSION:1,COMPOSITION:2,DEPENDENCY:3},a})(),Fe=p(t=>`
defs [id$="-barbEnd"] {
    fill: ${t.transitionColor};
    stroke: ${t.transitionColor};
  }
g.stateGroup text {
  fill: ${t.nodeBorder};
  stroke: none;
  font-size: 10px;
}
g.stateGroup text {
  fill: ${t.textColor};
  stroke: none;
  font-size: 10px;

}
g.stateGroup .state-title {
  font-weight: bolder;
  fill: ${t.stateLabelColor};
}

g.stateGroup rect {
  fill: ${t.mainBkg};
  stroke: ${t.nodeBorder};
}

g.stateGroup line {
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.transition {
  stroke: ${t.transitionColor};
  stroke-width: ${t.strokeWidth||1};
  fill: none;
}

.stateGroup .composit {
  fill: ${t.background};
  border-bottom: 1px
}

.stateGroup .alt-composit {
  fill: #e0e0e0;
  border-bottom: 1px
}

.state-note {
  stroke: ${t.noteBorderColor};
  fill: ${t.noteBkgColor};

  text {
    fill: ${t.noteTextColor};
    stroke: none;
    font-size: 10px;
  }
}

.stateLabel .box {
  stroke: none;
  stroke-width: 0;
  fill: ${t.mainBkg};
  opacity: 0.5;
}

.edgeLabel .label rect {
  fill: ${t.labelBackgroundColor};
  opacity: 0.5;
}
.edgeLabel {
  background-color: ${t.edgeLabelBackground};
  p {
    background-color: ${t.edgeLabelBackground};
  }
  rect {
    opacity: 0.5;
    background-color: ${t.edgeLabelBackground};
    fill: ${t.edgeLabelBackground};
  }
  text-align: center;
}
.edgeLabel .label text {
  fill: ${t.transitionLabelColor||t.tertiaryTextColor};
}
.label div .edgeLabel {
  color: ${t.transitionLabelColor||t.tertiaryTextColor};
}

.stateLabel text {
  fill: ${t.stateLabelColor};
  font-size: 10px;
  font-weight: bold;
}

.node circle.state-start {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node .fork-join {
  fill: ${t.specialStateColor};
  stroke: ${t.specialStateColor};
}

.node circle.state-end {
  fill: ${t.innerEndBackground};
  stroke: ${t.background};
  stroke-width: 1.5
}
.end-state-inner {
  fill: ${t.compositeBackground||t.background};
  // stroke: ${t.background};
  stroke-width: 1.5
}

.node rect {
  fill: ${t.stateBkg||t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}
.node polygon {
  fill: ${t.mainBkg};
  stroke: ${t.stateBorder||t.nodeBorder};;
  stroke-width: ${t.strokeWidth||1}px;
}
[id$="-barbEnd"] {
  fill: ${t.lineColor};
}

.statediagram-cluster rect {
  fill: ${t.compositeTitleBackground};
  stroke: ${t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth||1}px;
}

.cluster-label, .nodeLabel {
  color: ${t.stateLabelColor};
  // line-height: 1;
}

.statediagram-cluster rect.outer {
  rx: 5px;
  ry: 5px;
}
.statediagram-state .divider {
  stroke: ${t.stateBorder||t.nodeBorder};
}

.statediagram-state .title-state {
  rx: 5px;
  ry: 5px;
}
.statediagram-cluster.statediagram-cluster .inner {
  fill: ${t.compositeBackground||t.background};
}
.statediagram-cluster.statediagram-cluster-alt .inner {
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.statediagram-cluster .inner {
  rx:0;
  ry:0;
}

.statediagram-state rect.basic {
  rx: 5px;
  ry: 5px;
}
.statediagram-state rect.divider {
  stroke-dasharray: 10,10;
  fill: ${t.altBackground?t.altBackground:"#efefef"};
}

.note-edge {
  stroke-dasharray: 5;
}

.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}
.statediagram-note rect {
  fill: ${t.noteBkgColor};
  stroke: ${t.noteBorderColor};
  stroke-width: 1px;
  rx: 0;
  ry: 0;
}

.statediagram-note text {
  fill: ${t.noteTextColor};
}

.statediagram-note .nodeLabel {
  color: ${t.noteTextColor};
}
.statediagram .edgeLabel {
  color: red; // ${t.noteTextColor};
}

[id$="-dependencyStart"], [id$="-dependencyEnd"] {
  fill: ${t.lineColor};
  stroke: ${t.lineColor};
  stroke-width: ${t.strokeWidth||1};
}

.statediagramTitleText {
  text-anchor: middle;
  font-size: 18px;
  fill: ${t.textColor};
}

[data-look="neo"].statediagram-cluster rect {
  fill: ${t.mainBkg};
  stroke: ${t.useGradient?"url("+t.svgId+"-gradient)":t.stateBorder||t.nodeBorder};
  stroke-width: ${t.strokeWidth??1};
}
[data-look="neo"].statediagram-cluster rect.outer {
  rx: ${t.radius}px;
  ry: ${t.radius}px;
  filter: ${t.dropShadow?t.dropShadow.replace("url(#drop-shadow)",`url(${t.svgId}-drop-shadow)`):"none"}
}
`,"getStyles"),Xe=Fe;export{He as a,ze as b,Ke as c,Xe as d};
