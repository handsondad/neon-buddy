import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { RECORDS } from "../src/records/index.ts";
import { clipHash, clipKey } from "../tools/voice/voices.mjs";

const manifest = JSON.parse(readFileSync(new URL("../src/qa/voice-manifest.json", import.meta.url), "utf8"));

test("每一句问答都有配音，而且配音读的是现在的文字", () => {
  const missing = [];
  for (const record of RECORDS) {
    record.dialogue.forEach((turn, index) => {
      for (const who of ["nian", "dad"]) {
        const key = clipKey(record.id, index, who);
        const clip = manifest.clips[key];
        if (!clip) missing.push(`${key} 没有配音`);
        else if (clip.hash !== clipHash(who, turn[who])) missing.push(`${key} 文字改过了`);
        else if (!existsSync(new URL(`../public/voice/${key}.mp3`, import.meta.url))) missing.push(`${key} 缺音频文件`);
      }
    });
  }
  assert.deepEqual(missing.slice(0, 10), [], `共 ${missing.length} 句要重新配音：npm run voice`);
});

test("配音没有多出来的：删掉的问答，音频也要删", () => {
  const keys = new Set(RECORDS.flatMap((r) => r.dialogue.flatMap((_, i) => [clipKey(r.id, i, "nian"), clipKey(r.id, i, "dad")])));
  assert.deepEqual(Object.keys(manifest.clips).filter((k) => !keys.has(k)), []);
});
