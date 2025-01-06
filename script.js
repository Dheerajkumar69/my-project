const languageExtensions = {
    javascript: 'js',
    python: 'py',
    html: 'html',
    css: 'css',
    java: 'java',
    cpp: 'cpp',
    txt: 'txt'
};

const languageNames = {
    javascript: 'JavaScript',
    python: 'Python',
    html: 'HTML',
    css: 'CSS',
    java: 'Java',
    cpp: 'C++',
    txt: 'Text'
};

let files = {};
let currentFile = null;
let currentFolder = null;

// Load files from localStorage
if (localStorage.getItem('files')) {
    files = JSON.parse(localStorage.getItem('files'));
}

function saveToLocalStorage() {
    localStorage.setItem('files', JSON.stringify(files));
}

function updateFileList() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';

    // Separate folders and files
    const folders = Object.keys(files).filter(filename => typeof files[filename] === 'object');
    const regularFiles = Object.keys(files).filter(filename => typeof files[filename] !== 'object');

    // Append folders first
    folders.forEach(foldername => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item folder';
        fileItem.innerHTML = `
            <span class="folder-arrow" onclick="toggleFolder('${foldername}')">▶</span>
            <span>${foldername}</span>
        `;
        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';
        folderContent.id = `folder-${foldername}`;
        Object.keys(files[foldername]).forEach(subfile => {
            const subfileItem = document.createElement('div');
            subfileItem.className = `file-item ${currentFile === `${foldername}/${subfile}` ? 'active' : ''}`;
            subfileItem.innerHTML = `
                <span>${subfile}</span>
                <span class="tab-close" onclick="deleteFile('${foldername}/${subfile}')">×</span>
            `;
            subfileItem.onclick = (e) => {
                if (!e.target.classList.contains('tab-close')) {
                    openFile(`${foldername}/${subfile}`);
                }
            };
            folderContent.appendChild(subfileItem);
        });
        fileList.appendChild(fileItem);
        fileList.appendChild(folderContent);
    });

    // Append regular files
    regularFiles.forEach(filename => {
        const fileItem = document.createElement('div');
        fileItem.className = `file-item ${currentFile === filename ? 'active' : ''}`;
        fileItem.innerHTML = `
            <span>${filename}</span>
            <span class="tab-close" onclick="deleteFile('${filename}')">×</span>
        `;
        fileItem.onclick = (e) => {
            if (!e.target.classList.contains('tab-close')) {
                openFile(filename);
            }
        };
        fileList.appendChild(fileItem);
    });
}

function updateTabs() {
    const tabBar = document.getElementById('tab-bar');
    tabBar.innerHTML = '';
    Object.keys(files).forEach(filename => {
        const tab = document.createElement('button');
        tab.className = `tab ${currentFile === filename ? 'active' : ''}`;
        tab.innerHTML = `
            ${filename}
            <span class="tab-close" onclick="deleteFile('${filename}')">×</span>
        `;
        tab.onclick = (e) => {
            if (!e.target.classList.contains('tab-close')) {
                openFile(filename);
                updateLanguageStatus(filename); // Update language status when tab is changed
            }
        };
        tabBar.appendChild(tab);
    });
}

function updateLanguageStatus(filename) {
    const extension = filename.split('.').pop();
    const language = Object.keys(languageExtensions).find(key => languageExtensions[key] === extension);
    if (language) {
        document.getElementById('language-status').textContent = languageNames[language];
    } else {
        document.getElementById('language-status').textContent = 'Unknown';
    }
}

function updateLineNumbers() {
    const codeArea = document.getElementById('code-area');
    const lineNumbers = document.getElementById('line-numbers');
    const lines = codeArea.value.split('\n');
    const numbers = Array.from({ length: lines.length }, (_, i) => i + 1).join('\n');
    lineNumbers.textContent = numbers;
    
    // Match line height with code area
    lineNumbers.style.lineHeight = window.getComputedStyle(codeArea).lineHeight;
    lineNumbers.style.paddingTop = window.getComputedStyle(codeArea).paddingTop;
}

