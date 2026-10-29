#!/bin/sh
# 공부방 지식 지도(kg.js)용 d3 부분 묶음 d3kg.min.js 다시 만들기 — sh tools/build_d3kg.sh
# kg.js에서 d3의 새 함수를 쓰게 되면 아래 entry.js에 한 줄 보태고 다시 돌린다.
set -e
T=$(mktemp -d); cd "$T"
npm init -y >/dev/null
npm i -s d3-selection@3.0.0 d3-drag@3.0.0 d3-zoom@3.0.0 d3-force@3.0.0 d3-transition@3.0.1 esbuild@0.24.0
cat > entry.js <<'JS'
export { select, selectAll } from 'd3-selection';
export { drag } from 'd3-drag';
export { zoom, zoomIdentity } from 'd3-zoom';
export { forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY } from 'd3-force';
import 'd3-transition';
JS
npx esbuild entry.js --bundle --minify --format=iife --global-name=d3 \
  --banner:js="// d3 v7 부분 묶음(selection·drag·zoom·force·transition) — 공부방 지식 지도(kg.js)용. 만드는 법: tools/build_d3kg.sh" \
  --outfile=d3kg.min.js
cd - >/dev/null; cp "$T/d3kg.min.js" ./d3kg.min.js; echo "d3kg.min.js $(wc -c < d3kg.min.js) bytes"
