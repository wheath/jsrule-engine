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
