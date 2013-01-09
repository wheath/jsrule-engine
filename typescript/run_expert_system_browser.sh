sh compile.sh
sh cat_lib.sh
cat re_lib.js expert_system.js > expert_system_combined.js
cp expert_system_combined.js js
sh create_re_test_html.sh
/opt/google/chrome/google-chrome re_test.html
