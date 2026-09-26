#!/usr/bin/env bash
# Round 62: the phone's flight films re-encoded at the phone's own width (1170 x 2532) from the lossless
# masters, H.264 crf 28 tune animation, a key frame at each end (make-flights.mjs encodeOne's rule).
set -e
M=scripts/_scratch-r57/58/flights/master
for mk in $M/*-tall.mkv; do
  pair=$(basename $mk -tall.mkv); a=${pair%%--*}; b=${pair##*--}
  n=$(node -e "console.log(JSON.parse(require('fs').readFileSync('public/flights/$pair-tall.json','utf8')).n)")
  for dir in fwd rev; do
    if [ $dir = fwd ]; then out=public/flights/$a--$b-tall-1170.mp4; vf="scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"; else out=public/flights/$b--$a-tall-1170.mp4; vf="reverse,scale=out_color_matrix=bt709:out_range=tv,format=yuv420p"; fi
    ffmpeg -y -v error -i $mk -vf "$vf" -force_key_frames "expr:eq(n,0)+eq(n,$n)" -c:v libx264 -crf 28 -preset slow -profile:v high -tune animation -an -movflags +faststart -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv $out
    echo "$(basename $out) $(stat -c %s $out)"
  done
done
echo DONE
