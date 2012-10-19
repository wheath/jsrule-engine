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

  public getTypeName(inst: any) {
    var typeName = undefined;
    for (var clsName in Types.types) {
      /* console.log("_dbg clsName: "+ clsName +"\n"); */
      if (inst instanceof Types.types[clsName]) {
        typeName = clsName;
      }
    }

    return typeName;
  }

  public isArgsMatch(args1: any[], args2: any[]) {
    var match = true;
    /*
    console.log("_dbg TypeName q : "+ this.getTypeName(q) + "\n");
    console.log("_dbg TypeName r : "+ this.getTypeName(r) + "\n");
    console.log("_dbg typeof q : "+ typeof q +"\n");
    console.log("_dbg q.toString() : "+ q.toString() +"\n");
    console.log("_dbg q num args: "+q.args.length.toString()+"\n");
    console.log("_dbg r num args: "+r.args.length.toString()+"\n");
    */
    if (args1.length == args2.length) {
      console.log("_dbg num args match\n");
	/* TODO: handle grounding and entangling of logical variables */
	/*
      for(var i=0; i < q.args.length; i++) {
	console.log("_dbg q arg #: " + i + " type: " + this.getTypeName(q.args[i]));
	console.log("_dbg r arg #: " + i + " type: " + this.getTypeName(r.args[i]));
	this.getTypeName(q.args[i]) != this.getTypeName(r.args[i])) {
	if(this.getTypeName(q.args[i]) != this.getTypeName(r.args[i])) {
	  match=false;    
	}
      }
	*/
    } else {
      match=false;
    }
     
    return match;  
  }

  public searchRules(rules: Rule[], name: string, args: any[]):Rule[] {
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

  public searchFacts(name: string):Fact[] {
    console.log("_dbg searching for facts with name: "+name +"\n");
    var foundFacts = [];
    for (var i in this.facts) {
      if (name == this.facts[i].name) {
        foundFacts.push(this.facts[i]); 
      }
      
    }

    return foundFacts;
  }

  public fireRule(r: Rule) {

    console.log("_dbg firing rule: " + r.name + "\n");
    for (var l in r.rules) {

      var foundRules = this.searchRules(this.rules, r.rules[l].name, r.rules[l].args); 
      if(foundRules.length > 0) {
      } else {
        console.log("_dbg searching for facts with name: "+r.rules[l].name+"\n");
	var foundFacts = this.searchFacts(r.rules[l].name);
        console.log("_dbg num foundFacts found: "+foundFacts.length+"\n");
	for (var i in foundFacts) {
          console.log("_dbg processing fact name: "+foundFacts[i].name +"\n");
	  for(var j in r.rules[l].args) {
	    if(this.getTypeName(r.rules[l].args[j]) == 'Term') {
	      for (var m in foundFacts[i].atoms) {
	        r.rules[l].args[j].setVal(foundFacts[i].atoms[m].name);  
	      }   
	    }

	  }
	}

      }
      this.fireRule(r.rules[l]);
    }
    /*
      if(foundRules.length > 0) {
	for (var k in foundRules) {
	  this.fireRule(foundRules[k]);
	}
      } else {
	var foundFacts = this.searchFacts(r.name);
	for (var i in foundFacts) {
	  for(var j in r.args) {
	    if(this.getTypeName(r.args[j]) == 'Term') {
	      r.args[j].setVal(foundFacts[i].args[0]);  
	    }

	  }
	}
      }
    } 
    */    
  }

  public query(q: Query):bool {
    var result = false;
    var foundRules = this.searchRules(this.rules, q.name, q.args); 
    for (var i in foundRules) {
      console.log("_dbg about to fire rule with name: " + foundRules[i].name + "\n");
      this.fireRule(foundRules[i]);
      if(foundRules[i].args[0].grounded == q.args[0].name){
        result = true;

      }
    }
    return result;
  }
}
  
