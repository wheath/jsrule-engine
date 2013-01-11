/// <reference path="Util.ts"/>
/// <reference path="Types.ts"/>
/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>
/// <reference path="Choice"/>

class RuleEngine {
  private rules : Rule[] = [];
  private static choices : any[] = [];
  private body_rules : any[] = [];
  public rule_firing: Rule;
  public body_rule_firing: Rule;
  public async_hold: bool = false;

  public addBodyRule(rule: Rule) {
    //this.rules.push(rule);
    this.body_rules.unshift(rule);
  }

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
    this.rule_firing = undefined;
    this.body_rule_firing = undefined;
    this.body_rules = [];

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
      if(is_debug) {
        console.log("_dbg backTrack found no choices to fire on choice point stack");
      }
    }
  }

  public isArgsMatch(args1: any[], args2: any[]) {
    var match = true;

    if (args1.length == args2.length) {
      if(is_debug) {
        console.log("_dbg num args match\n");
      }
	/* TODO: handle grounding and entangling of logical variables */
    } else {
      match=false;
    }
     
    return match;  
  }

  public searchRules(rules: Rule[], name: string, args: any[]):Rule[] {
    if(is_debug) {
      console.log("_dbg in searchRules\n");
      console.log("_dbg num rules searching: " + rules.length + "\n");
      console.log("_dbg searching for name: " + name + "\n");
    }
    var foundRules = [];
    for (var i in rules) {
      if(is_debug) {
        console.log("_dbg rule name: " + rules[i].name + "\n");
      }
      if (name == rules[i].name) {
        if(is_debug) {
          console.log("_dbg found rule\n");
        }
        if(this.isArgsMatch(rules[i].args, args)) {
          if(is_debug) {
            console.log("_dbg args match\n");
          }
          foundRules.push(rules[i]);
        }
      }
    }

    return foundRules;
  }

  public unifyRuleHeaders(r1: Rule, r2: Rule) {
    if(is_debug) {
      console.log("_dbg in unifyRuleHeaders");
    }
    for(var i=0;i < r1.args.length; i++) {
      if(RuleEngine.getTypeName(r1.args[i]) == 'Term') {
        if(is_debug) {
          console.log("_dbg calling unify on r1");
        }
        r1.args[i].unify(r2.args[i]);
        if(is_debug) {
          console.log("_dbg r1.args[i].grounded type: " + RuleEngine.getTypeName(r1.args[i].grounded));
        }
      } else if(RuleEngine.getTypeName(r2.args[i]) == 'Term') {
        if(is_debug) {
          console.log("_dbg calling unify on r2");
        }
        r2.args[i].unify(r1.args[i]);
      }
    }
    if(is_debug) {
      console.log("_dbg exiting unifyRuleHeaders");
    }
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

  public handleAsyncInput(input_str) {
    this.async_hold = false;
    
    var header = this.rule_firing;
    var bodyRule = this.body_rule_firing;

    var r = /^i\((.*)\)/;
    var arg_name = bodyRule.name.match(r)[1];
    

    console.log("\n");
    var arg = this.findArg(arg_name, header.args);
    if(!arg) {
      arg = this.findArg(arg_name, header.b_args);
    }

    if(!arg) {
      if(is_debug) {
	console.log("_dbg Term variable with name: " + arg_name + " not found, creating and adding to body args of header rule");
      }
      arg = new Term(arg_name);
      header.addBarg(arg);
    }

    if(is_debug) {
      console.log("_dbg unifying value: " + input_str + " with arg name: " + arg.name);
    }
    arg.unify(input_str);

    this.handleNonCallAsync(false);

  }

  public handleNonCallBodyRule(header:Rule, bodyRule: Rule) {
    if(is_debug) {
      console.log("_dbg in handleNonCallBodyRule\n");
    }
    var is_fail = false;
    if(bodyRule.name.indexOf('==') > -1) {
      var n = bodyRule.name.split('==');
      //console.log("_dbg n: "+ JSON.stringify(n) +"\n");
      //console.log("_dbg num args: "+ r.args.length +"\n");
      
      var arg = this.findArg(n[0], header.args);
      if(!arg) {
        arg = this.findArg(n[0], header.b_args);
      }

      if(is_debug) {
        console.log("_dbg arg name: "+ arg.name +"\n");
      }

      if(arg.getGrounded() != n[1]) {
        is_fail = true;
      }
    } else if(bodyRule.name.indexOf('=') > -1) {
      //TODO: this only allows assignment X=1 not 1=X
      var n = bodyRule.name.split('=');
      //console.log("_dbg n: "+ JSON.stringify(n) +"\n");
      //console.log("_dbg num args: "+ r.args.length +"\n");
      
      var arg = this.findArg(n[0], header.args);
      if(!arg) {
        arg = this.findArg(n[0], header.b_args);
      }

      if(!arg) {
        if(is_debug) {
          console.log("_dbg Term variable with name: " + n[0] + " not found, creating and adding to body args of header rule");
        }
        arg = new Term(n[0]);
        header.addBarg(arg);
      }
      if(is_debug) {
        console.log("_dbg arg name: "+ arg.name +"\n");
      }
      arg.unify(n[1]);
    } else if(bodyRule.name.indexOf('!') > -1) {
      console.log("_dbg executing cut, emptying choice points");
      RuleEngine.choices = [];
    } else if(bodyRule.name.indexOf('fail') > -1) {
      if(is_debug) {
        console.log("_dbg executing fail");
      }
      is_fail = true;
    } else if(bodyRule.name.indexOf('o(') > -1) {
      var r = /^o\((.*)\)/;
      Util.output(bodyRule.name.match(r)[1]);
    } else if(bodyRule.name.indexOf('i(') > -1) {
      var r = /^i\((.*)\)/;
      var arg_name = bodyRule.name.match(r)[1];
      if(is_debug) {
        console.log("_dbg input into varible: " + arg_name);
      }

      Util.input(this);
    }

    this.handleNonCallAsync(is_fail);
  }

  public prepareToCall(call_rule: Rule) {
    if(is_debug) {
      console.log("_dbg processing rule name: "+ call_rule.name +" as a call");
    }
    var foundRules = this.searchRules(this.rules, call_rule.name, call_rule.args); 
    if(is_debug) {
      console.log("_dbg num rules found: " + foundRules.length + "\n");
    }
    this.handleFoundRules(call_rule, foundRules);
    if(foundRules.length) {
      var rule_copy = this.prepareToFire(call_rule, foundRules[0]);
      return rule_copy;
    }

  }

  public handleNonCallAsync(is_fail) {
    if(is_debug) {
      console.log("_dbg in handleNonCallAsync");
    }

    if(!this.async_hold) {
      if(is_fail) {
	if(is_debug) {
	  console.log("_dbg fail detected in bodyRules execution, backtracking...");
	}
	this.backTrack();
      }

      if(is_debug) {
        console.log("_dbg about to pop a body rule");
        console.log("_dbg this.body_rules.length: " + this.body_rules.length);
      }

      this.body_rule_firing = this.body_rules.pop();
      this.handleBodyRule();
    }
  }

  public handleBodyRule() {
    //for (var l in bodyRules) {
      var header = this.rule_firing;
      var bodyRule = this.body_rule_firing;
      if(!bodyRule) {
        return;
      }
      if(!bodyRule.is_non_call()) {
        var rule_copy = this.prepareToCall(bodyRule);
        this.fireRule(rule_copy);
      } else {
        if(is_debug) {
          console.log("_dbg processing non call rule name: " + bodyRule.name);
        }   
        this.handleNonCallBodyRule(header, bodyRule);
      }

    //}
  }

  public fireRule(r: Rule) {
    this.rule_firing = r;

    if(is_debug) {
      console.log("_dbg firing rule: " + r.name + "\n");
      console.log("_dbg1 r.args[0]: " + RuleEngine.getTypeName(r.args[0])); 
    }

    if(r.is_query()) {
      if(is_debug) {
        console.log("_dbg executing query rule: " + r.name + "\n");
      }
      var rule_copy = this.prepareToCall(r);
      this.fireRule(rule_copy);

      if(is_debug) {
        console.log("_dbg r.args[0]: " + RuleEngine.getTypeName(r.args[0])); 
        console.log("_dbg r.args[0] val: " + r.args[0].getGrounded()); 
        console.log("_dbg pushing solution r.args[0] val: " + r.args[0].getGrounded()); 
      }
    }

    for (var l in r.rules) {
      var bodyRule = r.rules[l];
      this.addBodyRule(bodyRule);
    }

    this.body_rule_firing = this.body_rules.pop();

    this.handleBodyRule();
  }

  public isQuerySolved(r_args: any[]) {
    var is_solved = true;
    for(var i=0; i < r_args.length; i++) {
      if(!r_args[i].isGrounded()) {
        is_solved = false;
      }   
    }

    return is_solved;
  }

/*
  public handleQueryResult(q: Rule) {
    if(this.isQuerySolved(q.args)) { 
      Util.output('Query: ' + q.name + ' was solved, solutions are: \n');

      for(var i=0; i < q.args.length; i++) {
        Util.output('arg name: ' + q.args[i].name + ' ground val: ' + q.args[i].getGrounded() + '\n');
      }   
    } else {
      Util.output('Query: ' + q.name + ' was not solved');
    }

    if(RuleEngine.choices.length >0) {
      Util.output('There are other possible solutions, should the solver continue?\n');
      if(Util.input() == 'yes') {
        this.backTrack();
        this.handleQueryResult(q);
      }
    }

  }
*/

}


  
