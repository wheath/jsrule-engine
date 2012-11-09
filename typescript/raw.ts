class Types {
  static types:any[] = [];
  static registerType(clsName: string, classDcl: any) {
    Types.types[clsName] = classDcl;
  }  

}
class Atom {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

}

Types.registerType('Atom', Atom);
class Term {
  public name: string;
  public grounded: any;

  constructor(name: string) {
    this.name = name;
    this.grounded = this;
  }

  public isGrounded():bool {
    if(this.grounded == this) {
      return false;
    } else {
      return true;
    }
  }

  public setVal(val: any):void {
    if(!this.isGrounded()) {
      console.log("_dbg about to set Term with name: " + this.name + ' to val: ' + val + "\n");
      this.grounded = val;
    } else {
      throw new TypeError( "Term is grounded cannot assign");
    }
  }

}

Types.registerType('Term', Term);
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
    if(this.is_query()) {
      if(RuleEngine.getTypeName(this.args[0]) == 'Atom') {
	if(this.rule_args[0].grounded == this.args[0].name) {
	  this.proven = true;
	}
      }    

      if(RuleEngine.getTypeName(this.args[0]) == 'Term') {
	if(this.rule_args[0].grounded) {
	  this.solutions.push(this.rule_args[0].grounded);
	}
      }    
    }  

    /*
    if(this.rule_args[0].grounded) {
      this.solutions.push(this.args[0].name);
    } 
    */            
  }  
}

Types.registerType('Rule', Rule);
/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>

class RuleEngine {
  private rules : Rule[] = [];
  private choices : any[] = [];

  public addRule(rule: Rule) {
    this.rules.push(rule);
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

  public fireRule(r: Rule) {

    console.log("_dbg firing rule: " + r.name + "\n");
    if(r.rules.length == 0) {
      console.log("_dbg executing query rule: " + r.name + "\n");
      var foundRules = this.searchRules(this.rules, r.name, r.args); 
      console.log("_dbg num rules found: " + foundRules.length + "\n");
      for(var k in foundRules) {
        r.entangle(foundRules[k]);
        this.fireRule(foundRules[k]);
        //foundRules[k].afterFire();
        r.afterFire();
      }
    }

    for (var l in r.rules) {
      if(r.rules[l].args.length > 0) {
        var foundRules = this.searchRules(this.rules, r.rules[l].name, r.rules[l].args); 
      console.log("_dbg num rules found: " + foundRules.length + "\n");
      for(var k in foundRules) {
        this.fireRule(foundRules[k]);
      }

      } else {
        if(r.rules[l].name.indexOf('=') > -1) {
          var n = r.rules[l].name.split('=');
          //console.log("_dbg n: "+ JSON.stringify(n) +"\n");
          //console.log("_dbg num args: "+ r.args.length +"\n");
          
          var arg = this.findArg(n[0], r.args);
          arg.setVal(n[1]);
        }
      }
      r.afterFire();
      this.fireRule(r.rules[l]);
    }
  }

}


  
/*
Implementing example:

mortal(X) :-
human(X).
human(socrates).

*/

/// <reference path="RuleEngine.ts"/>
/// <reference path="Atom.ts"/>
/// <reference path="Rule.ts"/>
/// <reference path="Term.ts"/>
/// <reference path="Fact.ts"/>
/// <reference path="Query.ts"/>


var re = new RuleEngine();
//var mortal_rule = new Rule('mortal');
var term_X = new Term('X');
//mortal_rule.addArg(term_X);

var human_rule = new Rule('human');
human_rule.addArg(term_X);
var assignX = new Rule('X=socrates');
human_rule.addRule(assignX);

var q_human = new Rule('human');
//q_human.addArg(term_X);
//mortal_rule.addRule(q_human);
//re.addRule(mortal_rule);
re.addRule(human_rule);

var human_rule2 = new Rule('human');
var term_X2 = new Term('X');
human_rule2.addArg(term_X2);
var assignX2 = new Rule('X=aristotle');
human_rule2.addRule(assignX2);
re.addRule(human_rule2);

//var query1 = new Query('mortal');
//var a2 = new Atom('aristotle');
var a2 = new Atom('socrates');
//query1.addArg(a2);
//q_human.addArg(a2);
q_human.addArg(term_X);
//var query_result = re.query(query1);
re.fireRule(q_human);
//re.query(query1);
console.log("_dbg term_X.grounded: " + term_X.grounded + "\n");
console.log("_dbg q_human.args[0].name: " + q_human.args[0].name + "\n");
console.log("_dbg proof query_result: " + q_human.proven + "\n");
console.log("_dbg solutions query_result: " + JSON.stringify(q_human.solutions) + "\n");
