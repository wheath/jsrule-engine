var Types = (function () {
    function Types() { }
    Types.types = [];
    Types.registerType = function registerType(clsName, classDcl) {
        Types.types[clsName] = classDcl;
    }
    return Types;
})();
