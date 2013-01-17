/// <reference path="Util.ts"/>
/// <reference path="Types.ts"/>
/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>
/// <reference path="Choice"/>

class RuleEngine {
  private static re_inst : any = 0;
  private static rules : Rule[] = [];
  private static choices : any[] = [];
  private static body_rules : any[] = [];
  public static rule_firing: any;
  public static body_rule_firing: any;
  public static async_hold: bool = false;
  public static base_query: any;
  public static input_cb: any;
  public static finished_cb: any;
  public static more_solutions_prompt: bool = true;

  public static reset() {
     RuleEngine.re_inst = 0;
     RuleEngine.rules = [];
     RuleEngine.choices = [];   
     RuleEngine.body_rules = [];
     RuleEngine.async_hold = false;
     RuleEngine.input_cb = 0;
     RuleEngine.base_query = 0;
     RuleEngine.rule_firing = 0;
     RuleEngine.body_rule_firing = 0; 
     RuleEngine.finished_cb = 0; 
     RuleEngine.more_solutions_prompt = true; 
  }

  public isFinished() {
    var is_finished = false;
    if(RuleEngine.body_rules.length == 0) {
      if(RuleEngine.choices.length == 0) {
        is_finished = true;
      }
    }

    return is_finished;
  }

  public handleBaseQueryFinish() {
    if(RuleEngine.async_hold) {
      return;
    }
    if(is_debug) {
      console.log("_dbg in handleBaseQueryFinish");
    }
    //if(this.rule_firing == this.base_query) {
      if(RuleEngine.body_rules.length == 0) {
        if(is_debug) {
          console.log("_dbg base_query == r, about to call handleQueryResult");
        }
        if(this.isFinished()) {
          if(RuleEngine.finished_cb) {
            RuleEngine.finished_cb();
          }
        }
        this.handleQueryResult();
      }
    //}
  }

  public static getREInst() {
    if(!RuleEngine.re_inst) {
      RuleEngine.re_inst = new RuleEngine();
    }

    return RuleEngine.re_inst;
  }

  public addBodyRule(rule: Rule) {
    //this.rules.push(rule);
    RuleEngine.body_rules.unshift(rule);
  }

  public addRule(rule: Rule) {
    //console.log("_dbg adding rule with name: " + rule.name);
    //console.log("_dbg num rules: " + rule.rules.length);
    //this.rules.push(rule);
    RuleEngine.rules.unshift(rule);
  }

  public static getTypeName(inst: any) {
    //console.log("_dbg in getTypeName");
    var typeName = undefined;
    for (var clsName in Types.types) {
      /* console.log("_dbg clsName: "+ clsName +"\n"); */
      if (inst instanceof Types.types[clsName]) {
        typeName = clsName;
      }
    }

    return typeName;
  }

  public static findArg(name: string, args: any[]) {
    for(var i=0; i < args.length; i++) {
      if(name == args[i].name) {
        return args[i];
      }   
    }
  }

