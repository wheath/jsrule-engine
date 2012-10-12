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
