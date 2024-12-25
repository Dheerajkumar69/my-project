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

// Show dropdown on button click
document.getElementById('file-button').addEventListener('click', function () {
    const dropdown = document.getElementById('file-dropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
});

// Hide dropdown when clicking outside
window.addEventListener('click', function (event) {
    if (!event.target.matches('#file-button')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].style.display = "none";
        }
    }
});

// Add functionality to dropdown items
document.getElementById('new-text-file').addEventListener('click', function () {
    createFile('untitled.txt');
});

document.getElementById('new-file').addEventListener('click', function () {
    document.getElementById('new-file-modal').style.display = 'flex';
});

document.getElementById('open-file').addEventListener('click', function () {
    // Implement open file functionality
    alert('Open File functionality not implemented yet.');
});

document.getElementById('open-folder').addEventListener('click', function () {
    // Implement open folder functionality
    alert('Open Folder functionality not implemented yet.');
});

document.getElementById('save-file').addEventListener('click', function () {
    saveToLocalStorage();
    alert('File saved!');
});

document.getElementById('save-all').addEventListener('click', function () {
    // Implement save all functionality
    alert('Save All functionality not implemented yet.');
});
function createFile(filename) {
    files[filename] = '';
    currentFile = filename;
    document.getElementById('code-area').value = '';
    saveToLocalStorage();
    updateFileList();
    updateTabs();
}

function openFile(filename) {
    currentFile = filename;
    document.getElementById('code-area').value = files[filename];
    updateFileList();
    updateTabs();
}

function deleteFile(filename) {
    // Show the delete confirmation modal
    document.getElementById('delete-file-modal').style.display = 'flex';

    // Handle the confirmation button
    document.getElementById('modal-confirm-delete').onclick = function () {
        if (confirm(`Are you sure you want to delete ${filename}?`)) {
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
            document.getElementById('delete-file-modal').style.display = 'none'; // Hide modal after deletion
        }
    };

    // Handle the cancel button
    document.getElementById('modal-cancel-delete').onclick = function () {
        document.getElementById('delete-file-modal').style.display = 'none'; // Hide modal on cancel
    };
}


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


document.getElementById('download-file').addEventListener('click', function () {
    if (currentFile && files[currentFile]) {
        const blob = new Blob([files[currentFile]], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFile;
        a.click();
        URL.revokeObjectURL(url);
    }
});

document.getElementById('save-file').addEventListener('click', function () {
    saveToLocalStorage();
    alert('File saved!');
});


if (Object.keys(files).length > 0) {
    document.getElementById('language-select').style.display = 'none';
    document.getElementById('editor-container').style.display = 'flex';
    currentFile = Object.keys(files)[0];
    document.getElementById('code-area').value = files[currentFile];
    updateFileList();
    updateTabs();
}


function updateLineNumbers() {
    const codeArea = document.getElementById('code-area');
    const lineNumbers = document.getElementById('line-numbers');
    const lines = codeArea.value.split('\n');
    const numbers = lines.map((_, i) => i + 1).join('\n');
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
    const lines = codeArea.value.split('\n');
    const characters = codeArea.value.length;
    document.getElementById('stats').textContent =
        `Lines: ${lines.length}  Characters: ${characters}`;
}


document.getElementById('code-area').addEventListener('input', function (e) {
    if (currentFile) {
        files[currentFile] = e.target.value;
        saveToLocalStorage();
        updateLineNumbers();
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
        }
    }
});

document.getElementById('code-area').addEventListener('click', updateCursorPosition);
document.getElementById('code-area').addEventListener('keyup', updateCursorPosition);
document.getElementById('code-area').addEventListener('scroll', function () {
    document.getElementById('line-numbers').scrollTop = this.scrollTop;
});


function initializeEditor() {
    if (Object.keys(files).length > 0) {
        document.getElementById('language-select').style.display = 'none';
        document.getElementById('editor-container').style.display = 'flex';
        currentFile = Object.keys(files)[0];
        document.getElementById('code-area').value = files[currentFile];
        updateFileList();
        updateTabs();
        updateLineNumbers();
        updateCursorPosition();
        updateStatusBar();
    }
}


window.addEventListener('load', initializeEditor);


function updateLineNumbers() {
    const codeArea = document.getElementById('code-area');
    const lineNumbers = document.getElementById('line-numbers');
    const lines = codeArea.value.split('\n');
    lineNumbers.innerHTML = lines.map((_, i) => i + 1).join('<br>');
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
    const lines = codeArea.value.split('\n');
    const characters = codeArea.value.length;
    document.getElementById('stats').textContent =
        `Lines: ${lines.length} Characters: ${characters}`;
}

// Modify the code-area event listeners
document.getElementById('code-area').addEventListener('input', function (e) {
    if (currentFile) {
        files[currentFile] = e.target.value;
        saveToLocalStorage();
        updateLineNumbers();
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
            updateStatusBar();
        }
    }
});

document.getElementById('code-area').addEventListener('click', updateCursorPosition);
document.getElementById('code-area').addEventListener('keyup', updateCursorPosition);
document.getElementById('code-area').addEventListener('scroll', function () {
    document.getElementById('line-numbers').scrollTop = this.scrollTop;
});


function createFile(filename) {
    files[filename] = '';
    currentFile = filename;
    document.getElementById('code-area').value = '';
    saveToLocalStorage();
    updateFileList();
    updateTabs();
    updateLineNumbers();
    updateStatusBar();
    updateCursorPosition();
}


function openFile(filename) {
    currentFile = filename;
    document.getElementById('code-area').value = files[filename];
    updateFileList();
    updateTabs();
    updateLineNumbers();
    updateStatusBar();
    updateCursorPosition();
}


function initializeEditor() {
    if (Object.keys(files).length > 0) {
        document.getElementById('language-select').style.display = 'none';
        document.getElementById('editor-container').style.display = 'flex';
        currentFile = Object.keys(files)[0];
        document.getElementById('code-area').value = files[currentFile];
        updateFileList();
        updateTabs();
        updateLineNumbers();
        updateCursorPosition();
        updateStatusBar();
    }
}
