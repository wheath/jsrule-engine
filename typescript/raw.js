var Types = (function () {
    function Types() { }
    Types.types = [];
    Types.registerType = function registerType(clsName, classDcl) {
        Types.types[clsName] = classDcl;
    }
    return Types;
})();
var Atom = (function () {
    function Atom(name) {
        this.name = name;
    }
    return Atom;
})();
Types.registerType('Atom', Atom);
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
Types.registerType('Fact', Fact);
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
Types.registerType('Query', Query);
var Term = (function () {
    function Term(name) {
        this.name = name;
        this.grounded = this;
    }
    Term.prototype.isGrounded = function () {
        if(this.grounded == this) {
            return false;
        } else {
            return true;
        }
    };
    Term.prototype.setVal = function (val) {
        if(!this.isGrounded()) {
            console.log("_dbg about to set Term with name: " + this.name + ' to val: ' + val + "\n");
            this.grounded = val;
        } else {
            throw new TypeError("Term is grounded cannot assign");
        }
    };
    return Term;
})();
Types.registerType('Term', Term);
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
Types.registerType('Rule', Rule);
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
    RuleEngine.prototype.getTypeName = function (inst) {
        var typeName = undefined;
        for(var clsName in Types.types) {
            if(inst instanceof Types.types[clsName]) {
                typeName = clsName;
            }
        }
        return typeName;
    };
    RuleEngine.prototype.isArgsMatch = function (args1, args2) {
        var match = true;
        if(args1.length == args2.length) {
            console.log("_dbg num args match\n");
        } else {
            match = false;
        }
        return match;
    };
    RuleEngine.prototype.searchRules = function (rules, name, args) {
        var foundRules = [];
        for(var i in rules) {
            console.log("_dbg rule name: " + rules[i].name + "\n");
            if(name == rules[i].name) {
                console.log("_dbg found rule\n");
                if(this.isArgsMatch(rules[i].args, args)) {
                    console.log("_dbg args match\n");
                    foundRules.push(rules[i]);
                }
            }
        }
        return foundRules;
    };
    RuleEngine.prototype.searchFacts = function (name) {
        console.log("_dbg searching for facts with name: " + name + "\n");
        var foundFacts = [];
        for(var i in this.facts) {
            if(name == this.facts[i].name) {
                foundFacts.push(this.facts[i]);
            }
        }
        return foundFacts;
    };
    RuleEngine.prototype.fireRule = function (r) {
        console.log("_dbg firing rule: " + r.name + "\n");
        for(var l in r.rules) {
            var foundRules = this.searchRules(this.rules, r.rules[l].name, r.rules[l].args);
            if(foundRules.length > 0) {
            } else {
                console.log("_dbg searching for facts with name: " + r.rules[l].name + "\n");
                var foundFacts = this.searchFacts(r.rules[l].name);
                console.log("_dbg num foundFacts found: " + foundFacts.length + "\n");
                for(var i in foundFacts) {
                    console.log("_dbg processing fact name: " + foundFacts[i].name + "\n");
                    for(var j in r.rules[l].args) {
                        if(this.getTypeName(r.rules[l].args[j]) == 'Term') {
                            for(var m in foundFacts[i].atoms) {
                                r.rules[l].args[j].setVal(foundFacts[i].atoms[m].name);
                            }
                        }
                    }
                }
            }
            this.fireRule(r.rules[l]);
        }
    };
    RuleEngine.prototype.query = function (q) {
        var result = false;
        var foundRules = this.searchRules(this.rules, q.name, q.args);
        for(var i in foundRules) {
            console.log("_dbg about to fire rule with name: " + foundRules[i].name + "\n");
            this.fireRule(foundRules[i]);
            if(foundRules[i].args[0].grounded == q.args[0].name) {
                result = true;
            }
        }
        return result;
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
var query1 = new Query('mortal');
var a2 = new Atom('aristotle');
query1.addArg(a2);
var query_result = re.query(query1);
console.log("_dbg query_result: " + query_result + "\n");
