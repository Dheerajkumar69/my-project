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
    Object.keys(files).forEach(filename => {
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
            }
        };
        tabBar.appendChild(tab);
    });
}

function updateLineNumbers() {
    const codeArea = document.getElementById('code-area');
    const lineNumbers = document.getElementById('line-numbers');
    const lines = codeArea.value.split('\n');
    const numbers = Array.from({ length: lines.length }, (_, i) => i + 1).join('\n');
    lineNumbers.textContent = numbers;
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
}

function openFile(filename) {
    currentFile = filename;
    const codeArea = document.getElementById('code-area');
    codeArea.value = files[filename];
    updateFileList();
    updateTabs();
    updateLineNumbers();
    updateCursorPosition();
    updateStatusBar();
}

function deleteFile(filename) {
    document.getElementById('delete-file-modal').style.display = 'flex';

    document.getElementById('modal-confirm-delete').onclick = function () {
        delete files[filename];
        if (currentFile === filename) {
            currentFile = Object.keys(files)[0] || null;
            if (currentFile) {
                document.getElementById('code-area').value = files[currentFile];
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

document.getElementById('code-area').addEventListener('input', function (e) {
    if (currentFile) {
        files[currentFile] = e.target.value;
        saveToLocalStorage();
        updateLineNumbers();
        updateCursorPosition();
        updateStatusBar();
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