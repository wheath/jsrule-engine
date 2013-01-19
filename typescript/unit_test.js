
exports.testRuleDeepCopy = function(test){
  var term_X = new Term('X');
  var human_rule = new Rule('human');
  human_rule.addArg(term_X);

  h_copy = human_rule.deepcopy();
  
  test.equal(h_copy.name, human_rule.name);
  test.equal(h_copy.args.length, human_rule.args.length);
  h_copy.name = 'human2';
  test.notEqual(h_copy.name, human_rule.name);
  h_copy.args[0].name = 'Y';
  test.notEqual(h_copy.args[0].name, human_rule.args[0].name);
  test.done();
};

exports.testUnify = function(test) {
  var re = new RuleEngine();

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=1');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var q_human= new Rule('human');
  var term_X2 = new Term('X');
  q_human.addArg(term_X2);
  RuleEngine.base_query = q_human;
  RuleEngine.more_solutions_prompt = false;
  re.fireRule(q_human);
 
  test.equal(term_X2.getGrounded(), 1);
  test.done();
};

exports.testBackTrack = function(test) {
  RuleEngine.reset();
  var re = new RuleEngine();

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=2');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=1');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var q_human= new Rule('human');
  var term_X2 = new Term('X');
  q_human.addArg(term_X2);
  RuleEngine.base_query = q_human;
  RuleEngine.more_solutions_prompt = false;
  re.fireRule(q_human);
 
  console.log("_dbg first solution term_X2.getGrounded(): " + term_X2.getGrounded());
  console.log("_dbg num choice points: " + RuleEngine.choices.length);
  if(term_X2.isGrounded()) {
    console.log("_dbg pushing first solution");
    q_human.solutions.push(term_X2.getGrounded());
  }
  if(RuleEngine.choices.length >0){ 
    do {
      re.backTrack();
      if(term_X2.isGrounded()) {
        console.log("_dbg next solution term_X2.getGrounded(): " + term_X2.getGrounded());
        console.log("_dbg pushing next solution");
        q_human.solutions.push(term_X2.getGrounded());
      }
    } while(RuleEngine.choices.length >0); 

  }
  console.log("_dbg total solutions found for q_human query: " + q_human.solutions.length);
    
  test.equal(q_human.solutions[0], 1);
  test.equal(q_human.solutions[1], 2);
  test.done();
};

exports.testCut = function(test) {
  RuleEngine.reset();
  var re = new RuleEngine();

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=2');
  test_rule.addRule(test_clause);
  var test_clause = new Rule('!');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=1');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var q_human= new Rule('human');
  var term_X2 = new Term('X');
  q_human.addArg(term_X2);
  RuleEngine.base_query = q_human;
  RuleEngine.more_solutions_prompt = false;
  re.fireRule(q_human);
 
  console.log("_dbg first solution term_X2.getGrounded(): " + term_X2.getGrounded());
  console.log("_dbg num choice points: " + RuleEngine.choices.length);
  if(term_X2.isGrounded()) {
    console.log("_dbg pushing first solution");
    q_human.solutions.push(term_X2.getGrounded());
  }
  if(RuleEngine.choices.length >0){ 
    do {
      re.backTrack();
      if(term_X2.isGrounded()) {
        console.log("_dbg next solution term_X2.getGrounded(): " + term_X2.getGrounded());
        console.log("_dbg pushing next solution");
        q_human.solutions.push(term_X2.getGrounded());
      }
    } while(RuleEngine.choices.length >0); 

  }
  console.log("_dbg total solutions found for q_human query: " + q_human.solutions.length);
    
  test.equal(q_human.solutions[0], 1);
  test.equal(q_human.solutions.length, 2);
  test.done();
};

exports.testFail = function(test) {
  RuleEngine.reset();
  var re = new RuleEngine();

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=2');
  test_rule.addRule(test_clause);
  var test_clause = new Rule('fail');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var term_X = new Term('X');
  var test_rule = new Rule('human');
  test_rule.addArg(term_X);
  var test_clause = new Rule('X=1');
  test_rule.addRule(test_clause);

  re.addRule(test_rule);

  var q_human= new Rule('human');
  var term_X2 = new Term('X');
  q_human.addArg(term_X2);
  RuleEngine.base_query = q_human;
  RuleEngine.more_solutions_prompt = false;
  re.fireRule(q_human);
 
  console.log("_dbg first solution term_X2.getGrounded(): " + term_X2.getGrounded());
  console.log("_dbg num choice points: " + RuleEngine.choices.length);
  if(term_X2.isGrounded()) {
    console.log("_dbg pushing first solution");
    q_human.solutions.push(term_X2.getGrounded());
  }
  if(RuleEngine.choices.length >0){ 
    do {
      re.backTrack();
      if(term_X2.isGrounded()) {
        console.log("_dbg next solution term_X2.getGrounded(): " + term_X2.getGrounded());
        console.log("_dbg pushing next solution");
        q_human.solutions.push(term_X2.getGrounded());
      }
    } while(RuleEngine.choices.length >0); 

  }
  console.log("_dbg total solutions found for q_human query: " + q_human.solutions.length);
    
  test.equal(q_human.solutions[0], 1);
  test.equal(q_human.solutions.length, 1);
  test.done();
};

