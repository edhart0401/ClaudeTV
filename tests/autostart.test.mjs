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
test('fast reconnect triggers launch without waiting for a power query',()=>{
 const s=new PowerCycle();s.observe(true,0);
 s.observe(false,500);s.observe(false,1750);
 assert.equal(s.observe(true,2000),true);
 assert.equal(s.observe(true,2001),false);
});
test('repeated standby observations arm a connected TV for Active transition',()=>{
 const s=new PowerCycle();s.observe(true,0);
 s.observe(false,500);s.observe(false,1000);
 assert.equal(s.observe(true,1500),true);
 assert.equal(s.observe(true,2000),false);
});
test('silent connection is inactive after four seconds, expired after five',async()=>{
 const {connectionHealth}=await import('../scripts/mac-autostart.mjs');
 assert.equal(connectionHealth(1000,4999),'healthy');
 assert.equal(connectionHealth(1000,5000),'inactive');
 assert.equal(connectionHealth(1000,6000),'expired');
});
