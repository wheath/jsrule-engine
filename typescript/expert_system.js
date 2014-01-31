function setup_re() {
  var re = RuleEngine.getREInst();

  var cpu_choice_term = new Term('CPUCHOICE');
  var choose_cpu_rule = new Rule('choose_cpu');
  choose_cpu_rule.addArg(cpu_choice_term);

  var cpu_o1 = new Rule('o(Would you prefer single or dual processors?)');
  re.addRule(cpu_o1);
  choose_cpu_rule.addRule(cpu_o1);

  var cpu_i1 = new Rule('iradiobtn(CPUCHOICE, {"Single":"single", "Dual":"dual"})');
  re.addRule(cpu_i1);
  choose_cpu_rule.addRule(cpu_i1);
  re.addRule(choose_cpu_rule);

  return re;
}