  public backTrack() {
    var is_backTracked = false;
    var found_choice = undefined;
    RuleEngine.rule_firing = undefined;
    RuleEngine.body_rule_firing = undefined;
    RuleEngine.body_rules = [];
    if(is_debug) {
      console.log("_dbg in backTrack");
      console.log("_dbg RuleEngine.choices.length: " + RuleEngine.choices.length);
    }

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
        } else {
          console.log("_dbg args do not match\n");
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
          console.log("_dbg unifying " + r2.args[i].name + " with " + r1.args[i].name);
          console.log("_dbg r1.args[i].grounded type: " + RuleEngine.getTypeName(r1.args[i].grounded));
	  if(r2.args[i].name == 'HDX') {
	    console.log("_dbg r1.args[i].getGrounded: " + r1.args[i].getGrounded());
	    var bq_hd_arg = RuleEngine.base_query.args[1];
	    console.log("_dbg bq_hd_arg name: " + bq_hd_arg.name);
	    console.log("_dbg bq_hd_arg value: " + bq_hd_arg.getGrounded());
	  }
        }
      } else if(RuleEngine.getTypeName(r2.args[i]) == 'Term') {
        if(is_debug) {
          console.log("_dbg calling unify on r2");
        }
        if(is_debug) {
          console.log("_dbg unifying " + r1.args[i].name + " with " + r2.args[i].name);
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
    if(is_debug) {
      console.log("_dbg in prepareToFire");
    }
    var rule_copy = rule.deepcopy();
    this.unifyRuleHeaders(query, rule_copy);

    return rule_copy;
  }

  public popBodyRule() {
    if(!RuleEngine.async_hold) {

      if(is_debug) {
        console.log("_dbg about to pop a body rule");
        console.log("_dbg RuleEngine.body_rules.length: " + RuleEngine.body_rules.length);
      }

      RuleEngine.body_rule_firing = RuleEngine.body_rules.pop();
    }
  }

  public handleAsyncInput(input_str) {
    if(is_debug) {
      console.log("_dbg in handleAsyncInput");
    }
    RuleEngine.async_hold = false;
    var re = RuleEngine.getREInst();
    
    var header = RuleEngine.rule_firing;
    var bodyRule = RuleEngine.body_rule_firing;
    if(bodyRule) {
      if(is_debug) {
        console.log("_dbg bodyRule is defined");
      }
    } else {
      if(is_debug) {
        console.log("_dbg bodyRule is not defined");
      }
    }
    if(is_debug) {
      console.log("_dbg bodyRule.name: " + bodyRule.name);
    }

    var r = /^i\((.*)\)/;
    var arg_name = bodyRule.name.match(r)[1];
    

    console.log("\n");
    var arg = RuleEngine.findArg(arg_name, header.args);
    if(!arg) {
      arg = RuleEngine.findArg(arg_name, header.b_args);
    }

    if(!arg) {
      if(is_debug) {
	console.log("_dbg Term variable with name: " + arg_name + " not found, creating and adding to body args of header rule name:" + header.name);
      }
      arg = new Term(arg_name);
      header.addBarg(arg);
    }

    if(is_debug) {
      console.log("_dbg unifying value: " + input_str + " with arg name: " + arg.name);
    }
    arg.unify(input_str);
    if(is_debug) {
      console.log("_dbg num header.b_args: " + header.b_args.length);
    }

    re.handleNonCallAsync(false);

  }

  public handleNonCallBodyRule(header:Rule, bodyRule: Rule) {
    if(is_debug) {
      console.log("_dbg in handleNonCallBodyRule\n");
      console.log("_dbg header.name: " + header.name);
    }
    var is_fail = false;
    if(bodyRule.name.indexOf('==') > -1) {
      var n = bodyRule.name.split('==');
      if(is_debug) {
        console.log("_dbg n: "+ JSON.stringify(n) +"\n");
        console.log("_dbg num header args: "+ header.args.length +"\n");
        console.log("_dbg num header b_args: "+ header.b_args.length +"\n");
      }   
      
      //console.log("_dbg header.args: "+ JSON.stringify(header.args) +"\n");
      var arg = RuleEngine.findArg(n[0], header.args);
      if(!arg) {
        if(is_debug) {
          console.log("_dbg header.b_args: "+ JSON.stringify(header.b_args) +"\n");
        }
        arg = RuleEngine.findArg(n[0], header.b_args);
      }

      if(is_debug) {
        console.log("_dbg arg name: "+ arg.name +"\n");
        console.log("_dbg == arg.getGrounded(): "+ arg.getGrounded() +"\n");
      }

      if(arg.getGrounded() != n[1]) {
        is_fail = true;
      }
    } else if(bodyRule.name.indexOf('=') > -1) {
      //TODO: this only allows assignment X=1 not 1=X
      var n = bodyRule.name.split('=');
      //console.log("_dbg n: "+ JSON.stringify(n) +"\n");
      //console.log("_dbg num args: "+ r.args.length +"\n");
      
      var arg = RuleEngine.findArg(n[0], header.args);
      if(!arg) {
        arg = RuleEngine.findArg(n[0], header.b_args);
      }

      if(!arg) {
        if(is_debug) {
          console.log("_dbg Term variable with name: " + n[0] + " not found, creating and adding to body args of header rule");
        }
        arg = new Term(n[0]);
        header.addBarg(arg);
      }
      if(is_debug) {
        console.log("_dbg about to unity value: " + n[1] + " with arg name: "+ arg.name +"\n");
      }
      arg.unify(n[1]);
      if(is_debug) {
        if(arg.name == 'HDX') {
          var bq_hd_arg = RuleEngine.base_query.args[1];
          console.log("_dbg bq_hd_arg name: " + bq_hd_arg.name);
          console.log("_dbg bq_hd_arg value: " + bq_hd_arg.getGrounded());
        }
      }
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

      Util.input(this.handleAsyncInput);
    }

    if(is_debug) {
      console.log("_dbg about to call handleNonCallAsync");
      console.log("_dbg is_fail: " + is_fail);
    }
    this.handleNonCallAsync(is_fail);
  }

  public prepareToCall(call_rule: Rule) {
    if(is_debug) {
      console.log("_dbg processing rule name: "+ call_rule.name +" as a call");
    }
    var foundRules = this.searchRules(RuleEngine.rules, call_rule.name, call_rule.args); 
    if(is_debug) {
      console.log("_dbg num rules found: " + foundRules.length + "\n");
    }
    this.handleFoundRules(call_rule, foundRules);
    if(foundRules.length) {
      if(is_debug) {
        console.log("_dbg foundRules[0].rules.length: " + foundRules[0].rules.length);
      }
      var rule_copy = this.prepareToFire(call_rule, foundRules[0]);
      return rule_copy;
    }

  }

  public handleNonCallAsync(is_fail) {
    if(is_debug) {
      console.log("_dbg in handleNonCallAsync");
      console.log("_dbg RuleEngine.async_hold: " + RuleEngine.async_hold);
      if(RuleEngine.rule_firing.b_args.length > 0) {
        console.log("RuleEngine.rule_firing.b_args[0].getGrounded(): " + RuleEngine.rule_firing.b_args[0].getGrounded());

      }
    }

    if(RuleEngine.async_hold) {
      return;
    }

    if(!RuleEngine.async_hold) {
     
      if(is_debug) {
        console.log("_dbg RuleEngine.async_hold is false");
      }
      if(is_fail) {
	if(is_debug) {
	  console.log("_dbg fail detected in bodyRules execution, backtracking...");
	}
	this.backTrack();
      } 

      
      this.popBodyRule();
      if(is_debug) {
        console.log("_dbg about to call handleBodyRule");
      }
      this.handleBodyRule();
      this.handleBaseQueryFinish();
      
    }
  }

  public handleBodyRule() {
    if(RuleEngine.async_hold) {
      if(is_debug) {
        console.log("_dbg async_hold is true not executing body rule");
      }
      return;
    }
    //for (var l in bodyRules) {
      var header = RuleEngine.rule_firing;
      var bodyRule = RuleEngine.body_rule_firing;
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
    RuleEngine.rule_firing = r;

    if(is_debug) {
      console.log("_dbg firing rule: " + r.name + "\n");
      console.log("_dbg r.rules.length: " + r.rules.length); 
      console.log("_dbg r.args[0]: " + RuleEngine.getTypeName(r.args[0])); 
    }

    if(r.is_query()) {
      if(is_debug) {
        console.log("_dbg executing query rule: " + r.name + "\n");
      }
      var rule_copy = this.prepareToCall(r);
      if(is_debug) {
        console.log("_dbg about to fire rule_copy with name: " + rule_copy.name);
        console.log("_dbg  rule_copy.rules.length: " + rule_copy.rules.length);
      }

      this.fireRule(rule_copy);
      if(RuleEngine.async_hold) {
        return;
      }

      /*
      if(is_debug) {
        console.log("_dbg r.args[0]: " + RuleEngine.getTypeName(r.args[0])); 
        console.log("_dbg r.args[0] val: " + r.args[0].getGrounded()); 
        console.log("_dbg pushing solution r.args[0] val: " + r.args[0].getGrounded()); 
      }
      */
    } else {
      if(is_debug) {
        console.log("_dbg rule: " + r.name + " is not a query\n");
      }

    }


    for (var l in r.rules) {
      var bodyRule = r.rules[l];
      this.addBodyRule(bodyRule);
    }

    this.popBodyRule();

    this.handleBodyRule();
    if(is_debug) {
      console.log("_dbg after handleBodyRule in fireRule");
    }
    //this.handleBaseQueryFinish();
  }

  public isQuerySolved(r_args: any[]) {
    var is_solved = true;
    if(is_debug) {
      console.log("_dbg in isQuerySolved");
    }
    for(var i=0; i < r_args.length; i++) {
      if(!r_args[i].isGrounded()) {
        if(is_debug) {
          console.log("_dbg term: " + r_args[i].name + " is not grounded");
        }
        is_solved = false;
      } else {  
        if(is_debug) {
          console.log("_dbg term: " + r_args[i].name + " is grounded with value: " + r_args[i].getGrounded());
        }
      }
    }

    return is_solved;
  }

  public handleFindMoreSolutions(input_str) {
    if(is_debug) {
      console.log("_dbg in handleFireMoreSolutions");
    }
    RuleEngine.async_hold = false;
    if(input_str == 'yes') {
      var re = RuleEngine.getREInst();
      re.backTrack();
      //re.handleQueryResult();
    } else {
      if(RuleEngine.finished_cb) {
        RuleEngine.finished_cb();
      }
    }
  }

  public handleQueryResult() {
    if(is_debug) {
      console.log("_dbg in handleQueryResult");
    }
    var q = RuleEngine.base_query;
    var output_ar = [];
    if(this.isQuerySolved(q.args)) { 
      output_ar.push('Query: ' + q.name + ' was solved, solutions are: \n');

      for(var i=0; i < q.args.length; i++) {
        output_ar.push('arg name: ' + q.args[i].name + ' ground val: ' + q.args[i].getGrounded() + '\n');
      }   
    } else {
      output_ar.push('Query: ' + q.name + ' was not solved\n');
    }

    if(RuleEngine.choices.length >0) {
      if(is_debug) {
        console.log("_dbg RuleEngine.choices.length: " + RuleEngine.choices.length);
      }
      output_ar.push('There are other possible solutions, should the solver continue?\n');
      Util.output(output_ar.join(''));
      output_ar = [];
      if(RuleEngine.more_solutions_prompt == true) {
        Util.input(this.handleFindMoreSolutions);
      }
    }

    if(output_ar.length > 0) {
      Util.output(output_ar.join(''));
    }

  }

}


  
