import {lunaCall} from '../src/lib/luna';
export function launchApp(id,params={}) {
 return lunaCall('luna://com.webos.applicationManager/launch',{id,params}).then(()=>undefined);
}
// webOS 3 does not expose modern LG Home as a launchable app ID.
// Exit this ordinary web app; the physical Home key remains owned by LG.
export function launchLgHome() {
 return Promise.resolve().then(()=>window.close());
}
