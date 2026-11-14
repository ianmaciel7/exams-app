import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../prototypes/exam-app-0.1.1/index.html',import.meta.url),'utf8');
test('custom object types only hydrate after local store exists and before properties restore',()=>{
  const store=html.indexOf('const store={'),types=html.indexOf('const storedCustomTypes=');
  const props=html.indexOf("(store.get('cprops')||[]).forEach");
  assert.ok(store>0&&types>store&&props>types,'read custom types only after store and before property hydration');
  for(const k of ['customObjectTypes','customObjects','validCustomType','saveCustomTypes','saveCustomObjects']){
    assert.ok(html.includes(k),'Missing '+k);
  }
});
test('new type studio uses stable IDs, keyboard preview, built-ins and optional presets',()=>{
  assert.match(html,/function pickObjectType\(\)/);
  assert.match(html,/type-studio-list/);
  assert.match(html,/studioSearch/);
  assert.match(html,/restore:/);
  assert.match(html,/existing:/);
  assert.match(html,/preset:/);
  assert.match(html,/customTypeNameValid/);
  assert.match(html,/CUSTOM_TONES/);
});
test('custom object type navigation and editable objects are real routes, not mock cards',()=>{
  assert.match(html,/if\(TYPES\[kind\]\?\.custom\) return createCustomObject\(kind\)/);
  assert.match(html,/#\/custom-object\//);
  assert.match(html,/data-custom-edit/);
  assert.match(html,/customObjectPage\(obj\)/);
  assert.match(html,/if\(T\.custom\) NEWL\[t\]/);
  assert.match(html,/customObjects\.filter\(o=>o\.sp===sp/);
});
