function setup_re() {
  var re = RuleEngine.getREInst();

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

  var small_hd_term = new Term('HDX');
  var chosen_ram_term = new Term('RAMX');
  var small_hd_rule = new Rule('choose_hd');
  small_hd_rule.addArg(small_hd_term);
  small_hd_rule.addArg(chosen_ram_term);

  var small_ram_constraint = new Rule('RAMX==small');
  re.addRule(small_ram_constraint);
  small_hd_rule.addRule(small_ram_constraint);

  var small_hd_o1 = new Rule('o(Do you want a small HD?)');
  re.addRule(small_hd_o1);
  small_hd_rule.addRule(small_hd_o1);

  var small_hd_i1 = new Rule('i(HDY)');
  re.addRule(small_hd_i1);
  small_hd_rule.addRule(small_hd_i1);

  var small_hd_i1_eq_yes = new Rule('HDY==yes');
  re.addRule(small_hd_i1_eq_yes);
  small_hd_rule.addRule(small_hd_i1_eq_yes);

  var small_hdX = new Rule('HDX=small');
  re.addRule(small_hdX);
  small_hd_rule.addRule(small_hdX);

  re.addRule(small_hd_rule);

  var med_hd_rule = new Rule('choose_hd');
  med_hd_rule.addArg(small_hd_term);
  med_hd_rule.addArg(chosen_ram_term);

  var med_ram_constraint = new Rule('RAMX==medium');
  re.addRule(med_ram_constraint);
  med_hd_rule.addRule(med_ram_constraint);

  var med_hd_o1 = new Rule('o(Do you want a medium HD?)');
  re.addRule(med_hd_o1);
  med_hd_rule.addRule(med_hd_o1);

  var med_hd_i1 = new Rule('i(HDY)');
  re.addRule(med_hd_i1);
  med_hd_rule.addRule(med_hd_i1);

  var med_hd_i1_eq_yes = new Rule('HDY==yes');
  re.addRule(med_hd_i1_eq_yes);
  med_hd_rule.addRule(med_hd_i1_eq_yes);

  var med_hdX = new Rule('HDX=medium');
  re.addRule(med_hdX);
  med_hd_rule.addRule(med_hdX);

  re.addRule(med_hd_rule);

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

  var q_ram_hd = new Rule('choose_ram_hd');
  re.addRule(q_ram_hd);
  var term_ram = new Term('RAM1');
  var term_hd = new Term('HD1');
  q_ram_hd.addArg(term_ram);
  q_ram_hd.addArg(term_hd);

  var b_ram = new Rule('choose_ram');
  b_ram.addArg(term_ram);

  var b_hd = new Rule('choose_hd');
  b_hd.addArg(term_hd);
  b_hd.addArg(term_ram);

  q_ram_hd.addRule(b_ram);
  q_ram_hd.addRule(b_hd);

  return re;
}

