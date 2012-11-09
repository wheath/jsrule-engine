class Term {
  public name: string;
  public grounded: any;

  constructor(name: string) {
    this.name = name;
    this.grounded = this;
  }

  public deepcopy() {
    var term_copy = new Term(this.name);
    term_copy.name = this.name;
    if(!this.isGrounded()) {
      term_copy.grounded = this.grounded;
    } else {
      term_copy.grounded = term_copy;
    }

    return term_copy;
  }

  public isGrounded():bool {
    if(this.grounded == this) {
      return false;
    } else {
      return true;
    }
  }

  public setVal(val: any):void {
    if(!this.isGrounded()) {
      console.log("_dbg about to set Term with name: " + this.name + ' to val: ' + val + "\n");
      this.grounded = val;
    } else {
      throw new TypeError( "Term is grounded cannot assign");
    }
  }

}

Types.registerType('Term', Term);