function updateCursorPosition() {
    const codeArea = document.getElementById('code-area');
    const position = codeArea.selectionStart;
    const text = codeArea.value.substring(0, position);
    const lines = text.split('\n');
    const currentLine = lines.length;
    const currentColumn = lines[lines.length - 1].length + 1;

    document.getElementById('cursor-position').textContent =
        `Ln ${currentLine}, Col ${currentColumn}`;
}

function updateStatusBar() {
    const codeArea = document.getElementById('code-area');
    const text = codeArea.value;
    const lines = text.split('\n');
    const characters = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    document.getElementById('stats').textContent =
        `Lines: ${lines.length} Words: ${words} Characters: ${characters}`;
}

function createFile(filename) {
    if (!filename.includes('.')) {
        showAlertWithExtensionPrompt('Filename must include an extension.', filename, createFile);
        return;
    }
    files[filename] = '';
    currentFile = filename;
    const codeArea = document.getElementById('code-area');
    codeArea.value = '';
    saveToLocalStorage();
    updateFileList();
    updateTabs();
    updateLineNumbers();
    updateCursorPosition();
    updateStatusBar();
    updateMinimap();
}

function createFileInFolder(foldername, filename) {
    if (!filename.includes('.')) {
        showAlertWithExtensionPrompt('Filename must include an extension.', filename, (newFilename) => createFileInFolder(foldername, newFilename));
        return;
    }
    if (!files[foldername][filename]) {
        files[foldername][filename] = '';
        saveToLocalStorage();
        updateFileList();
    }
}

function showAlert(message) {
    const alertBox = document.createElement('div');
    alertBox.className = 'alert-box';
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(alertBox);
        }, 500);
    }, 2000);
}

function showAlertWithExtensionPrompt(message, filename, callback) {
    const alertBox = document.createElement('div');
    alertBox.className = 'alert-box';
    alertBox.innerHTML = `
        <p>${message}</p>
        <input type="text" id="extension-input" placeholder="Enter extension">
        <button id="extension-confirm">Confirm</button>
    `;
    document.body.appendChild(alertBox);

    document.getElementById('extension-confirm').onclick = () => {
        const extension = document.getElementById('extension-input').value;
        if (extension) {
            document.body.removeChild(alertBox);
            callback(`${filename}.${extension}`);
        }
    };

    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(alertBox)) {
                document.body.removeChild(alertBox);
            }
        }, 500);
    }, 5000);
}

function openFile(filename) {
    currentFile = filename;
    const codeArea = document.getElementById('code-area');
    codeArea.value = getFileContent(filename);
    updateFileList();
    updateTabs();
    updateLineNumbers();
    updateCursorPosition();
    updateStatusBar();
    updateMinimap();
    updateLanguageStatus(filename); // Update language status when file is opened
}

function getFileContent(filename) {
    const parts = filename.split('/');
    let content = files;
    parts.forEach(part => {
        content = content[part];
    });
    return content;
}

function deleteFile(filename) {
    document.getElementById('delete-file-modal').style.display = 'flex';

    document.getElementById('modal-confirm-delete').onclick = function () {
        const parts = filename.split('/');
        let current = files;
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]];
        }
        delete current[parts[parts.length - 1]];
        if (currentFile === filename) {
            currentFile = Object.keys(files)[0] || null;
            if (currentFile) {
                document.getElementById('code-area').value = getFileContent(currentFile);
            } else {
                document.getElementById('code-area').value = '';
            }
        }
        saveToLocalStorage();
        updateFileList();
        updateTabs();
        updateLineNumbers();
        updateCursorPosition();
        updateStatusBar();
        document.getElementById('delete-file-modal').style.display = 'none';
    };

    document.getElementById('modal-cancel-delete').onclick = function () {
        document.getElementById('delete-file-modal').style.display = 'none';
    };
}

