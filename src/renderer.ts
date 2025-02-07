import './index.css';

// Renderer process (frontend)
interface FileInputElement extends HTMLInputElement {
    files: FileList;
}

// We need to use the contextBridge API exposed by preload script
declare global {
    interface Window {
        electronAPI: {
            getFilePath: (file: File) => Promise<string>;
            sendMessage: (message: { type: string; data: string }) => Promise<void>;
        }
    }
}

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', () => {
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    if (uploadImageBtn) {
        uploadImageBtn.addEventListener('click', async () => {
            const fileInput = document.getElementById('uploadImage') as FileInputElement;
            
            if (fileInput.files && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                try {
                    // Get the base64 data URL
                    const dataUrl = await window.electronAPI.getFilePath(file);                    
                    await window.electronAPI.sendMessage({
                        type: "image",
                        data: dataUrl
                    });
                } catch (error) {
                    console.error('Error:', error);
                }
            } else {
                console.log('No file selected');
            }
        });
    }
});
