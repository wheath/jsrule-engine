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
