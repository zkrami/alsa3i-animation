const { ipcRenderer } = require('electron');

function handleData(toDownload){
    ipcRenderer.send('save-data', toDownload);
}