class Term {
  public name: string;
  public grounded: any;

  constructor(name: string) {
    this.name = name;
    this.grounded = this;
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
