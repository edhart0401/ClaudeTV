import test from 'node:test';
import assert from 'node:assert/strict';
import {services,navigate,wrapSelection} from '../compat/home-model.js';
test('all seven destinations have unique IDs and supplied artwork',()=>{
 assert.equal(services.length,7);assert.equal(new Set(services.map(s=>s.id)).size,7);
 assert.equal(services[6].id,'com.webos.app.hdmi2');
 for(const service of services){assert.match(service.artwork,/^logos\//);assert.match(service.ambient,/^#[0-9a-f]{6}$/);}
});
test('hero selection wraps instantly and retains its focus',()=>{
 assert.deepEqual(navigate({active:0,focus:2},'ArrowLeft'),{active:6,focus:2});
 assert.deepEqual(navigate({active:6,focus:2},'ArrowRight'),{active:0,focus:2});
});
test('rail selection tracks focus and returns through hero to utilities',()=>{
 assert.deepEqual(navigate({active:4,focus:2},'ArrowDown'),{active:4,focus:7});
 assert.deepEqual(navigate({active:4,focus:7},'ArrowRight'),{active:5,focus:8});
 assert.deepEqual(navigate({active:5,focus:8},'ArrowUp'),{active:5,focus:2});
 assert.deepEqual(navigate({active:5,focus:2},'ArrowUp'),{active:5,focus:0});
 assert.deepEqual(navigate({active:5,focus:0},'ArrowRight'),{active:5,focus:1});
 assert.deepEqual(navigate({active:5,focus:1},'ArrowDown'),{active:5,focus:2});
});
test('rapid input uses successive states without losing steps',()=>{
 let state={active:0,focus:2};for(let i=0;i<24;i++)state=navigate(state,'ArrowRight');
 assert.equal(state.active,3);assert.equal(wrapSelection(-15),6);
 assert.deepEqual(navigate(state,'unknown'),state);
});
