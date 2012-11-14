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

exports.testUnify = function(test){
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
  re.fireRule(q_human);
  console.log("_dbg RuleEngine.getTypeName(term_X2.grounded): " + RuleEngine.getTypeName(term_X2.grounded));
  console.log("_dbg RuleEngine.getTypeName(term_X.grounded): " + RuleEngine.getTypeName(term_X.grounded));

  console.log("_dbg term_X2.getGrounded(): " + term_X2.getGrounded());
  test.equal(term_X2.getGrounded(), 1);
  console.log("_dbg RuleEngine.choices.length: " + RuleEngine.choices.length);
  re.backTrack();
  console.log("_dbg RuleEngine.choices.length: " + RuleEngine.choices.length);
  test.done();
};

