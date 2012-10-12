var Atom = (function () {
    function Atom(name) {
        this.name = name;
    }
    return Atom;
})();
var Fact = (function () {
    function Fact(name) {
        this.atoms = [];
        this.name = name;
    }
    Fact.prototype.addAtom = function (atom) {
        this.atoms.push(atom);
    };
    return Fact;
})();
var Query = (function () {
    function Query(name) {
        this.args = [];
        this.name = name;
    }
    Query.prototype.addArg = function (arg) {
        this.args.push(arg);
    };
    return Query;
})();
var Term = (function () {
    function Term(name) {
        this.name = name;
    }
    return Term;
})();
var Rule = (function () {
    function Rule(name) {
        this.args = [];
        this.rules = [];
        this.name = name;
    }
    Rule.prototype.addArg = function (arg) {
        this.args.push(arg);
    };
    Rule.prototype.addRule = function (rule) {
        this.rules.push(rule);
    };
    return Rule;
})();
var RuleEngine = (function () {
    function RuleEngine() {
        this.rules = [];
        this.facts = [];
    }
    RuleEngine.prototype.addRule = function (rule) {
        this.rules.push(rule);
    };
    RuleEngine.prototype.addFact = function (fact) {
        this.facts.push(fact);
    };
    RuleEngine.prototype.query = function (q) {
        console.log('_dbg query called');
        return 0;
    };
    return RuleEngine;
})();
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