// Event Listeners
document.getElementById('file-button').addEventListener('click', function () {
    const dropdown = document.getElementById('file-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

document.getElementById('edit-button').addEventListener('click', function () {
    const dropdown = document.getElementById('edit-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

window.addEventListener('click', function (event) {
    if (!event.target.matches('#file-button') && !event.target.matches('#edit-button')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].style.display = "none";
        }
    }
});

document.getElementById('new-text-file').addEventListener('click', function () {
    createFile('untitled.txt');
});

document.getElementById('new-file').addEventListener('click', function () {
    document.getElementById('new-file-modal').style.display = 'flex';
});

document.getElementById('modal-cancel').addEventListener('click', function () {
    document.getElementById('new-file-modal').style.display = 'none';
});

document.getElementById('modal-create').addEventListener('click', function () {
    const filename = document.getElementById('new-filename').value;
    if (filename) {
        createFile(filename);
        document.getElementById('new-file-modal').style.display = 'none';
        document.getElementById('new-filename').value = '';
    }
});

document.getElementById('new-folder').addEventListener('click', function () {
    document.getElementById('new-folder-modal').style.display = 'flex';
});

document.getElementById('modal-cancel-folder').addEventListener('click', function () {
    document.getElementById('new-folder-modal').style.display = 'none';
});

document.getElementById('modal-create-folder').addEventListener('click', function () {
    const foldername = document.getElementById('new-foldername').value;
    if (foldername) {
        createFolder(foldername);
        document.getElementById('new-folder-modal').style.display = 'none';
        document.getElementById('new-foldername').value = '';
    }
});

document.getElementById('new-file-in-folder').addEventListener('click', function () {
    document.getElementById('new-file-in-folder-modal').style.display = 'flex';
});

document.getElementById('modal-cancel-file-in-folder').addEventListener('click', function () {
    document.getElementById('new-file-in-folder-modal').style.display = 'none';
});

document.getElementById('modal-create-file-in-folder').addEventListener('click', function () {
    const filename = document.getElementById('new-filename-in-folder').value;
    if (filename && currentFolder) {
        createFileInFolder(currentFolder, filename);
        document.getElementById('new-file-in-folder-modal').style.display = 'none';
        document.getElementById('new-filename-in-folder').value = '';
    }
});

document.getElementById('code-area').addEventListener('input', function (e) {
    if (currentFile) {
        files[currentFile] = e.target.value;
        saveToLocalStorage();
        updateLineNumbers();
        updateCursorPosition();
        updateStatusBar();
        updateMinimap();
    }
});

document.getElementById('code-area').addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
        if (currentFile) {
            files[currentFile] = this.value;
            saveToLocalStorage();
            updateLineNumbers();
            updateCursorPosition();
            updateStatusBar();
        }
    }
});

document.getElementById('code-area').addEventListener('click', () => {
    updateCursorPosition();
    updateStatusBar();
});

document.getElementById('code-area').addEventListener('keyup', () => {
    updateCursorPosition();
    updateStatusBar();
});

document.getElementById('language-dropdown').addEventListener('change', function (e) {
    const language = e.target.value;
    if (language) {
        document.getElementById('language-select').style.display = 'none';
        document.getElementById('editor-container').style.display = 'flex';
        document.getElementById('language-status').textContent = languageNames[language];
        const extension = languageExtensions[language];
        createFile(`untitled.${extension}`);
    }
});

// Initialize editor
function initializeEditor() {
    document.getElementById('language-select').style.display = 'flex';
    document.getElementById('editor-container').style.display = 'none';
}

// Initialize on load
window.addEventListener('load', initializeEditor);

// Context Menu Functionality
let contextMenuVisible = false;
const contextMenu = document.getElementById('context-menu');

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    const { clientX: mouseX, clientY: mouseY } = e;
    contextMenu.style.top = `${mouseY}px`;
    contextMenu.style.left = `${mouseX}px`;
    contextMenu.style.display = 'block';
    contextMenuVisible = true;

    const target = e.target.closest('.file-item.folder');
    if (target) {
        currentFolder = target.querySelector('span:nth-child(2)').textContent;
        document.getElementById('new-file-in-folder').style.display = 'block';
    } else {
        currentFolder = null;
        document.getElementById('new-file-in-folder').style.display = 'none';
    }
});

