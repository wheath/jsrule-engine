sh compile.sh
sh cat_lib.sh
cat re_lib.js unit_test.js > unit_test_combined.js
nodeunit unit_test_combined.js
