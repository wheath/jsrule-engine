class Choice {
  public index: number;
  public query: Rule;
  public rule: Rule;
  public body_rules: any[] = [];

  constructor(query: Rule, rule: Rule, body_rules: any[]) {
    this.query = query;
    this.rule = rule;
    this.body_rules = body_rules;
  }
}

Types.registerType('Choice', Choice);
