(function () {
 'use strict';
 var bridges = [], log = document.getElementById('log'), buttons = document.querySelectorAll('button'), selected = 0;
 function report(message) { log.textContent += message + '\n'; console.log(message); }
 function call(uri, params) {
  if (typeof window.PalmServiceBridge !== 'function') { report('FAIL: PalmServiceBridge unavailable'); return; }
  var bridge = new window.PalmServiceBridge(); bridges.push(bridge);
  var timer = setTimeout(function () { report('TIMEOUT ' + uri); }, 5000);
  bridge.onservicecallback = function (message) { clearTimeout(timer); report(uri + '\n' + message); localStorage.setItem('lastResult', uri + '\n' + message); };
  bridge.call(uri, JSON.stringify(params));
 }
 document.getElementById('read').onclick = function () { call('luna://com.webos.service.eim/getAllInputStatus', {}); };
 document.getElementById('app').onclick = function () { call('luna://com.webos.applicationManager/launch', {id:'com.webos.app.browser'}); };
 document.getElementById('hdmi').onclick = function () { call('luna://com.webos.applicationManager/launch', {id:'com.webos.app.hdmi1'}); };
 document.addEventListener('keydown', function(e) { if(e.keyCode===37||e.keyCode===39){selected=(selected+(e.keyCode===39?1:2))%3;buttons[selected].focus();e.preventDefault();}else if(e.keyCode===13){buttons[selected].click();e.preventDefault();} });
 report(navigator.userAgent); report('Bridge: ' + typeof window.PalmServiceBridge); buttons[0].focus();
 call('luna://com.webos.service.eim/getAllInputStatus', {});
}());
