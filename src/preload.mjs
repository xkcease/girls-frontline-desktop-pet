import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('electron_api', {
  setWindowPosition: (x, y) => ipcRenderer.send('set-window-position', x, y),

  async getWindowPosition () {
    const res = await ipcRenderer.invoke('get-window-position');
    return res;
  },

  async getDisplayNearestPoint () {
    return await ipcRenderer.invoke('get-display-nearest-point');
  },

  async isReachScreenEdge () {
    return await ipcRenderer.invoke('is-reach-screen-edge');
  },
});