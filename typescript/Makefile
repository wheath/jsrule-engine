.DELETE_ON_ERROR:

all: raw.js

re_lib.js: *.ts
	tsc --out $@ RuleEngine.ts

raw.js: *.ts
	tsc --out $@ main.ts

unit_test_combined.js: re_lib.js unit_test.js
	rm -f $@
	cat $+ > $@

test: unit_test_combined.js
	nodeunit $<

clean:
	rm -f re_lib.js
	rm -f raw.js
	rm -f unit_test_combined.js

.PHONY: test clean

