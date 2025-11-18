const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // Expose Steam API or other Electron features here
  platform: process.platform,
});
