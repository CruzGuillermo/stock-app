const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Aquí podés exponer métodos seguros si los necesitás
});
