function setup_re() {
  var re = new RuleEngine();

  var small_ram_term = new Term('X');
  var small_ram_rule = new Rule('choose_ram');
  small_ram_rule.addArg(small_ram_term);

  var small_o1 = new Rule('o(Do you want a small amount of Ram?)');
  re.addRule(small_o1);
  small_ram_rule.addRule(small_o1);

  var small_i1 = new Rule('i(Y)');
  re.addRule(small_i1);
  small_ram_rule.addRule(small_i1);

  var small_i1_eq_yes = new Rule('Y==yes');
  re.addRule(small_i1_eq_yes);
  small_ram_rule.addRule(small_i1_eq_yes);

  var small_X = new Rule('X=small');
  re.addRule(small_X);
  small_ram_rule.addRule(small_X);

  re.addRule(small_ram_rule);

  var med_ram_term = new Term('X');
  var med_ram_rule = new Rule('choose_ram');
  med_ram_rule.addArg(med_ram_term);

  var med_o1 = new Rule('o(Do you want a medium amount of Ram?)');
  re.addRule(med_o1);
  med_ram_rule.addRule(med_o1);

  var med_i1 = new Rule('i(Y)');
  re.addRule(med_i1);
  med_ram_rule.addRule(med_i1);

  var med_i1_eq_yes = new Rule('Y==yes');
  re.addRule(med_i1_eq_yes);
  med_ram_rule.addRule(med_i1_eq_yes);

  var med_X = new Rule('X=medium');
  re.addRule(med_X);
  med_ram_rule.addRule(med_X);

  re.addRule(med_ram_rule);

  var large_ram_term = new Term('X');
  var large_ram_rule = new Rule('choose_ram');
  large_ram_rule.addArg(med_ram_term);

  var large_o1 = new Rule('o(Do you want a large amount of Ram?)');
  re.addRule(large_o1);
  large_ram_rule.addRule(large_o1);

  var large_i1 = new Rule('i(Y)');
  re.addRule(large_i1);
  large_ram_rule.addRule(med_i1);

  var large_i1_eq_yes = new Rule('Y==yes');
  re.addRule(large_i1_eq_yes);
  large_ram_rule.addRule(large_i1_eq_yes);

  var large_X = new Rule('X=large');
  re.addRule(large_X);
  large_ram_rule.addRule(large_X);

  re.addRule(large_ram_rule);

  return re;
}

