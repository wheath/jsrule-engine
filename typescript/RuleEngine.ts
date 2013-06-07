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
    RuleEngine.body_rules.push(rule);
    //RuleEngine.body_rules.unshift(rule);
  }

  public addRule(rule: Rule) {
    //console.log("_dbg adding rule with name: " + rule.name);
    //console.log("_dbg num rules: " + rule.rules.length);
    RuleEngine.rules.push(rule);

    //push body rules
    for(var i=0; i < rule.rules.length;i++) {
      if(!rule.is_query()) {
        //avoid duplicating rules so set rules already known to their reference
        //instead of adding a duplicate
	var foundRules = this.searchRules(RuleEngine.rules, rule.name, rule.args);    
        if(foundRules.length == 1) {
          for(var j=0; j < foundRules.length;j++) {
	    var found_bodyRule = foundRules[j];
	    if(found_bodyRule.is_non_call()) {
              rule.rules[i] = found_bodyRule;
	    }
          }
        }
      }
    }
    //RuleEngine.rules.unshift(rule);
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
      RuleEngine.dump_choices();
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
      RuleEngine.body_rules = found_choice.body_rules;
      var rule_copy = this.prepareToFire(found_choice.query, found_choice.rule, false);
      if(is_debug) {
	if(!this.check_copy_args_link_to_base_args(rule_copy)) {
	  console.log("_dbg 6 rule_copy: " + rule_copy.name + " args not found in alias chain of base query args after unifying with query: " + found_choice.query.name);
	} else {
	  console.log("_dbg 6 rule_copy: " + rule_copy.name + " args found in alias chain of base query args after unifying with query: " + found_choice.query.name);
	}
      }
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

  public unifyHeaderBodyArgsToQueryArgs(query: Rule) {
    if(is_debug) {
      console.log("_dbg in unifyHeaderBodyArgsToQueryArgs");
    }
    var header = RuleEngine.rule_firing;
    for(var i=0;i < header.b_args.length; i++) {
      for(var j=0;j < query.args.length; j++) {
	if(is_debug) {
	  console.log("_dbg cmp b arg name: " + query.args[j].name + " with  header arg name" + header.b_args[i].name);
	}
	if(query.args[j].name == header.b_args[i].name) {
	  query.args[j] = header.b_args[i];
	}
      }
    }
  }

  public unifyHeaderArgsToBodyCallArgs(rule: Rule) {
    var header = rule;
    var body_rules = rule.rules;



    for(var k=0;k < body_rules.length; k++) {
        var body_rule = body_rules[k];
	if(is_debug) {
	  console.log("_dbg in unifyHeaderArgsToBodyCallArgs h: " + header.name + " b: " + body_rule.name);
	}
      for(var i=0;i < header.args.length; i++) {
	for(var j=0;j < body_rule.args.length; j++) {
	  if(is_debug) {
	    console.log("_dbg cmp b arg name: " + body_rule.args[j].name + " with  header arg name" + header.args[i].name);
	  }
	  if(body_rule.args[j].name == header.args[i].name) {
	    body_rule.args[j] = header.args[i];
	  }
	}
      }
    }
  }

  public unifyRuleHeaders(r1: Rule, r2: Rule) {
    if(is_debug) {
      console.log("_dbg in unifyRuleHeaders");
      console.log("_dbg unifying r1: " + r1.name);
      RuleEngine.dump_rule(r1);
      console.log("_dbg with r2: " + r2.name);
      RuleEngine.dump_rule(r2);
    }
    for(var i=0;i < r1.args.length; i++) {
      if(RuleEngine.getTypeName(r1.args[i]) == 'Term' && !r1.args[i].isGrounded()) {
        if(is_debug) {
          console.log("_dbg calling unify on arg: " + r1.args[i].name + " v: " + r1.args[i].getGrounded() + " with arg: " + r2.args[i].name + " v: " + r2.args[i].getGrounded());
        }
        r1.args[i].unify(r2.args[i]);
        if(is_debug) {
          console.log("_dbg unifying " + r2.args[i].name + " with " + r1.args[i].name);
          console.log("_dbg r1.args[i].grounded type: " + RuleEngine.getTypeName(r1.args[i].grounded));
          RuleEngine.dump_term_alias_chain(r1.args[i]);
	  if(r2.args[i].name == 'X1') {
            var bq_hd_arg = RuleEngine.base_query.args[0];
	    console.log("\n_dbg dumping base query arg name: " + bq_hd_arg.name);

            if(RuleEngine.is_term_in_alias_chain(r1.args[i], bq_hd_arg)) {
              console.log("_dbg 2 term: " + r1.args[i].name + " is in alias chain of base query arg: " + bq_hd_arg.name);
            } else {
              console.log("_dbg 2 term: " + r1.args[i].name + " is not in alias chain of base query arg: " + bq_hd_arg.name);
            }

            if(RuleEngine.is_term_in_alias_chain(r2.args[i], bq_hd_arg)) {
              console.log("_dbg term: " + r2.args[i].name + " is in alias chain of base query arg: " + bq_hd_arg.name);
            } else {
              console.log("_dbg term: " + r2.args[i].name + " is not in alias chain of base query arg: " + bq_hd_arg.name);
            }

            RuleEngine.dump_term_alias_chain(bq_hd_arg);
	    console.log("_dbg r1.args[i].getGrounded: " + r1.args[i].getGrounded());
	  }
        }
      } else if(RuleEngine.getTypeName(r2.args[i]) == 'Term' && !r2.args[i].isGrounded()) {
        if(is_debug) {
          console.log("_dbg calling unify on r2");
        }
        if(is_debug) {
          console.log("_dbg unifying " + r1.args[i].name + " with " + r2.args[i].name);
        }
        r2.args[i].unify(r1.args[i]);
      }

      if((RuleEngine.getTypeName(r2.args[i]) == 'Term' && r2.args[i].isGrounded())  && (RuleEngine.getTypeName(r2.args[i]) == 'Term' && !r2.args[i].isGrounded()) ) {
        throw "cannot unify two grounded header args";   
      }
    }
    if(is_debug) {
      console.log("_dbg exiting unifyRuleHeaders");
    }
  }


  public handleFoundRules(query: Rule, foundRules: Rule[]) {
    if(is_debug) {
      console.log("_dbg in handleFoundRules");
      console.log("_dbg # foundRules: " + foundRules.length);
      console.log("_dbg # RuleEngine.body_rules: " + RuleEngine.body_rules.length);
      if(!this.check_copy_args_link_to_base_args(query)) {
	console.log("_dbg 5 rule: " + query.name + " args not found in alias chain of base query args!");
      } else {
	console.log("_dbg 5 rule: " + query.name + " args found in alias chain of base query args!");

      }
    }

   
    if(is_debug) {
      console.log("_dbg choices before adding: ");
      RuleEngine.dump_choices();
    }

    for(var i=foundRules.length-1; i >0;i--) {
      var body_rules_copy = [];
      
      for(var j=0; j <RuleEngine.body_rules.length;j++) {
	body_rules_copy.unshift(RuleEngine.body_rules[j].deepcopy());
      }

      var choice = new Choice(query, foundRules[i], body_rules_copy);
      if(is_debug) {
        console.log("_dbg adding choice: " + foundRules[i].name);
      }
      RuleEngine.choices.push(choice);
      //RuleEngine.choices.unshift(choice);
    }

    if(is_debug) {
      console.log("_dbg choices after adding: ");
      RuleEngine.dump_choices();
    }
  }

  public check_copy_args_link_to_base_args(rule_copy: Rule) {
    var bq_args =  RuleEngine.base_query.args;
    for(var i=0; i < bq_args.length; i++) {
      for(var j=0; j < rule_copy.args.length; j++) {
        if(RuleEngine.is_term_in_alias_chain(rule_copy.args[j], bq_args[i])) {
          return true;
        }
      }
    }
    return false;
  }

  public prepareToFire(query: Rule, rule: Rule, is_body_rule: bool) {
    if(is_debug) {
      console.log("_dbg in prepareToFire");
      //var rule_check = query;
      var rule_check = query;
      /*
      if(is_body_rule) {
        rule_check = RuleEngine.rule_firing;
      }
      */

      if(!this.check_copy_args_link_to_base_args(rule_check)) {
	console.log("_dbg 4 rule: " + rule_check.name + " args not found in alias chain of base query args!");
      } else {
	console.log("_dbg 4 rule: " + rule_check.name + " args found in alias chain of base query args!");

      }

    }
    var rule_copy = rule.deepcopy();
    if(rule_copy.rules.length > 0) {
      this.unifyHeaderArgsToBodyCallArgs(rule_copy);
    }
    if(is_debug) {
      if(query.name == 'choose_hd') {
        console.log("_dbg choose_hd call: ");
        RuleEngine.dump_rule(query);
      }

    }
    if(!is_body_rule) {
      this.unifyRuleHeaders(query, rule_copy);
    } else {
      RuleEngine.rule_firing.is_context_change = true;
      if(is_debug) {
        console.log("_dbg adding RuleEngine.rule_firing.is_context_change = true: " + RuleEngine.rule_firing.name);
      }
      this.addBodyRule(RuleEngine.rule_firing);
      this.addHeaderBodyArgs(query);
      this.unifyHeaderBodyArgsToQueryArgs(query);
      this.unifyRuleHeaders(query, rule_copy);
      //var header = RuleEngine.rule_firing;
      //this.unifyHeaderArgsToBodyCallArgs(header, rule_copy);
    }

    if(is_debug) {
      if(query.name == 'choose_hd') {
        console.log("_dbg choose_hd call after unifyRuleHeaders: ");
        RuleEngine.dump_rule(rule_copy);
      }

    }

    if(is_debug) {
      if(!this.check_copy_args_link_to_base_args(rule_copy)) {
	console.log("_dbg 3 rule_copy: " + rule_copy.name + " args not found in alias chain of base query args after unifying with query: " + query.name);
      } else {
	console.log("_dbg 3 rule_copy: " + rule_copy.name + " args found in alias chain of base query args after unifying with query: " + query.name);
      }
    }

    if(is_debug) {
      if(query.name == 'choose_hd') {
        console.log("_dbg choose_hd rule after unifying header and body args: ");
        RuleEngine.dump_rule(rule_copy);
      }

    }

    return rule_copy;
  }

  public popBodyRule() {
    if(!RuleEngine.async_hold) {

      if(is_debug) {
        console.log("_dbg about to pop a body rule");
        console.log("_dbg RuleEngine.body_rules.length: " + RuleEngine.body_rules.length);
      }

      var popped_body_rule = RuleEngine.body_rules.pop();
      if(popped_body_rule && popped_body_rule.is_context_change) {
        if(is_debug) {
          console.log("_dbg context change to RuleEngine.rule_firing: " + popped_body_rule.name);
        }
        //popped_body_rule.is_context_change = false;
        RuleEngine.rule_firing = popped_body_rule;
        this.popBodyRule();
      } else {
        RuleEngine.body_rule_firing = popped_body_rule;
      }
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

  public addHeaderBodyArgs(call_rule:Rule) {
    if(is_debug) {
      console.log("_dbg in addHeaderBodyArgs");
    }
    var header = RuleEngine.rule_firing;

    for(var i=0;i < call_rule.args.length; i++) {
      var arg = RuleEngine.findArg(call_rule.args[i].name, header.args);
      if(!arg) {
	if(is_debug) {
	  //console.log("_dbg header.b_args: "+ JSON.stringify(header.b_args) +"\n");
	}
	arg = RuleEngine.findArg(call_rule.args[i].name, header.b_args);
      }
      if(!arg) {
	if(is_debug) {
	  console.log("_dbg adding term to header body args: " + call_rule.args[i].name);
	}
	arg = new Term(call_rule.args[i].name);
	header.addBarg(arg);
      }
    }

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
      
        //console.log("_dbg header.args: "+ JSON.stringify(header.args) +"\n");
      }   
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
        RuleEngine.dump_term_alias_chain(arg);
        var bq_hd_arg = RuleEngine.base_query.args[0];
        RuleEngine.dump_term_alias_chain(bq_hd_arg);
        /*
        if(arg.name == 'HDX') {
          var bq_hd_arg = RuleEngine.base_query.args[1];
          console.log("_dbg bq_hd_arg name: " + bq_hd_arg.name);
          console.log("_dbg bq_hd_arg value: " + bq_hd_arg.getGrounded());
        }
        */
      }
    } else if(bodyRule.name == '!') {
      console.log("_dbg executing cut, emptying choice points");
      RuleEngine.choices = [];
    } else if(bodyRule.name.indexOf('fail') > -1) {
      if(is_debug) {
        console.log("_dbg executing fail");
      }
      is_fail = true;
    } else if(bodyRule.name.indexOf('write(') > -1) {
      var r = /^write\((.*)\)/;
      Util.output(bodyRule.name.match(r)[1]);
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
    } else if(bodyRule.name.indexOf('ov(') > -1) {
      if(is_debug) {
        console.log("_dbg in ov body rule");
      }
      var r = /^ov\((.*)\)/;
      var arg_name = bodyRule.name.match(r)[1];
      if(is_debug) {
        console.log("_dbg arg_name: " + arg_name);
      }
      var arg = RuleEngine.findArg(arg_name, header.args);
      if(!arg) {
        arg = RuleEngine.findArg(arg_name, header.b_args);
      }
      Util.output(arg.getGrounded());
    }

    if(is_debug) {
      console.log("_dbg about to call handleNonCallAsync");
      console.log("_dbg is_fail: " + is_fail);
    }
    this.handleNonCallAsync(is_fail);
  }

  public prepareToCall(call_rule: Rule, is_body_rule: bool = false) {
    if(is_debug) {
      console.log("_dbg processing rule name: "+ call_rule.name +" in prepareToCall");
      RuleEngine.dump_rule(call_rule);
      console.log("_dbg   RuleEngine.rule_firing.name: " + RuleEngine.rule_firing.name);
    }

    this.addHeaderBodyArgs(call_rule);
    var foundRules = this.searchRules(RuleEngine.rules, call_rule.name, call_rule.args); 
    if(is_debug) {
      console.log("_dbg num rules found: " + foundRules.length + "\n");
    }
    this.handleFoundRules(call_rule, foundRules);
    if(foundRules.length) {
      if(is_debug) {
        console.log("_dbg foundRules[0].rules.length: " + foundRules[0].rules.length);
      }
      var rule_copy = this.prepareToFire(call_rule, foundRules[0], is_body_rule);
      if(is_debug) {
        console.log("_dbg copy of rule name: " + call_rule.name);
        RuleEngine.dump_rule(rule_copy);
      }
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
        var is_body_rule = true;
        var rule_copy = this.prepareToCall(bodyRule, is_body_rule);
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

    if(is_debug && r.rules.length) {
      console.log("_dbg # body rules of rule " + r.name + ": " + r.rules.length);
      console.log("_dbg added all body rules of rule: " + bodyRule.name);
      RuleEngine.dump_body_rules();
    }

    this.popBodyRule();
    if(is_debug) {
      console.log("_dbg current rule firing: " + RuleEngine.rule_firing.name);
      if(RuleEngine.body_rule_firing) {
        console.log("_dbg body rule processing after popBodyRule: " + RuleEngine.body_rule_firing.name);
      }
    }

    this.handleBodyRule();
    if(is_debug) {
      console.log("_dbg after handleBodyRule in fireRule");
    }
    //this.handleBaseQueryFinish();
  }

  public static is_term_in_alias_chain(needle: Term, haystack: Term) {
    var done = false;
    var found = false;
    while(!done) {
      if(needle == haystack) {
        found = true;
        done = true;
      }

      if(RuleEngine.getTypeName(haystack.grounded) != 'Term' || haystack.isFree()) {
        done = true;
      } else {
        haystack = haystack.grounded;
      }
    }

    return found;
  }

  public static dump_term_alias_chain(t: Term) {
    return;
    if(RuleEngine.getTypeName(t.grounded) != 'Term') {
      console.log("_dbg t.name: " +  t.name + " is bound to value" + t.grounded);
      return;
    }
    console.log("_dbg dumping alias chain:");
    console.log("_dbg t.name: " + t.name);   
    if(t.isFree()) {
      console.log("_dbg t.name: " +  t.name + " is free");
      return;
    }

    if(t.isBoundorAliased()) {
      if(RuleEngine.getTypeName(t.grounded) == 'Term') {
        console.log("_dbg t.name: " +  t.name + " is aliased to " + t.grounded.name);
        RuleEngine.dump_term_alias_chain(t.grounded);
      } else {
        console.log("_dbg t.name: " +  t.name + " is bound to value" + t.grounded);

      }
    }
  }

  public static dump_rule(r1: Rule) {
      console.log("_dbg rule name: " + r1.name);
      if(r1.args.length > 0) {
        for(var i=0;i < r1.args.length; i++) {
          console.log("_dbg   args[" + i + "]: " + r1.args[i].name + " value: " + r1.args[i].getGrounded());
        }
      } else {
        console.log("_dbg   has no args");
      }

      if(r1.rules.length > 0) {

      } else {
        console.log("_dbg   has no body rules");
      }
     
  }

  public static dump_body_rules() {
    if(is_debug) {
      console.log("_dbg dumping body rules");
      for (var i=0; i < RuleEngine.body_rules.length; i++) {
        var bodyRule = RuleEngine.body_rules[i];
        console.log("_dbg position: " + i + " bodyRule name: " + bodyRule.name + " is_context_change: " + bodyRule.is_context_change); 
      }
    }

  }

  public static dump_choices() {
    if(is_debug) {
      console.log("_dbg dumping choices");
      for (var i=0; i < RuleEngine.choices.length; i++) {
        var choice = RuleEngine.choices[i];
        if(RuleEngine.getTypeName(choice) == 'Choice') {
          console.log("_dbg position: " + i + " query name: " + choice.query.name + " rule name: " + choice.rule.name + " type: " + RuleEngine.getTypeName(choice)); 
          //RuleEngine.dump_rule(choice.query);
          //RuleEngine.dump_rule(choice.rule);
          console.log("_dbg choice.body_rules: ");
	  for (var l=0; l < choice.body_rules.length; l++) {
	    var bodyRule = choice.body_rules[l];
            console.log("_dbg position: " + l + " bodyRule name: " + bodyRule.name + " is_context_change: " + bodyRule.is_context_change); 
	  }

        } else {
          console.log("_dbg position: " + i + " choice name: " + choice.name + " type: " + RuleEngine.getTypeName(choice)); 
        }
      }
    }

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
      RuleEngine.dump_choices();
      if(RuleEngine.more_solutions_prompt == true) {
        Util.input(this.handleFindMoreSolutions);
      }
    }

    if(output_ar.length > 0) {
      Util.output(output_ar.join(''));
    }

  }

}


  
