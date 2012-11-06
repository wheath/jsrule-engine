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
//var mortal_rule = new Rule('mortal');
var term_X = new Term('X');
//mortal_rule.addArg(term_X);

var human_rule = new Rule('human');
human_rule.addArg(term_X);
var assignX = new Rule('X=socrates');
human_rule.addRule(assignX);

var q_human = new Rule('human');
//q_human.addArg(term_X);
//mortal_rule.addRule(q_human);
//re.addRule(mortal_rule);
re.addRule(human_rule);

//var query1 = new Query('mortal');
//var a2 = new Atom('aristotle');
var a2 = new Atom('socrates');
//query1.addArg(a2);
q_human.addArg(a2);
//var query_result = re.query(query1);
re.fireRule(q_human);
//re.query(query1);
console.log("_dbg term_X.grounded: " + term_X.grounded + "\n");
console.log("_dbg q_human.args[0].name: " + q_human.args[0].name + "\n");
console.log("_dbg query_result: " + q_human.proven + "\n");
