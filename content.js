console.log("Content script is running.");

const container = document.createElement('div');
container.style.position = 'fixed';
container.style.maxWidth = '300px';
container.style.minWidth = '300px';
container.style.top = '10px';
container.style.right = '40vw';
container.style.padding = '10px';
container.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
container.style.border = '1px solid #ccc';
container.style.zIndex = '10000';
container.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
container.style.borderRadius = '5px';
container.style.display = 'flex';
container.style.alignItems = 'center';
container.style.backdropFilter = 'blur(10px)';
container.style.cursor = 'move'; 

const highlightColorInput = document.createElement('input');
highlightColorInput.type = 'color';
highlightColorInput.value = '#ffff00'; 
highlightColorInput.style.marginRight = '10px';

const eraser = document.createElement('button');
eraser.textContent = 'Eraser';
eraser.style.marginRight = '10px';
eraser.addEventListener('click', () => {
    highlightColorInput.value = '#ffffff';
});

const clearBtn = document.createElement('button');
clearBtn.textContent = 'Clear';
clearBtn.style.marginRight = '10px';

const closeBtn = document.createElement('button');
closeBtn.textContent = 'Close';
closeBtn.style.marginLeft = 'auto'; 

container.appendChild(highlightColorInput);
container.appendChild(eraser);
container.appendChild(clearBtn);
container.appendChild(closeBtn);
document.body.appendChild(container);

console.log("Container added to the page.");


function highlightSelection(color) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const highlightedText = document.createElement('span');
        highlightedText.style.backgroundColor = color;
        range.surroundContents(highlightedText);
        saveHighlights();
        console.log("Text highlighted.");
    }
}


function saveHighlights() {
    const highlights = [];
    document.querySelectorAll('span[style*="background-color"]').forEach(span => {
        highlights.push({
            text: span.innerText,
            color: span.style.backgroundColor,
            parentXPath: getXPath(span.parentNode)
        });
    });
    localStorage.setItem('highlights', JSON.stringify(highlights));
    console.log("Highlights saved.");
}


function loadHighlights() {
    const highlights = JSON.parse(localStorage.getItem('highlights') || '[]');
    highlights.forEach(item => {
        const parent = getElementByXPath(item.parentXPath);
        if (parent) {
            const highlightedText = document.createElement('span');
            highlightedText.style.backgroundColor = item.color;
            highlightedText.innerText = item.text;
            parent.innerHTML = parent.innerHTML.replace(item.text, highlightedText.outerHTML);
        }
    });
    console.log("Highlights loaded.");
}


function getXPath(element) {
    if (element.id !== '') return 'id("' + element.id + '")';
    if (element === document.body) return element.tagName;

    let ix = 0;
    const siblings = element.parentNode.childNodes;
    for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) return getXPath(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) ix++;
    }
}


function getElementByXPath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}


document.addEventListener('mouseup', function () {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
        const color = highlightColorInput.value;
        highlightSelection(color);
    }
});

clearBtn.addEventListener('click', function () {
    console.log("Clear button clicked.");
    const highlightedText = document.querySelectorAll('span[style*="background-color"]');
    highlightedText.forEach(node => {
        const parent = node.parentNode;
        while (node.firstChild) {
            parent.insertBefore(node.firstChild, node);
        }
        parent.removeChild(node);
        parent.normalize();
    });
    localStorage.removeItem('highlights');
    console.log("Highlights cleared.");
});

closeBtn.addEventListener('click', function () {
    console.log("Close button clicked.");
    document.body.removeChild(container);
    console.log("Container closed.");
});


let isDragging = false;
let offsetX, offsetY;

container.addEventListener('mousedown', function (e) {
    isDragging = true;
    offsetX = e.clientX - container.getBoundingClientRect().left;
    offsetY = e.clientY - container.getBoundingClientRect().top;
    container.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', function (e) {
    if (isDragging) {
        container.style.left = e.clientX - offsetX + 'px';
        container.style.top = e.clientY - offsetY + 'px';
    }
});

document.addEventListener('mouseup', function () {
    isDragging = false;
    container.style.cursor = 'move';
});


window.addEventListener('load', loadHighlights);
