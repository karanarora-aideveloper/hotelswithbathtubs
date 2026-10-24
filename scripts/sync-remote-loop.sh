#!/bin/bash
# Every 8 minutes: pull the spare laptop's results and apply them to MongoDB, until its run ends.
TAG="${1:-remote}"
cd "$(dirname "$0")/.."
while true; do
  scp -q -o BatchMode=yes -o ConnectTimeout=30 laptop-remote:hwb-links/.cache/link-repair-state.$TAG.json .cache/link-repair-state.$TAG.json 2>/dev/null \
    && node scripts/apply-remote-results.mjs --apply --tag=$TAG 2>&1 | tail -2
  if ! ssh -o BatchMode=yes -o ConnectTimeout=30 laptop-remote 'pgrep -f "[-]-tag $TAG" >/dev/null' 2>/dev/null; then
    echo "remote run ended; final sync"; sleep 3
    scp -q -o BatchMode=yes -o ConnectTimeout=30 laptop-remote:hwb-links/.cache/link-repair-state.$TAG.json .cache/link-repair-state.$TAG.json && node scripts/apply-remote-results.mjs --apply --tag=$TAG 2>&1 | tail -2
    echo SYNC-FINISHED; break
  fi
  sleep 480
done
