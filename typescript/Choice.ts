class Choice {
  public index: number;
  public rule: Rule;
  public query: Rule;

  constructor(query: Rule, rule: Rule) {
    this.query = query;
    this.rule = rule;
  }
}

Types.registerType('Choice', Choice);
