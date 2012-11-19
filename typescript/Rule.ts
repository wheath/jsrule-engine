class Rule {
  public name: string;
  public args: any[] = [];
  public rules: Rule[] = [];
  private non_call_regex =  /=|fail|!|o\(|i\(/;

  public solutions:any[] = [];
  proven: bool;
  
  constructor(name: string) {
    this.name = name;
    this.proven = false;
  }

  deepcopy() {
    var rule_copy = new Rule(this.name);
    for (var i=0;i< this.args.length;i++) {
      rule_copy.args.unshift(this.args[i].deepcopy());
    }

    for (var r=0;r< this.rules.length;r++) {
      var call_copy = new Rule(this.rules[r].name);
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
    //this.rules.push(rule);
    this.rules.unshift(rule);
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
