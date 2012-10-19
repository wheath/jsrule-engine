class Rule {
  public name: string;
  public args: any[] = [];
  public rules: Rule[] = [];
  
  constructor(name: string) {
    this.name = name;
  }

  addArg(arg: any) {
    this.args.push(arg);
  }

  addRule(rule: Rule) {
    this.rules.push(rule);
  }

}

Types.registerType('Rule', Rule);
