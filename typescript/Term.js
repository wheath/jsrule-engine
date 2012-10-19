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
