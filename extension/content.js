console.log("CorpCraft Loaded");
let selectedRange = null;
let floatingBtn = null;
let panel = null;
let currentSelectedText = "";
const SUPABASE_URL =
    "https://bffdyysxsblzqhznpygd.supabase.co/functions/v1/MBAfy";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmZmR5eXN4c2JsenFoem5weWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5OTMyNzUsImV4cCI6MjA5NjU2OTI3NX0.4FHTkqDZO96rY5Wvpsr437o0JDWAscOBjlUR8cTR3Io";
function removeButton() {
    if (floatingBtn) {
        floatingBtn.remove();
        floatingBtn = null;
    }
}

function createPanel(selectedText) {
    currentSelectedText = selectedText;
    if (panel) {
        panel.remove();
    }

    panel = document.createElement("div");

    panel.id = "corpcraft-panel";

    panel.innerHTML = `
        <div id="corpcraft-header">

            <div id="corpcraft-title">
                CorpCraft
            </div>

        </div>

        <select id="corpcraft-mode">
            <option value="mbafy">MBAfy</option>
            <option value="productify">Productify</option>
            <option value="consultify">Consultify</option>
            <option value="executify">Executify</option>
            <option value="emailify">Emailify</option>
        </select>

        <textarea readonly>${selectedText}</textarea>

        <textarea 
            id="corpcraft-output"
            placeholder="Output appears here..."
        ></textarea>

        <div id="corpcraft-actions">
            <button id="generate-btn">Generate</button>
            <button id="retry-btn">Retry</button>
            <button id="copy-btn">Copy</button>
            <button id="accept-btn">Accept</button>
            <button id="close-btn">Close</button>
        </div>
    `;

    document.body.appendChild(panel);

    document.getElementById("copy-btn").onclick = () => {

        const output =
            document.getElementById("corpcraft-output").value;

        navigator.clipboard.writeText(output);
    };
   document.getElementById("accept-btn").onclick = () => {

    const output =
        document.getElementById("corpcraft-output").value.trim();

    if (!output) {
        alert("Generate output first.");
        return;
    }

    if (!selectedRange) {
        alert("No text selected.");
        return;
    }

    selectedRange.deleteContents();

    selectedRange.insertNode(
        document.createTextNode(output)
    );

    
    if (panel) {
        panel.remove();
        panel = null;
    }

    removeButton();
};      

    document.getElementById("close-btn").onclick = () => {

        panel.remove();

        panel = null;
    };

    document.getElementById("generate-btn").onclick = async () => {

        const outputBox =
            document.getElementById("corpcraft-output");

        const mode =
            document.getElementById("corpcraft-mode").value;
        const generateBtn = document.getElementById("generate-btn");
        const retryBtn = document.getElementById("retry-btn");


       

        try {

         generateBtn.disabled = true;
         retryBtn.disabled = true;
         outputBox.value = "Generating...";
         const response = await fetch(
            SUPABASE_URL,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    "apikey": SUPABASE_ANON_KEY,

                    "Authorization":
                        "Bearer " + SUPABASE_ANON_KEY
                },

                body: JSON.stringify({
                    text: currentSelectedText,
                    mode: mode
                })
            }
           
        );

        const raw = await response.text();

       

        let data = {};

        try {
            data = JSON.parse(raw);
        } catch {
            console.log("Not JSON");
            }

        

        outputBox.value =
            data.result ||
            "No response received";
        generateBtn.disabled = false;
        retryBtn.disabled = false;
        generateBtn.innerText = "Generate";

   } catch (error) {

    console.error(error);

    generateBtn.disabled = false;
    retryBtn.disabled = false;

    generateBtn.innerText = "Generate";

    outputBox.value =
        "Failed to generate output";
}
};
    document.getElementById("retry-btn").onclick = () => {

    document
        .getElementById("generate-btn")
        .click();
};
    makePanelDraggable();
}

function makePanelDraggable() {

    const panel =
        document.getElementById(
            "corpcraft-panel"
        );

    const header =
        document.getElementById(
            "corpcraft-header"
        );

    let isDragging = false;

    let offsetX = 0;

    let offsetY = 0;

    header.addEventListener(
        "mousedown",
        (e) => {

            isDragging = true;

            offsetX =
                e.clientX -
                panel.offsetLeft;

            offsetY =
                e.clientY -
                panel.offsetTop;

        }
    );

    document.addEventListener(
        "mousemove",
        (e) => {

            if (!isDragging)
                return;

            panel.style.left =
                `${e.clientX - offsetX}px`;

            panel.style.top =
                `${e.clientY - offsetY}px`;

            panel.style.transform =
                "none";
        }
    );

    document.addEventListener(
        "mouseup",
        () => {

            isDragging = false;

        }
    );
}

function createButton(x, y, selectedText) {

    removeButton();

    floatingBtn = document.createElement("div");

    floatingBtn.id = "corpcraft-floating-btn";

    floatingBtn.innerText = "Craft";

    floatingBtn.style.left = `${x}px`;

    floatingBtn.style.top = `${y}px`;

    floatingBtn.addEventListener("mousedown", (e) => {

        e.preventDefault();

        e.stopPropagation();

        

        createPanel(selectedText);

    });

    document.body.appendChild(floatingBtn);

    
}

document.addEventListener("mouseup", () => {

    const selection = window.getSelection();
    if (!selection.rangeCount) {return;}

    selectedRange = selection
        .getRangeAt(0)
        .cloneRange();

    const selectedText =
        selection.toString().trim();

    if (!selectedText) {

        removeButton();

        return;
    }

    const rect =
        selection
            .getRangeAt(0)
            .getBoundingClientRect();

    createButton(
        rect.right + window.scrollX + 10,
        rect.top + window.scrollY,
        selectedText
    );

});
document.addEventListener("keydown",(e) => {

        const shortcutPressed =

            (
                e.ctrlKey &&
                e.shiftKey &&
                e.key.toLowerCase() === "k"
            )

            ||

            (
                e.altKey &&
                e.key.toLowerCase() === "c"
            );

        if (!shortcutPressed) {
            return;
        }

        e.preventDefault();

        e.stopPropagation();

        const selectedText =
            window
                .getSelection()
                .toString()
                .trim();

        if (!selectedText) {

            alert(
                "Select some text first."
            );

            return;
        }

        removeButton();

        createPanel(
            selectedText
        );
    }
);