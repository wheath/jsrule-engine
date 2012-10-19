/*
Implementing example:

mortal(X) :-
human(X).
human(socrates).

*/

/// <reference path="RuleEngine.ts"/>
/// <reference path="Atom.ts"/>
/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>
/// <reference path="Query.ts"/>


var re = new RuleEngine();
var mortal_rule = new Rule('mortal');
var term_X = new Term('X');
mortal_rule.addArg(term_X);
var human_rule = new Rule('human');
human_rule.addArg(term_X);
mortal_rule.addRule(human_rule);
var a1 = new Atom('socrates');
var human_fact = new Fact('human');
human_fact.addAtom(a1);
re.addFact(human_fact);
re.addRule(mortal_rule);

var query1 = new Query('mortal');
var a2 = new Atom('aristotle');
//var a2 = new Atom('socrates');
query1.addArg(a2);
var query_result = re.query(query1);
console.log("_dbg query_result: " + query_result + "\n");
