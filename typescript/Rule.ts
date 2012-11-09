class Rule {
  public name: string;
  public args: any[] = [];
  public rules: Rule[] = [];

  public rule_args:any[] = [];
  public solutions:any[] = [];
  proven: bool;
  
  constructor(name: string) {
    this.name = name;
    this.proven = false;
  }

  deepcopy() {
    var rule_copy = new Rule(this.name);
    //for (var i in this.args) {
    for (var i=0;i< this.args.length;i++) {
      rule_copy.args.unshift(this.args[i].deepcopy());
    }

    //for (var i in this.rule_args) {
    for (var i=0;i< this.rule_args.length;i++) {
      rule_copy.rule_args.unshift(this.rule_args[i].deepcopy());
    }

    //for (var r in this.rules) {
    for (var r=0;r< this.rules.length;r++) {
      var call_copy = new Rule(this.rules[r].name);
      //for (var a in r.args) {
      for (var a=0;a< this.rules[r].args.length;a++) {
	call_copy.args.unshift(this.rules[r].args[a].deepcopy());
      }

      rule_copy.rules.unshift(call_copy);
    }

    rule_copy.proven = this.proven;
    rule_copy.solutions = this.solutions;

    return rule_copy;
  }

  addArg(arg: any) {
    this.args.push(arg);
  }

  addRule(rule: Rule) {
    this.rules.push(rule);
  }

  entangle(rule: Rule) {
    this.rule_args = rule.args;
  }

  is_query() {
    return !this.rules.length;
  }

  afterFire() {
    //TODO: match more then one arg if necessary and add to solutions if
    //variable supplied to query
    if(this.is_query()) {
      if(RuleEngine.getTypeName(this.args[0]) == 'Atom') {
	if(this.rule_args[0].grounded == this.args[0].name) {
	  this.proven = true;
	}
      }    

      if(RuleEngine.getTypeName(this.args[0]) == 'Term') {
	if(this.rule_args[0].grounded) {
	  this.solutions.push(this.rule_args[0].grounded);
	}
      }    
    }  

    /*
    if(this.rule_args[0].grounded) {
      this.solutions.push(this.args[0].name);
    } 
    */            
  }  
}

Types.registerType('Rule', Rule);
