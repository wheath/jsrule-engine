/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>

class RuleEngine {
  private rules : Rule[] = [];
  private facts : Fact[] = [];

  public addRule(rule: Rule) {
    this.rules.push(rule);
  }

  public addFact(fact: Fact) {
    this.facts.push(fact);
  }

  public query(q: Query) {
    console.log('_dbg query called');
    return 0;
  }
}
  
