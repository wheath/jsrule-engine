var Rule = (function () {
    function Rule(name) {
        this.args = [];
        this.rules = [];
        this.solutions = [];
        this.name = name;
        this.proven = false;
    }
    Rule.prototype.deepcopy = function () {
        var rule_copy = new Rule(this.name);
        for(var i = 0; i < this.args.length; i++) {
            rule_copy.args.unshift(this.args[i].deepcopy());
        }
        for(var r = 0; r < this.rules.length; r++) {
            var call_copy = new Rule(this.rules[r].name);
            for(var a = 0; a < this.rules[r].args.length; a++) {
                call_copy.args.unshift(this.rules[r].args[a].deepcopy());
            }
            rule_copy.rules.unshift(call_copy);
        }
        rule_copy.proven = this.proven;
        rule_copy.solutions = this.solutions;
        return rule_copy;
    };
    Rule.prototype.addArg = function (arg) {
        this.args.push(arg);
    };
    Rule.prototype.addRule = function (rule) {
        this.rules.push(rule);
    };
    Rule.prototype.is_query = function () {
        return !this.rules.length;
    };
    return Rule;
})();
Types.registerType('Rule', Rule);
