import {lunaCall} from '../src/lib/luna';
export function normalizeInputs(response) {
 if (!response || !Array.isArray(response.devices)) throw new Error('TV input response must contain a devices array');
 return [{id:'LIVE_TV', appId:'com.webos.app.livetv',label:'Live TV',port:0,connected:true,icon:'tv.png'}].concat(response.devices.filter(d => d.appId && d.label).map(d => ({id:d.id,appId:d.appId,label:d.label,port:d.port,connected:typeof d.connected === 'boolean' ? d.connected : d.activate === true,icon:d.icon || 'hdmigeneric.png'})));
}
export function listInputs() {
 return lunaCall('luna://com.webos.service.eim/getAllInputStatus',{}).then(normalizeInputs);
}
export const MOCK_INPUTS = normalizeInputs({devices:[{id:'HDMI_1',appId:'com.webos.app.hdmi1',label:'HDMI 1',port:1,activate:true},{id:'HDMI_2',appId:'com.webos.app.hdmi2',label:'HDMI 2',port:2,activate:false},{id:'HDMI_3',appId:'com.webos.app.hdmi3',label:'HDMI 3',port:3,activate:false}]});
