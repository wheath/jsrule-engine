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

