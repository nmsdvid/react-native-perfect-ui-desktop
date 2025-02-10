import './index.css';

interface FileInputElement extends HTMLInputElement {
    files: FileList;
}

declare global {
    interface Window {
        electronAPI: {
            getFilePath: (file: File) => Promise<string>;
            sendMessage: (message: {
                type: string;
                data?: string;
                value?: number | boolean;
                left?: number;
                top?: number;
            }) => Promise<void>;
        }
    }
}

let isVisible = true;

function sendMove(x: number, y: number) {
    window.electronAPI.sendMessage({ 
        type: "position", 
        left: x,
        top: y
    });
}

function moveUp() { 
    sendMove(0, -10); 
}

function moveDown() { 
    sendMove(0, 10); 
}

function moveLeft() { 
    sendMove(-10, 0); 
}

function moveRight() { 
    sendMove(10, 0); 
}

function sendOpacity() {
    const opacitySlider = document.getElementById("opacitySlider") as HTMLInputElement;
    const opacityValue = document.getElementById('opacityValue') as HTMLElement;

    const opacity = Math.max(0, Math.min(1, parseFloat(opacitySlider.value) || 0));

    opacityValue.textContent = `${Math.round(opacity * 100)}%`;

    window.electronAPI.sendMessage({ 
        type: "opacity", 
        value: opacity
    });
}

function toggleVisibility() {
    isVisible = !isVisible;
    window.electronAPI.sendMessage({ 
        type: "visibility", 
        value: isVisible
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('uploadImage') as FileInputElement;
    if (fileInput) {
        fileInput.addEventListener('change', async () => {
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

    const upBtn = document.getElementById('moveUp');
    const downBtn = document.getElementById('moveDown');
    const leftBtn = document.getElementById('moveLeft');
    const rightBtn = document.getElementById('moveRight');
    const opacitySlider = document.getElementById('opacitySlider');
    const visibilityToggle = document.getElementById('visibilityToggle');

    if (upBtn) upBtn.addEventListener('click', moveUp);
    if (downBtn) downBtn.addEventListener('click', moveDown);
    if (leftBtn) leftBtn.addEventListener('click', moveLeft);
    if (rightBtn) rightBtn.addEventListener('click', moveRight);
    if (opacitySlider) opacitySlider.addEventListener('change', sendOpacity);
    if (visibilityToggle) visibilityToggle.addEventListener('change', toggleVisibility);
});
