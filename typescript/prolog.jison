
/* description: Parses end executes prolog syntax: 
  http://cdn.bitbucket.org/muspellsson/rosetta/downloads/prolog-bnf.html
*/

%{

var rules = [];
var args = [];
var re = RuleEngine.getREInst();

%}

/* lexical grammar */
%lex
%%

\s+                   {/* skip whitespace */}
'"'("\\"["]|[^"])*'"' {return 'STRING';}
"'"('\\'[']|[^'])*"'" {return 'STRING';}
[0-9]                 {return 'DIGIT';}
[a-z]                 {return 'LOWCASELETTER';}
[A-Z]                 {return 'UPPERCASELETTER';}
","                   {return 'COMMA';}
"."                   {return 'PERIOD';}
":-"                  {return 'NECK';} 
"?-"                  {return 'QUERYSYMBOL';}
"("                   {return 'LEFTPAREN';}
")"                   {return 'RIGHTPAREN';}
<<EOF>>               {return 'EOF';}
.                     {return 'INVALID';}

/lex


%start expressions

%% /* language grammar */

expressions
    : program EOF
        { 
          //typeof console !== 'undefined' ? console.log($1) : print($1);
          if(is_debug) {
            console.log("here 0");
          }
          return $1; 
        }
    ;

program
    : clauselist 
        {
          if(is_debug) {
            console.log("here 1");
          }
        }
    | clauselist query
        {
          if(is_debug) {
            console.log("here 1.1");
          }
        }
    | query
        {
          if(is_debug) {
            console.log("here 2");
          }
        }
    ;

clauselist
    : clause
        {
          if(is_debug) {
            console.log("here 3");
          }
        }
    | clauselist clause
        {
          if(is_debug) {
            console.log("here 4");
          }
        }
    ;

clause
    : predicate PERIOD
        {
          if(is_debug) {
            console.log("here 5");
          }
        }
    | predicate NECK predicatelist PERIOD
        {
         if(is_debug) {
           console.log("here 6 1: " + $1);
           console.log("_dbg rules.length: " + rules.length); 
         }
         if(rules.length > 0) {
	   header = rules.pop();
           if(is_debug) {
	     console.log("_dbg header rule name: " + header.name);
           }
	   while(rules.length > 0) {
	     var body_rule = rules.pop();
             if(is_debug) {
	       console.log("_dbg adding to header body rule name: " + body_rule.name);
             }
             if(body_rule.name == 'write' && body_rule.args[0]) {
               if(is_debug) {
                 console.log("_dbg write body_rule.args[0]: " + body_rule.args[0]);
               }
               body_rule = new Rule('write(' + body_rule.args[0] + ')');
             }
	     header.addRule(body_rule);
	   }
         }
         re.addRule(header);
        }
    ;

predicatelist
    : predicate
        {
         if(is_debug) {
           console.log("here 7 1: " + $1);
         }
         $$=$1;
        }
    | predicatelist COMMA predicate
        {
         if(is_debug) {
           console.log("here 8");
         }
        }
    ;

predicate
    : atom
        {
         if(is_debug) {
           console.log("here 9 1: " + $1);
         }
         $$=$1;
         var r = new Rule($1);
         rules.unshift(r);
        }
    | atom LEFTPAREN termlist RIGHTPAREN
        {
         if(is_debug) {
           console.log("here 10");
         }
         var r = new Rule($1);
         for(var i=0;i<args.length;i++) {
           r.addArg(args[i]); 
         }
         rules.unshift(r);
        }
    ;

termlist
    : term
        {
         if(is_debug) {
           console.log("here 11 1: " + $1);
         }
         $$ = $1
        }
    | termlist COMMA term
        {
         if(is_debug) {
           console.log("here 12");
         }
        }
    ;

term
    : numeral
        {
         if(is_debug) {
           console.log("here 13 1: " + $1);
         }
         $$ = $1;
        }
    | atom
        {
         if(is_debug) {
           console.log("here 14 1: " + $1);
         }
         $$ = $1;
         args.push($1);
        }
    | variable
        {
         if(is_debug) {
           console.log("here 15 1: " + $1);
         }
         $$ = $1;
        }
    ;

query
    : QUERYSYMBOL predicatelist PERIOD
        {
         if(is_debug) {
           console.log("here 16 1: " + $1);
           console.log("here 16 2: " + $2);
         }
        }
    ;

atom
    : smallatom
        {
         if(is_debug) {
           console.log("here 18 1: " + $1);
         }
         $$=$1;
        }
    | string
        {
         if(is_debug) {
           console.log("here 19 1: " + $1);
         }
         $$=$1;
        }
    ;

string
    : STRING {
	$$ = $1.substring(1, $1.length - 1);//js
	}

    ;

smallatom
    : LOWCASELETTER
        {
         if(is_debug) {
           console.log("here 20 1: " + $1);
         }
         $$=$1;
        }
    | smallatom character
        {
         if(is_debug) {
           console.log("here 21: 1: " + $1 + " 2: " + $2);
         }
         $$=$1 + $2;
        }
    ;

variable
    : UPPERCASELETTER
        {
         if(is_debug) {
           console.log("here 22");
         }
        }
    | variable character
        {
         if(is_debug) {
           console.log("here 23");
         }
        }
    ;

numeral
    : DIGIT
        {
         if(is_debug) {
           console.log("here 24");
         }
        }
    | numeral DIGIT
        {
         if(is_debug) {
           console.log("here 25");
         }
        }
    ;

character
    : LOWCASELETTER
        {
         if(is_debug) {
           console.log("here 26");
         }
        }
    | UPPERCASELETTER
        {
         if(is_debug) {
           console.log("here 27");
         }
        }
    | DIGIT
        {
         if(is_debug) {
           console.log("here 28");
         }
        }
    ;