document.addEventListener('click', function () {
    if (contextMenuVisible) {
        contextMenu.style.display = 'none';
        contextMenuVisible = false;
    }
});

function renameFile(oldName, newName) {
    if (newName && oldName !== newName) {
        files[newName] = files[oldName];
        delete files[oldName];
        currentFile = newName;
        saveToLocalStorage();
        updateFileList();
        updateTabs();
    }
}

document.getElementById('rename').addEventListener('click', function () {
    if (currentFile) {
        const fileList = document.getElementById('file-list');
        const fileItem = Array.from(fileList.children).find(item => item.textContent.includes(currentFile));
        if (fileItem) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentFile;
            input.className = 'rename-input';
            fileItem.replaceChild(input, fileItem.firstChild);
            input.focus();
            input.select();

            input.addEventListener('blur', function () {
                renameFile(currentFile, input.value);
            });

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    input.blur();
                } else if (e.key === 'Escape') {
                    fileItem.replaceChild(document.createTextNode(currentFile), input);
                }
            });
        }
    }
});

document.getElementById('cut').addEventListener('click', function () {
    document.execCommand('cut');
});

document.getElementById('copy').addEventListener('click', function () {
    document.execCommand('copy');
});

document.getElementById('paste').addEventListener('click', function () {
    document.execCommand('paste');
});

document.getElementById('undo').addEventListener('click', function () {
    document.execCommand('undo');
});

document.getElementById('redo').addEventListener('click', function () {
    document.execCommand('redo');
});

document.getElementById('find-replace').addEventListener('click', function () {
    document.getElementById('find-replace-modal').style.display = 'flex';
});

document.getElementById('find-replace-cancel').addEventListener('click', function () {
    document.getElementById('find-replace-modal').style.display = 'none';
});

document.getElementById('find-replace-confirm').addEventListener('click', function () {
    const findText = document.getElementById('find-text').value;
    const replaceText = document.getElementById('replace-text').value;
    if (findText && replaceText) {
        const codeArea = document.getElementById('code-area');
        codeArea.value = codeArea.value.split(findText).join(replaceText);
        if (currentFile) {
            files[currentFile] = codeArea.value;
            saveToLocalStorage();
            updateLineNumbers();
            updateCursorPosition();
            updateStatusBar();
        }
    }
    document.getElementById('find-replace-modal').style.display = 'none';
});

document.getElementById('theme-toggle-button').addEventListener('click', function () {
    const body = document.body;
    const themeToggleButton = document.getElementById('theme-toggle-button');
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        themeToggleButton.textContent = 'Light Mode';
    } else {
        body.classList.add('light-mode');
        themeToggleButton.textContent = 'Dark Mode';
    }
});

function updateMinimap() {
    const codeArea = document.getElementById('code-area');
    const minimapContent = document.getElementById('minimap-content');
    const minimap = document.getElementById('minimap');
    
    // Update content
    minimapContent.textContent = codeArea.value;
    
    // Calculate the available height for minimap
    const minimapHeight = minimap.clientHeight;
    const contentHeight = codeArea.scrollHeight;
    
    // Calculate scale while maintaining readability
    let scale = minimapHeight / contentHeight;
    if (scale > 1) scale = 1; // Don't scale up if content is smaller
    if (scale < 0.1) scale = 0.1; // Don't scale down too much
    
    // Apply transform
    minimapContent.style.transform = `scale(${scale})`;
    minimapContent.style.width = `${120 / scale}px`; // Adjust width to prevent text wrapping
    
    // Update slider
    let slider = minimap.querySelector('.minimap-slider');
    if (!slider) {
        slider = document.createElement('div');
        slider.className = 'minimap-slider';
        minimap.appendChild(slider);
    }
    
    // Calculate slider dimensions
    const visiblePercentage = codeArea.clientHeight / codeArea.scrollHeight;
    const sliderHeight = Math.max(minimapHeight * visiblePercentage, 30);
    const scrollRatio = codeArea.scrollTop / (codeArea.scrollHeight - codeArea.clientHeight);
    const sliderTop = (minimapHeight - sliderHeight) * scrollRatio;
    
    // Update slider position
    slider.style.height = `${sliderHeight}px`;
    slider.style.top = `${sliderTop}px`;

    // Update highlighted section
    let highlight = minimap.querySelector('.minimap-highlight');
    if (!highlight) {
        highlight = document.createElement('div');
        highlight.className = 'minimap-highlight';
        minimap.appendChild(highlight);
    }
    highlight.style.height = `${sliderHeight}px`;
    highlight.style.top = `${sliderTop}px`;

    // Update selection highlight
    updateMinimapSelection();
}

