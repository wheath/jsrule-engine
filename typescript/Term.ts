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
    console.log("_dbg in unify");
    console.log("_dbg t.name: " + t.name);
    console.log("_dbg t type: " + RuleEngine.getTypeName(t));
    var unified = false;

    if(this.isFree()) {
      console.log("Term is free, assigning grounded");
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
    console.log("_dbg in getGrounded()");
    if(this.isFree()) {
      return this;
    }
    var ret_val = this.grounded;
    if(this.isBoundorAliased()) {
      console.log("_dbg aliased or bounded, searching chain...");
      ret_val = this.grounded.getGrounded();  
    }

    return ret_val;
  }

}

Types.registerType('Term', Term);
