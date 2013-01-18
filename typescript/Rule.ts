class Rule {
  public name: string;
  public args: any[] = []; //args defined in the rule head
  public b_args: any[] = []; //args defined in rule body dynamically
  public rules: Rule[] = [];
  private non_call_regex =  /=|fail|!|o\(|i\(/;

  public solutions:any[] = [];
  proven: bool;
  
  constructor(name: string) {
    this.name = name;
    this.proven = false;
  }

  deepcopy() {
    if(is_debug) {
      console.log("_dbg in Rule.deepcopy");
    }
    var rule_copy = new Rule(this.name);
    for (var i=0;i< this.args.length;i++) {
      if(is_debug) {
        console.log("_dbg about to call deepcopy on arg with name: " + this.args[i].name);
      }
      //rule_copy.args.unshift(this.args[i].deepcopy());
      rule_copy.args.push(this.args[i].deepcopy());
    }

    for (var r=0;r< this.rules.length;r++) {
      var call_copy = new Rule(this.rules[r].name);
      for (var a=0;a< this.rules[r].args.length;a++) {
	//call_copy.args.unshift(this.rules[r].args[a].deepcopy());
	call_copy.args.push(this.rules[r].args[a].deepcopy());
      }

      for (var b=0;b< this.rules[r].b_args.length;b++) {
	//call_copy.b_args.unshift(this.rules[r].b_args[b].deepcopy());
	call_copy.b_args.push(this.rules[r].b_args[b].deepcopy());
      }

      rule_copy.rules.unshift(call_copy);
    }

    rule_copy.proven = this.proven;
    rule_copy.solutions = this.solutions;

    if(is_debug) {
      console.log("_dbg about to return from Rule.deepcopy");
    }
    return rule_copy;
  }

  addArg(arg: any) {
    this.args.push(arg);
    //this.args.unshift(arg);
  }

  addBarg(b_arg: any) {
    this.b_args.push(b_arg);
  }

  addRule(rule: Rule) {
    this.rules.push(rule);
    //this.rules.unshift(rule);
  }

  is_query() {
    return !this.rules.length && 
           this.args.length &&
           !this.non_call_regex.test(this.name);
  }

  is_non_call() {
    return !this.rules.length && 
           !this.args.length && 
           this.non_call_regex.test(this.name);
  }

}

Types.registerType('Rule', Rule);
