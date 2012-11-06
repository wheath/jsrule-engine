class Query {
  name: string;
  args:any[] = [];
  rule_args:any[] = [];
  solutions:any[] = [];
  proven: bool;

  constructor(name: string) {
    this.name = name;
    this.proven=false;
  }

  entangle(rule: Rule) {
    this.rule_args = rule.args;    
  }

  afterFire() {
    //TODO: match more then one arg if necessary and add to solutions if
    //variable supplied to query
    if(this.rule_args[0].grounded == this.args[0].name) {
      this.proven = true;
    }
  }

  addArg(arg: any) {
    this.args.push(arg);
  }


}
Types.registerType('Query', Query);
