
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
[A-Z_]\w*             {return 'VARIABLE';}
[a-z_]\w*             {return 'SMALLATOM';}
[a-z]                 {return 'LOWCASELETTER';}
[A-Z]                 {return 'UPPERCASELETTER';}
"=="                  {return 'EQCMP';}
"="                   {return 'ASSIGN';}
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
	     console.log("_dbg header rule name: " + header.name + " with arg: " + header.args[0]);
           }

           for(var i=0;i< header.args.length;i++) {
             if(is_debug) {
	       console.log("_dbg header rule name: " + header.name + " adding term: " + header.args[i]);
             }
             header.args[i] = new Term(header.args[i]);
           }
	   while(rules.length > 0) {
	     var body_rule = rules.pop();
             if(is_debug) {
	       console.log("_dbg adding to header body rule name: " + body_rule.name);
               for(var i=0;i< body_rule.args.length;i++) {
	         console.log("  _dbg with arg: " + i + " "+ body_rule.args[i]);

               }
             }
             if(body_rule.name == 'write' && body_rule.args[0]) {
               if(is_debug) {
                 console.log("_dbg write body_rule.args[0]: " + body_rule.args[0]);
               }
               body_rule = new Rule('write(' + body_rule.args[0] + ')');
             }

             if(body_rule.name == 'i' && body_rule.args[0]) {
               if(is_debug) {
                 console.log("_dbg i body_rule.args[0]: " + body_rule.args[0]);
               }
               body_rule = new Rule('i(' + body_rule.args[0] + ')');
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
           console.log("here 10 adding rule: " + $1 + " with arg: " + args[0].name);
         }
         var r = new Rule($1);
         for(var i=0;i<args.length;i++) {
           r.addArg(args[i]); 
         }
         rules.unshift(r);
         args = [];
        }
    | VARIABLE EQCMP string
        {
         $$=$1+$2+$3
         var r = new Rule($$);
         rules.unshift(r);
         if(is_debug) {
           console.log("here 10.1: " + $$);
         }

        }
    | VARIABLE ASSIGN string
        {
         $$=$1+$2+$3
         var r = new Rule($$);
         rules.unshift(r);
         if(is_debug) {
           console.log("here 10.2: " + $$);
         }

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
    : atom
        {
         if(is_debug) {
           console.log("here 14 1: " + $1);
         }
         $$ = $1;
         args.push($1);
        }
    | VARIABLE
        {
         if(is_debug) {
           console.log("here 15 1: " + $1);
         }
         $$ = $1;
         args.push($1);
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
    : SMALLATOM
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