exports.testAliasing = function(test) {
  RuleEngine.reset();
  var re = new RuleEngine();

  var term_X1 = new Term('X1');
  var test1_rule = new Rule('test1');
  test1_rule.addArg(term_X1);
  var test1_clause = new Rule('X1=1');
  test1_rule.addRule(test1_clause);

  re.addRule(test1_rule);

  var term_X2 = new Term('X2');
  var test2_rule = new Rule('test2');
  test2_rule.addArg(term_X2);
  var test2_clause = new Rule('X2=2');
  test2_rule.addRule(test2_clause);

  re.addRule(test2_rule);

  var term_X3 = new Term('X3');
  var term_X4 = new Term('X4');
  var test3_rule = new Rule('test3');
  test3_rule.addArg(term_X3);
  test3_rule.addArg(term_X4);

  var test3_clause = new Rule('test1');
  var bterm_X3 = new Term('X3');
  //test3_clause.addArg(bterm_X3);
  test3_clause.addArg(term_X3);
  test3_rule.addRule(test3_clause);
  var test3_clause2 = new Rule('test2');
  var bterm_X4 = new Term('X4');
  //test3_clause2.addArg(bterm_X4);
  test3_clause2.addArg(term_X4);
  test3_rule.addRule(test3_clause2);


  re.addRule(test3_rule);

  var q_test3= new Rule('test3');
  var qterm_X3 = new Term('X3');
  var qterm_X4 = new Term('X4');
  q_test3.addArg(qterm_X3);
  q_test3.addArg(qterm_X4);
  RuleEngine.base_query = q_test3;
  RuleEngine.more_solutions_prompt = false;
  re.fireRule(q_test3);
 
  test.equal(qterm_X3.getGrounded(), 1);
  test.equal(qterm_X4.getGrounded(), 2);
  test.done();
};


exports.testAliasChainSearch = function(test) {
  var term_X1 = new Term('X1');

  test.equal(RuleEngine.is_term_in_alias_chain(term_X1, term_X1), true);

  var term_X2 = new Term('X2');
  term_X1.unify(term_X2);

  test.equal(RuleEngine.is_term_in_alias_chain(term_X2, term_X1), true);
  test.equal(RuleEngine.is_term_in_alias_chain(term_X1, term_X1), true);

  var term_X3 = new Term('X3');
  term_X1.unify(term_X3);
  test.equal(RuleEngine.is_term_in_alias_chain(term_X3, term_X1), true);
  test.equal(RuleEngine.is_term_in_alias_chain(term_X2, term_X1), true);
  test.equal(RuleEngine.is_term_in_alias_chain(term_X3, term_X2), true);
  test.equal(RuleEngine.is_term_in_alias_chain(term_X1, term_X3), false);

  test.done();
};

exports.testMultipleCalls = function(test) {
  RuleEngine.reset();
  var re = new RuleEngine();

  var term_X1 = new Term('X1');
  var test1_rule = new Rule('test1');
  test1_rule.addArg(term_X1);
  var test1_clause = new Rule('X1=1');
  test1_rule.addRule(test1_clause);

  re.addRule(test1_rule);

  var term_X1 = new Term('X1');
  var test1_rule = new Rule('test1');
  test1_rule.addArg(term_X1);
  var test1_clause = new Rule('X1=3');
  test1_rule.addRule(test1_clause);

  re.addRule(test1_rule);

  var term_X2 = new Term('X2');
  var test2_rule = new Rule('test2');
  test2_rule.addArg(term_X2);
  var test2_clause = new Rule('X2=2');
  test2_rule.addRule(test2_clause);

  re.addRule(test2_rule);

  var term_X3 = new Term('X3');
  var term_X4 = new Term('X4');
  var test3_rule = new Rule('test3');
  test3_rule.addArg(term_X3);
  test3_rule.addArg(term_X4);

  var test3_clause = new Rule('test1');
  test3_clause.addArg(term_X3);
  test3_rule.addRule(test3_clause);
  var test3_clause2 = new Rule('test2');
  test3_clause2.addArg(term_X4);
  test3_rule.addRule(test3_clause2);


  re.addRule(test3_rule);

  var q_test3= new Rule('test3');
  var qterm_X3 = new Term('X3');
  var qterm_X4 = new Term('X4');
  q_test3.addArg(qterm_X3);
  q_test3.addArg(qterm_X4);
  RuleEngine.base_query = q_test3;
  RuleEngine.more_solutions_prompt = false;
  test.equal(RuleEngine.rules.length, 4);
  re.fireRule(q_test3);
 
  test.equal(qterm_X3.getGrounded(), 1);
  test.equal(qterm_X4.getGrounded(), 2);

  console.log("_dbg executing other solution");

  re.handleFindMoreSolutions("yes");
  test.equal(qterm_X3.getGrounded(), 3);
  test.equal(qterm_X4.getGrounded(), 2);

  test.done();
};


