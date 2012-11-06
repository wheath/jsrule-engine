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
    if(this.is_query() && this.rule_args[0].grounded == this.args[0].name) {
      this.proven = true;
    }  

    /*
    if(this.rule_args[0].grounded) {
      this.solutions.push(this.args[0].name);
    } 
    */            
  }  
}

Types.registerType('Rule', Rule);
