
//import fs = module('fs');

/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>
//var fs = require('fs');

declare var require: any;

class RuleEngine {
  private rules : Rule[] = [];
  private static choices : any[] = [];

  public addRule(rule: Rule) {
    //this.rules.push(rule);
    this.rules.unshift(rule);
  }

  public static getTypeName(inst: any) {
    var typeName = undefined;
    for (var clsName in Types.types) {
      /* console.log("_dbg clsName: "+ clsName +"\n"); */
      if (inst instanceof Types.types[clsName]) {
        typeName = clsName;
      }
    }

    return typeName;
  }

  public findArg(name: string, args: any[]) {
    for(var i=0; i < args.length; i++) {
      if(name == args[i].name) {
        return args[i];
      }   
    }
  }

  public backTrack() {
    var is_backTracked = false;
    var found_choice = undefined;
    while(!is_backTracked) {
      if(RuleEngine.choices.length > 0) {
        var choice_or_term = RuleEngine.choices.pop();
        if(RuleEngine.getTypeName(choice_or_term) == 'Term') {
          choice_or_term.reset();
        } else if(RuleEngine.getTypeName(choice_or_term) == 'Choice') {
          found_choice = choice_or_term;
          is_backTracked = true;
        } else {
          throw new TypeError("BackTrack error, unknown type popped from choice point stack");
        }
      } else {
        is_backTracked = true;
      }

    }

    if(found_choice) {
      var rule_copy = this.prepareToFire(found_choice.query, found_choice.rule);
      this.fireRule(rule_copy);
    } else {
      console.log("_dbg backTrack found no choices to fire on choice point stack");
    }
  }

  public isArgsMatch(args1: any[], args2: any[]) {
    var match = true;

    if (args1.length == args2.length) {
      console.log("_dbg num args match\n");
	/* TODO: handle grounding and entangling of logical variables */
    } else {
      match=false;
    }
     
    return match;  
  }

  public searchRules(rules: Rule[], name: string, args: any[]):Rule[] {
    console.log("_dbg in searchRules\n");
    console.log("_dbg num rules searching: " + rules.length + "\n");
    console.log("_dbg searching for name: " + name + "\n");
    var foundRules = [];
    for (var i in rules) {
      console.log("_dbg rule name: " + rules[i].name + "\n");
      if (name == rules[i].name) {
        console.log("_dbg found rule\n");
        if(this.isArgsMatch(rules[i].args, args)) {
          console.log("_dbg args match\n");
          foundRules.push(rules[i]);
        }
      }
    }

    return foundRules;
  }

  public unifyRuleHeaders(r1: Rule, r2: Rule) {
    console.log("_dbg in unifyRuleHeaders");
    for(var i=0;i < r1.args.length; i++) {
      if(RuleEngine.getTypeName(r1.args[i]) == 'Term') {
        console.log("_dbg calling unify on r1");
        r1.args[i].unify(r2.args[i]);
        console.log("_dbg r1.args[i].grounded type: " + RuleEngine.getTypeName(r1.args[i].grounded));
      } else if(RuleEngine.getTypeName(r2.args[i]) == 'Term') {
        console.log("_dbg calling unify on r2");
        r2.args[i].unify(r1.args[i]);
      }
    }
    console.log("_dbg exiting unifyRuleHeaders");
  }

  public handleFoundRules(query: Rule, foundRules: Rule[]) {
    for(var i=1; i <foundRules.length;i++) {
      var choice = new Choice(query, foundRules[i]);
      RuleEngine.choices.push(choice);
    }
  }

  public prepareToFire(query: Rule, rule: Rule) {
    var rule_copy = rule.deepcopy();
    this.unifyRuleHeaders(query, rule_copy);

    return rule_copy;
  }

