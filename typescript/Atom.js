var Atom = (function () {
    function Atom(name) {
        this.name = name;
    }
    return Atom;
})();
Types.registerType('Atom', Atom);
