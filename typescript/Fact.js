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