  public handleNonCallBodyRule(header:Rule, bodyRule: Rule):bool {
    console.log("_dbg in handleNonCallBodyRule\n");
    var is_fail = false;
    if(bodyRule.name.indexOf('==') > -1) {
      var n = bodyRule.name.split('==');
      //console.log("_dbg n: "+ JSON.stringify(n) +"\n");
      //console.log("_dbg num args: "+ r.args.length +"\n");
      
      var arg = this.findArg(n[0], header.args);
      console.log("_dbg arg name: "+ arg.name +"\n");
      //arg.unify(n[1]);
      if(arg.getGrounded() != n[1]) {
        is_fail = true;
      }
    } else if(bodyRule.name.indexOf('=') > -1) {
      //TODO: this only allows assignment X=1 not 1=X
      var n = bodyRule.name.split('=');
      //console.log("_dbg n: "+ JSON.stringify(n) +"\n");
      //console.log("_dbg num args: "+ r.args.length +"\n");
      
      var arg = this.findArg(n[0], header.args);
      console.log("_dbg arg name: "+ arg.name +"\n");
      arg.unify(n[1]);
    } else if(bodyRule.name.indexOf('!') > -1) {
      console.log("_dbg executing cut, emptying choice points");
      RuleEngine.choices = [];
    } else if(bodyRule.name.indexOf('fail') > -1) {
      console.log("_dbg executing fail");
      is_fail = true;
    } else if(bodyRule.name.indexOf('o(') > -1) {
      var r = /^o\((.*)\)/;
      console.log(bodyRule.name.match(r)[1]);
    } else if(bodyRule.name.indexOf('i(') > -1) {
      var r = /^i\((.*)\)/;
      var arg_name = bodyRule.name.match(r)[1];
      console.log("_dbg input into varible: " + arg_name);
      var fs = require('fs');
      var input_str = fs.readFileSync('/dev/stdin', 'utf-8')
      var arg = this.findArg(arg_name, header.args);
      //var input_str = '';
      console.log("_dbg unifying value: " + input_str + " with arg name: " + arg.name);
      arg.unify(input_str);
    }

    return is_fail;
  }

  public handleBodyRules(header: Rule, bodyRules: Rule[]):bool {
    var is_fail = false;
    for (var l in bodyRules) {
      var bodyRule = bodyRules[l];
      if(!bodyRule.is_non_call()) {
        console.log("_dbg processing rule name: "+ bodyRule.name +" as a call");
        var foundRules = this.searchRules(this.rules, bodyRule.name, bodyRule.args); 
	console.log("_dbg num rules found: " + foundRules.length + "\n");
        this.handleFoundRules(bodyRule, foundRules);
        if(foundRules.length) {
          var rule_copy = this.prepareToFire(bodyRule, foundRules[0]);
          this.fireRule(rule_copy);
        }
        
      } else {
        console.log("_dbg processing rule name: " + bodyRule.name);
        is_fail = this.handleNonCallBodyRule(header, bodyRule);
        if(is_fail) {
          console.log("_dbg failure occurred executing body rule with name: " + bodyRule.name);
          break;
        }   
      }

    }
    return is_fail;
  }

  public fireRule(r: Rule) {

    console.log("_dbg firing rule: " + r.name + "\n");
    console.log("_dbg1 r.args[0]: " + RuleEngine.getTypeName(r.args[0])); 
    if(r.is_query()) {
      console.log("_dbg executing query rule: " + r.name + "\n");
      var foundRules = this.searchRules(this.rules, r.name, r.args); 
      console.log("_dbg num rules found: " + foundRules.length + "\n");

      this.handleFoundRules(r, foundRules);

      if(foundRules.length) {
        var rule_copy = this.prepareToFire(r, foundRules[0]);
        this.fireRule(rule_copy);
      }

      console.log("_dbg r.args[0]: " + RuleEngine.getTypeName(r.args[0])); 
      console.log("_dbg r.args[0] val: " + r.args[0].getGrounded()); 
      console.log("_dbg pushing solution r.args[0] val: " + r.args[0].getGrounded()); 
    }

    var is_fail = this.handleBodyRules(r, r.rules);

    if(is_fail) {
      console.log("_dbg fail detected in bodyRules execution, backtracking...");
      this.backTrack();
    }
  }

}


  
