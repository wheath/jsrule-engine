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
var query1 = new Query('human');
query1.addArg(a1);
var query_result = re.query(query1);
