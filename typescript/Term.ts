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

  public isBoundorAliased():bool {
     var ret_val = false;
     /*
     console.log("_dbg in isBoundorAliased");
     console.log("_dbg in Term name: " + this.name);
     */
     if(RuleEngine.getTypeName(this.grounded) == 'Atom') {
       ret_val = true;
     }

     if(RuleEngine.getTypeName(this.grounded) == 'Term') {
       ret_val = true;
     }

     return ret_val;
  }

  public isFree():bool {
    if(this.grounded == this) {
      return true;
    } else {
      return false;
    }
  }

  public isGrounded():bool {
    var is_grounded = true;
    if(this.grounded == this) {
      is_grounded = false;
    } else if(this.isBoundorAliased()) {
      is_grounded = this.grounded.isGrounded();
    }
    return is_grounded;
  }

  public reset() {
    this.grounded = this;
  }

  public unify(t: any):bool {
    if(is_debug) {
      console.log("_dbg in unify");
      console.log("_dbg this.name: " + this.name);
      console.log("_dbg t type: " + RuleEngine.getTypeName(t));
      if(RuleEngine.getTypeName(t)) {
        console.log("_dbg value: " + t);
      }

    }
    var unified = false;

    if(this.isFree()) {
      if(is_debug) {
        console.log("_dbg term is free, assigning grounded");
        if(RuleEngine.getTypeName(t)) {
          console.log("_dbg to Term with name: " + t.name);
        }
      }
      this.grounded = t;
      unified = true;
    } else if(this.isBoundorAliased()) {
      unified = this.grounded.unify(t);  
    } else {
      unified = false;
    }

    if(unified) {
      RuleEngine.choices.push(this);
    }

    return unified;
  }

  public getGrounded():any {
    if(is_debug) {
      console.log("_dbg in getGrounded()");
    }
    if(this.isFree()) {
      return this;
    }
    var ret_val = this.grounded;
    if(this.isBoundorAliased()) {
      if(is_debug) {
        console.log("_dbg aliased or bounded, searching chain...");
        console.log("_dbg aliased or bounded from: " + ret_val.name);
      }
      ret_val = this.grounded.getGrounded();  
      if(is_debug) {
        console.log("_dbg aliased or bounded to: " + ret_val.name);
      }
    }

    return ret_val;
  }

}

Types.registerType('Term', Term);
