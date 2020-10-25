import { writable, readable, derived } from "svelte/store";
import csInterface from "helpers/cs-interface.js";

/** app-settings
 *  App settings are runtime settings for controlling various top-level aspects of the experience.
 */

 /** loading
  * A store for controlling if the application is loading or not
  */
export const loading = writable(true);

const extensionID = csInterface.getExtensionID();
const extension = csInterface.getExtensions().find( ext => ext.id === extensionID);

// a store with a reset function
export const panelTitle = (() => {

  const { subscribe, set, update } = writable(extension.name);
  const reset = () => set(extension.name);

  return {
    subscribe,
    set,
    update,
    reset,
  };
})();

const windowTitle = derived([loading, panelTitle], ([$isLoading, $title]) => {
  const title = $isLoading ? `Loading ${extension.name}` : $title;
  return title;
});

windowTitle.subscribe(title => csInterface.setWindowTitle(title));
window._loading = loading;
/**
 * A store for controlling if the application is persistant or not. 
 */
export const isPersistant = writable(false);


isPersistant.subscribe( value => setPersistance(value));

/** setPersistance
 * Set persistance via firing a CSEVENT for photoshop 
 * @param {bool} value 
 */
export function setPersistance(value) {

  let eventName = `"com.adobe.Photoshop${value ? "" : "Un"}Persistent"`
  const event = new CSEvent(eventName, "APPLICATION");
  
  event.extensionId = csInterface.getExtensionID();
  csInterface.dispatchEvent(event);
}

export const isPhotoshop = writable(true);

export const outputLogToConsole = writable(true);

/** fontPreviewAvailable
 * A store to control if we should allow font previews to be displayed
 * At smaller screen sizes it could look very broken
 */
const isFontPreviewableMQ = window.matchMedia('(min-width: 380px)');
export const fontPreviewAvailable = readable(isFontPreviewableMQ.matches, set => {
  
  const update = event => set(event.matches);

  // perform a check shortly after everything settles down
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => set(isFontPreviewableMQ.matches));
  }
  else {
    window.setTimeout(() => set(isFontPreviewableMQ.matches), 1000);
  }

  isFontPreviewableMQ.addEventListener("change", update);
  const unlisten = () => isFontPreviewableMQ.removeEventListener("change", update);

  return unlisten;
});


/** isPanelVisible
 * A store that is mainly for subscribing to — let's us know if the window is yet visible
 * Seems to have better results than csInterface.isWindowVisible()
 */
const isVisibleMQ = window.matchMedia('(min-height: 1px) and (min-width: 1px)');
export const isPanelVisible = readable(isVisibleMQ.matches, set => {

  const update = event => set(event.matches);

  // perform a check shortly after everything settles down
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => set(isVisibleMQ.matches));
  }
  else {
    window.setTimeout(() => set(isVisibleMQ.matches), 1000);
  }

  isVisibleMQ.addEventListener("change", update);
  const unlisten = () => isVisibleMQ.removeEventListener("change", update);

  return unlisten;
});