function updateMinimapSelection() {
    const codeArea = document.getElementById('code-area');
    const minimap = document.getElementById('minimap');
    const minimapContent = document.getElementById('minimap-content');
    
    const selectionStart = codeArea.selectionStart;
    const selectionEnd = codeArea.selectionEnd;
    
    const startLine = codeArea.value.substring(0, selectionStart).split('\n').length - 1;
    const endLine = codeArea.value.substring(0, selectionEnd).split('\n').length - 1;
    
    const lineHeight = parseFloat(window.getComputedStyle(codeArea).lineHeight);
    const scale = minimapContent.getBoundingClientRect().height / codeArea.scrollHeight;
    
    let selectionHighlight = minimap.querySelector('.minimap-selection');
    if (!selectionHighlight) {
        selectionHighlight = document.createElement('div');
        selectionHighlight.className = 'minimap-selection';
        minimap.appendChild(selectionHighlight);
    }
    
    selectionHighlight.style.top = `${startLine * lineHeight * scale}px`;
    selectionHighlight.style.height = `${(endLine - startLine + 1) * lineHeight * scale}px`;
}

// Add resize handler to update minimap when window is resized
window.addEventListener('resize', updateMinimap);

let isDragging = false;
let startY = 0;
let startScroll = 0;

document.addEventListener('DOMContentLoaded', function() {
    const minimap = document.getElementById('minimap');
    const codeArea = document.getElementById('code-area');

    minimap.addEventListener('mousedown', function(e) {
        const slider = minimap.querySelector('.minimap-slider');
        if (e.target === slider) {
            isDragging = true;
            slider.classList.add('dragging'); // Add dragging class
            startY = e.clientY;
            startScroll = codeArea.scrollTop;
            document.body.style.userSelect = 'none';
        } else {
            // Click anywhere on minimap to scroll
            const rect = minimap.getBoundingClientRect();
            const percentage = (e.clientY - rect.top) / rect.height;
            codeArea.scrollTop = percentage * (codeArea.scrollHeight - codeArea.clientHeight);
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const deltaY = e.clientY - startY;
            const percentage = deltaY / minimap.offsetHeight;
            const scroll = startScroll + percentage * codeArea.scrollHeight;
            codeArea.scrollTop = scroll;
        }
    });

    document.addEventListener('mouseup', function() {
        const slider = minimap.querySelector('.minimap-slider');
        if (isDragging) {
            slider.classList.remove('dragging'); // Remove dragging class
        }
        isDragging = false;
        document.body.style.userSelect = '';
    });
});

// Update existing scroll handler
document.getElementById('code-area').addEventListener('scroll', function() {
    document.getElementById('line-numbers').scrollTop = this.scrollTop;
    updateMinimap();
});

// Update selection handler
document.getElementById('code-area').addEventListener('select', updateMinimapSelection);

function createFolder(foldername) {
    if (!files[foldername]) {
        files[foldername] = {};
        saveToLocalStorage();
        updateFileList();
    }
}

function toggleFolder(foldername) {
    const folderContent = document.getElementById(`folder-${foldername}`);
    const folderArrow = folderContent.previousElementSibling.querySelector('.folder-arrow');
    if (folderContent.style.display === 'none') {
        folderContent.style.display = 'block';
        folderArrow.textContent = '▼';
    } else {
        folderContent.style.display = 'none';
        folderArrow.textContent = '▶';
    }
}