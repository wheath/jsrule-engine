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
