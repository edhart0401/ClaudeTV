import test from 'node:test';
import assert from 'node:assert/strict';
import {PowerCycle} from '../scripts/mac-autostart.mjs';
test('does not interrupt TV already on when helper starts',()=>{
 const s=new PowerCycle();assert.equal(s.observe(true,0),false);assert.equal(s.observe(true,5000),false);
});
test('launches once after confirmed standby and ignores single network failure',()=>{
 const s=new PowerCycle();s.observe(true,0);s.observe(false,5000);
 assert.equal(s.observe(true,10000),false);
 s.observe(false,15000);s.observe(false,20000);
 assert.equal(s.observe(true,25000),true);assert.equal(s.observe(true,30000),false);
});
test('Mac sleep resets baseline rather than interrupting an active TV',()=>{
 const s=new PowerCycle();s.observe(false,0);s.observe(false,5000);
 assert.equal(s.observe(true,120000),false);
});
