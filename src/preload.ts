import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    getPreloadPath: () => ipcRenderer.sendSync('get-preload-path'),
    getFilePath: async (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },
    sendMessage: (message: { type: string; data: string; }) => 
        ipcRenderer.invoke('send-message', message)
});
