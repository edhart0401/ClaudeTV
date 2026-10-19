// Explicit shortcuts: no installed-app probing and no Homebrew/root provider.
import shortcuts from './shortcuts.json';
export function listApps() {
 return Promise.resolve({source:'catalog', apps:shortcuts.map(app => ({...app, iconUrl:app.icon ? 'icons/apps/' + app.icon : undefined}))});
}
