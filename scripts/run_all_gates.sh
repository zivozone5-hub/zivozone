#!/usr/bin/env bash
# One command, every gate. Exit code != 0 means: do NOT deploy.
#   bash scripts/run_all_gates.sh
set -u
cd "$(dirname "$0")/.."
rc=0
run() { echo; echo "▶ $*"; "$@" || rc=1; }
for f in $(find core zivo-ai.js sw.js -name '*.js'); do node --check "$f" || { echo "SYNTAX FAIL $f"; rc=1; }; done
run python3 scripts/verify_site.py
run python3 scripts/qa_phase1_trust.py
run node --expose-internals scripts/qa_undefined_identifiers.js
run python3 scripts/qa_no_duplicate_boot_fetch.py
run python3 scripts/qa_bundle_freshness.py
run node scripts/qa_answer_key_freshness.js
run node scripts/qa_mcq_length_bias.js
run python3 scripts/qa_lang_home_freshness.py
run python3 scripts/qa_rules_syntax.py
run python3 scripts/qa_i18n_coverage.py
run python3 scripts/qa_i18n_completeness.py
run python3 scripts/qa_no_hardcoded_arabic.py
run python3 scripts/qa_ads_consent.py
run python3 scripts/qa_seo_basics.py
run node scripts/qa_v1228_full.js
run node scripts/qa_game_result_cases.js
run node scripts/question-bank-integrity-v1197-4.js
run python3 scripts/qa_game_platform.py
run python3 scripts/validate_match_data.py
echo; [ $rc -eq 0 ] && echo "ALL GATES PASSED — safe to deploy" || echo "GATE FAILURE — do not deploy"
exit $rc
