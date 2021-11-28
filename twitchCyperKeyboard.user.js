// ==UserScript==
// @name        Clavier de chiffrement
// @namespace   https://www.twitch.tv/
// @description Permet de chiffrer/déchiffrer des messages sur le tchat Twitch de la chaîne de Durss
// @include     https://www.twitch.tv/*
// @version     1
// @author      Durss
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==


(function() {
    let cypherEnabled = false;
    let toolsHolder = null;
    let alertHolder = null;
    let toggleButton = null;
    let alertDiv = null;
    let chatInput = null;
    let chatMessages = null;
    let submitBt = null;
    let allowEvent = false;
    let cypherKey = null;
    let cypherKeyMinLength = 10;
    let listenersAdded = false;
    let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/=";
    let charsReplacements = "‒–—―ꟷ‖∕⁄⌠⌡─ꞁ│┌┐└┘├┤┬┴┼═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥╦╨╧╩╪╫╬▬ɭƖſ∏¦|[] ‗∟≡₸";
    let lockBlack = "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzMwMHB4JyB3aWR0aD0nMzAwcHgnICBmaWxsPSIjMDAwMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZD0iTTcxLjA5MSwzMy42MDd2LTkuOTFjMC03LjI2My02LjY3NC0xOC4wMTEtMjAuOTktMTguMDExaC0wLjIwNWMtMTQuMzE1LDAtMjAuOTg2LDEwLjc0OC0yMC45ODYsMTguMDExdjkuOTEgIGMtNS4yOTEsMC44NDctOS4zNDEsNS40MjItOS4zNDEsMTAuOTUydjM4LjY1YzAsNi4xMzMsNC45NzIsMTEuMTA0LDExLjEwNiwxMS4xMDRoMzguNjQ2YzYuMTM1LDAsMTEuMTA4LTQuOTcyLDExLjEwOC0xMS4xMDRWNDQuNTYgIEM4MC40MzEsMzkuMDMsNzYuMzgyLDM0LjQ1NCw3MS4wOTEsMzMuNjA3eiBNNTQuODgzLDcyLjU2NGMwLjAxNywwLjA0MSwwLjAyMSwwLjA4OSwwLjAyMSwwLjEzYzAsMC4yMTEtMC4xNjMsMC4zNzgtMC4zNzMsMC4zNzggIGMtMC4wMDIsMC0wLjAwNywwLTAuMDExLDBoLTkuMDRjLTAuMTEsMC0wLjIwOC0wLjA0Ny0wLjI3OS0wLjEyNGMtMC4wNzUtMC4wODItMC4xMDYtMC4xODgtMC4wOTUtMC4yOTVsMC44NjQtNy4zNzcgIGMtMS4xNDctMS4wNzctMS44NjktMi42MDUtMS44NjktNC4zMDJjMC0zLjI2MSwyLjY0LTUuOTAyLDUuODk5LTUuOTAyYzMuMjU5LDAsNS45MDEsMi42NDIsNS45MDEsNS45MDIgIGMwLDEuNjk2LTAuNzIyLDMuMjE5LTEuODY4LDQuMzAyTDU0Ljg4Myw3Mi41NjR6IE0zNS41OTQsMzMuNDU2di05Ljc1OGMwLTMuNTQ4LDMuNjA1LTExLjMyOCwxNC4zMDMtMTEuMzI4aDAuMjA1ICBjMTAuNzAzLDAsMTQuMzA1LDcuNzgsMTQuMzA1LDExLjMyOHY5Ljc1OEgzNS41OTR6Ij48L3BhdGg+PC9zdmc+";
    let lockWhite = "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzMwMHB4JyB3aWR0aD0nMzAwcHgnICBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZD0iTTc1LDMwLjFDNzUsMTYuMyw2My45LDUsNTAsNUMzNi4xLDUsMjUsMTYuMywyNSwzMC4xdjguNWMtNi4yLDAuOS0xMC44LDYuMS0xMC44LDEyLjZ2MzFDMTQuMSw4OS4zLDE5LjgsOTUsMjcsOTVoNDYuMSAgYzcuMSwwLDEyLjgtNS43LDEyLjgtMTIuOXYtMzFjMC02LjUtNC43LTExLjYtMTAuOC0xMi42VjMwLjF6IE01Mi42LDgwLjVjMCwxLjQtMS4xLDIuNi0yLjYsMi42Yy0xLjMsMC0yLjUtMS4yLTIuNS0yLjZWNjcuNCAgYy0zLTEuMi01LjItMy45LTUuMi03LjNjMC00LjMsMy41LTcuNyw3LjctNy43YzQuMiwwLDcuNywzLjUsNy43LDcuN2MwLDMuNS0yLjIsNi4yLTUuMSw3LjNWODAuNXogTTM0LjEsMzguNHYtOC4zICBjMC04LjksNy0xNS45LDE1LjgtMTUuOWM4LjksMCwxNS45LDcsMTUuOSwxNS45djguM0gzNC4xeiI+PC9wYXRoPjwvc3ZnPg==";
    let unlockBlack = "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzMwMHB4JyB3aWR0aD0nMzAwcHgnICBmaWxsPSIjMDAwMDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZD0iTTY4LjI2MiwzNy4wOUgzNi4zOTZWMjIuNDA5YzAtMy4zNTQsMy40MDQtMTAuNzA2LDEzLjUxNi0xMC43MDZoMC4xOTZjOS4yMTQsMCwxMy4xNDYsNi4yMDcsMTMuNDk4LDEwLjE5NWwtMC4wMDQsMC41MzMgIGwyLjEwNywyLjAzNWMwLjEsMC4wOTQsMC4xMDIsMC4yNDgsMC4wMDgsMC4zNDRsLTIuMTE1LDIuMTk0YzAuMSwxLjY1MSwxLjQ2NywyLjk2MSwzLjE0MSwyLjk2NWMwLjAwNCwwLDAuMDA0LDAsMC4wMSwwICBjMS43NDIsMCwzLjE1NC0xLjQwOCwzLjE1NC0zLjE1MmwwLjAxNi01LjE1bC0wLjAwNi0wLjExN2MtMC40NTUtNi4yNS02LjIzLTE2LjE2Ni0xOS44MDgtMTYuMTY2aC0wLjE5NiAgYy0xMy41MywwLTE5LjgzNiwxMC4xNTktMTkuODM2LDE3LjAyNXYxNC44MjZjLTUuMDA2LDAuNzk1LTguODM5LDUuMTItOC44MzksMTAuMzUydjM2LjUzMWMwLDUuNzk5LDQuNjk4LDEwLjQ5OSwxMC40OTYsMTAuNDk5ICBoMzYuNTI5YzUuNzk5LDAsMTAuNTAyLTQuNywxMC41MDItMTAuNDk5VjQ3LjU4NkM3OC43NjQsNDEuNzg5LDc0LjA2MSwzNy4wOSw2OC4yNjIsMzcuMDl6IE01NC42MTcsNzQuMDYgIGMwLjAxMiwwLjAzNiwwLjAxOCwwLjA3OCwwLjAxOCwwLjEyMmMwLDAuMTk4LTAuMTU4LDAuMzU0LTAuMzU0LDAuMzU0Yy0wLjAwNiwwLTAuMDA2LDAtMC4wMTIsMGgtOC41NDUgIGMtMC4wOTgsMC0wLjE5Ny0wLjA0LTAuMjYyLTAuMTE3Yy0wLjA2Ny0wLjA3NS0wLjEwMy0wLjE3OS0wLjA5LTAuMjgxbDAuODE1LTYuOTcyYy0xLjA4My0xLjAxNy0xLjc2NS0yLjQ1OS0xLjc2NS00LjA2NSAgYzAtMy4wNzksMi40OTYtNS41NzcsNS41NzQtNS41NzdjMy4wODMsMCw1LjU3OSwyLjQ5OCw1LjU3OSw1LjU3N2MwLDEuNjA2LTAuNjgyLDMuMDQ5LTEuNzY4LDQuMDY1TDU0LjYxNyw3NC4wNnoiPjwvcGF0aD48L3N2Zz4=";
    let unlockWhite = "data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9JzMwMHB4JyB3aWR0aD0nMzAwcHgnICBmaWxsPSIjRkZGRkZGIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PHBhdGggZD0iTTMzLjcsNDEuNkwzMSwzMy4xYy0xLjMtMy44LTEuMS03LjcsMC44LTExLjRjMS45LTMuNCw1LTYuMSw4LjktNy4zYzMuNy0xLjMsNy44LTAuOSwxMS4zLDEuMWMzLjYsMS44LDYuMSw0LjksNy40LDguNyAgYzAuOCwyLjIsMi45LDMuNCw1LjMsMi43YzIuMy0wLjcsMy43LTMuMSwzLTUuNGMtMi01LjktNi4xLTEwLjgtMTEuOC0xMy44Yy01LjUtMi44LTExLjktMy40LTE3LjktMS41Yy02LjEsMS45LTExLDYuMS0xNCwxMS43ICBjLTIuOCw1LjQtMy4zLDExLjktMS41LDE3LjlsMiw2LjNjLTQuOSwxLjctOC41LDYuMi04LjUsMTEuNnYyOS4xYzAsNi44LDUuNCwxMi4xLDEyLjEsMTIuMWg0My4zYzYuNSwwLDEyLjEtNS4zLDEyLjEtMTIuMVY1My42ICBjMC02LjYtNS42LTEyLjEtMTIuMS0xMi4xSDMzLjd6IE01Mi4zLDgxLjRjMCwxLjMtMSwyLjQtMi4yLDIuNGMtMS4zLDAtMi41LTEtMi41LTIuNFY2OC45Yy0yLjktMS00LjktMy42LTQuOS02LjkgIGMwLTMuOCwzLjMtNy4xLDcuNC03LjFjMy44LDAsNywzLjMsNyw3LjFjMCwzLjMtMiw1LjktNC44LDYuOVY4MS40eiI+PC9wYXRoPjwvc3ZnPg==";

	async function buildDOM () {
        cypherKey = GM_getValue("cypherKey");
        toolsHolder = document.querySelector("[data-a-target='emote-picker-button']").parentElement.parentElement;
        alertHolder = document.querySelector("[data-test-selector='chat-input-buttons-container']").parentElement.firstChild.firstChild;
        chatInput = document.querySelector("[data-a-target='chat-input']");
        chatMessages = document.querySelector("[data-test-selector='chat-scrollable-area__message-container']");
        submitBt = document.querySelector("[data-a-target='chat-send-button']");
        addStyles();
        if(cypherKey) {
            addToggle();
            addMaxLength();

            if(!listenersAdded) {
                initChatWatcher();

                chatInput.addEventListener("keydown", e=> {
                    if(e.key == "Enter") onSubmit(e);
                }, true);

                chatInput.addEventListener("focus", e=>{
                    //Reduce input size so it doesn't overlap with buttons
                    chatInput.style.paddingRight = (.5+toolsHolder.childElementCount*3)+"rem";
                });
                //Capture click on "chat" button to override its behavior
                submitBt.addEventListener("click", e=>{ onSubmit(e); });
            }
            listenersAdded = true;
        }else{
            addInitForm();
        }

        /*
        var res = await encrypt("wesh decode toi pt1 !!");
        console.log(res);
        var res = await decrypt(res);
        console.log(res);
        */
	}

    function addStyles() {
        const styleTag = document.createElement("style");
        styleTag.innerText = `
            .cypherMaxLength {
                color: var(--color-text-alt) !important;
                font-size: var(--font-size-5) !important;
                word-break: break-word !important;
                font-weight: var(--font-weight-semibold) !important;
                padding-left: 10px;
                border: 2px solid #ffd37a;
                border-radius: 5px;
                text-align:center;
                display:none;
            }

            .decryptedMessage, .cypherEnabled {
                background-image: repeating-linear-gradient(145deg, #ccc, #ccc 30px, #dbdbdb 30px, #dbdbdb 60px);
            }

            html.tw-root--theme-dark .decryptedMessage,
            html.tw-root--theme-dark .cypherEnabled {
                background-image: repeating-linear-gradient(145deg, #444, #444 30px, #555 30px, #555 60px);
            }

            .configForm {
                text-align:center;
                padding: 10px;
                padding-bottom: 20px;
                width:min-content;
                margin:auto;
                border-top-left-radius:5px;
                border-top-right-radius:5px;
                background-color:var(--color-background-input);
            }
            .configForm>.title {
                color: var(--color-text-alt) !important;
                font-size: var(--font-size-5) !important;
                word-break: break-word !important;
                font-weight: var(--font-weight-semibold) !important;
                border-radius: 5px;
                text-align:center;
                margin-bottom:10px;
            }

            .config {
                display:flex;
                justify-content:center;
            }

            .error {
                margin-top:10px;
                border-radius: 5px;
                display:none;
                color:var(--color-text-button-status);
                background-color: var(--color-brand-accent-cherry);
            }

            input[type='text'] {
                border-style: solid;
                border-width: var(--border-width-input);
                border-color: var(--color-border-input);
                color: var(--color-text-input);
                line-height: 1.5;
                text-align:center;
                background-color: var(--color-background-input);
                margin-right:10px;
                border-radius:5px
            }

            input[type='text']::placeholder {
                color:var(--color-text-button-secondary-hover);
            }

            input[type="submit"] {
                border:none;
                padding: 0 10px;
                background-color: var(--color-background-button-primary-default);
                color: var(--color-text-button-primary);
                display: inline-flex;
                position: relative;
                -webkit-box-align: center;
                align-items: center;
                -webkit-box-pack: center;
                justify-content: center;
                vertical-align: middle;
                overflow: hidden;
                text-decoration: none;
                white-space: nowrap;
                user-select: none;
                font-weight: var(--font-weight-semibold);
                border-radius: var(--border-radius-medium);
                font-size: var(--button-text-default);
                height: var(--button-size-default);
            }
        `;
        document.querySelector("head").append(styleTag);
    }

    /**
     * Creates the toggle (lock/unlock) button
     */
	function addToggle() {
        let darkMode = document.getElementsByTagName('html')[0].className.indexOf("theme-dark") > -1;
        let img = document.createElement("img");
        img.src = darkMode? unlockWhite : unlockBlack;
        img.width = 20;
        img.height = 20;

        toggleButton = toolsHolder.firstElementChild.cloneNode(true);
        let svg = toggleButton.querySelector("svg");
        let p = svg.parentElement;
        p.removeChild(svg);
        p.appendChild(img);

        toolsHolder.appendChild(toggleButton);
        //Toggle lock/ublock
        toggleButton.addEventListener("click", e => {
            cypherEnabled = !cypherEnabled;
            let l = darkMode? lockWhite : lockBlack;
            let ul = darkMode? unlockWhite : unlockBlack;
            img.src = cypherEnabled? l : ul;
            if(cypherEnabled) {
                chatInput.classList.add("cypherEnabled");
            }else{
                chatInput.classList.remove("cypherEnabled");
                alertDiv.style.display = "none";
            }
        });
	}

    /**
     * Add alert holder displayed if encrypted message is too long for twitch
     */
    function addMaxLength() {
        alertDiv = document.createElement("div");
        alertDiv.innerHTML = "Le texte chiffré dépasse la limite de 500 caractères, réduis ton message !";
        alertDiv.className = "cypherMaxLength";
        alertHolder.appendChild(alertDiv);
    }

    /**
     * Add init form to request cypher key
     */
    function addInitForm() {
        var form = document.createElement("div");
        form.className = "configForm";
        form.innerHTML = `
        <div class="title">Configure le clavier de chiffrement</div>
        <div class="config">
            <input type="text" placeholder="Clef de cryptage..." id="cypherKeyboardInput">
            <input type="submit" value="OK" id="cypherKeyboardSubmit">
        </div>
        <div class="error" id="cypherKeyboardError">La clef doit faire au minimum ${cypherKeyMinLength} caractères</div>
        `;
        alertHolder.appendChild(form);
        let input = form.querySelector("#cypherKeyboardInput");
        let submit = form.querySelector("#cypherKeyboardSubmit");
        submit.addEventListener("click", (e)=> { saveCypherKey() });
        input.addEventListener("keyup", (e)=> { if(e.key == "Enter") saveCypherKey() });
    }

    function saveCypherKey() {
        document.querySelector("#cypherKeyboardError").style.display = "none";
        let input = document.querySelector("#cypherKeyboardInput");
        let value = input.value.trim();
        if(value.length > cypherKeyMinLength) {
            GM_setValue("cypherKey", value);
            alertHolder.innerHTML = "";
            buildDOM();
        }else{
            document.querySelector("#cypherKeyboardError").style.display = "block";
        }
    }

    function initChatWatcher() {
        chatMessages.addEventListener("DOMNodeInserted", async (e) => {
            let div = e.target;
            let body = div.querySelector("[data-test-selector='chat-line-message-body']");
            let messages = div.querySelectorAll("[data-a-target='chat-message-text']");
            let message = "";
            messages.forEach((v) => { message += v.innerText; });
            let cleanMessage = message.replace(/\w|\d/gi, "");
            if(Math.abs(message.length - cleanMessage.length) < 5) {
                let decrypted = await decrypt(cleanMessage);
                if(decrypted && decrypted != cleanMessage) {
                    let span = document.createElement("span");
                    span.innerText = decrypted;
                    span.className = "text-fragment";
                    span.setAttribute("data-a-target", "chat-message-text");
                    body.innerHTML = "";
                    body.appendChild(span);
                    div.classList.add("decryptedMessage");
                }
            }
        }, false);
    }

    function setReactValue(element, value) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

        if (valueSetter && valueSetter !== prototypeValueSetter) {
            prototypeValueSetter.call(element, value);
        } else {
            valueSetter.call(element, value);
        }
        element.dispatchEvent(new Event('input', {bubbles:true}));
    }

    async function onSubmit(e) {
        alertDiv.style.display = "none";

        if(chatInput.value == "!resetCypherKeyboard") {
            GM_setValue("cypherKey", null);
            cypherEnabled = false;
            e.preventDefault();
            e.stopPropagation();
            chatInput.classList.remove("cypherEnabled");
            toggleButton.parentElement.removeChild(toggleButton);
            alertDiv.parentElement.removeChild(alertDiv);
            setReactValue(chatInput, "");
            buildDOM();
            return;
        }

        if(!cypherEnabled) return;

        if(!allowEvent) {
            e.preventDefault();
            e.stopPropagation();

            allowEvent = true;
            let newValue = await encrypt(chatInput.value);
            if(newValue.length >= 500) {
                alertDiv.style.display = "block";
                allowEvent = false;
            }else{
                //Override input's value at react's level and fire a new input event
                setReactValue(chatInput, newValue);
                //Tell react to resubmit input
                chatInput.dispatchEvent(new KeyboardEvent('keydown', {code:"Enter", keyCode:13, which:13, key:"Enter", bubbles:true}));
            }
        }else{
            allowEvent = false;
        }
    }

    const buff_to_base64 = (buff) => btoa(String.fromCharCode.apply(null, buff));
    const base64_to_buf = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(null));

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    async function encrypt(data) {
        const encryptedData = await encryptData(data, cypherKey);
        let result = "";
        for(var i=0; i < encryptedData.length; i++) {
            result += charsReplacements[ chars.indexOf(encryptedData.charAt(i)) ];
        }
        return result;
    }

    async function decrypt(encryptedData) {
        if(!encryptedData) return "";
        let result = "";
        for(var i=0; i < encryptedData.length; i++) {
            result += chars[ charsReplacements.indexOf(encryptedData.charAt(i)) ];
        }

        const decryptedData = await decryptData(result, cypherKey);
        return decryptedData || encryptedData;
    }

    const getPasswordKey = (password) =>
    window.crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
        "deriveKey",
    ]);

    const deriveKey = (passwordKey, salt, keyUsage) =>
    window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 250000,
            hash: "SHA-256",
        },
        passwordKey,
        { name: "AES-GCM", length: 256 },
        false,
        keyUsage
    );

    async function encryptData(secretData, password) {
        try {
            const salt = window.crypto.getRandomValues(new Uint8Array(16));
            const iv = window.crypto.getRandomValues(new Uint8Array(12));
            const passwordKey = await getPasswordKey(password);
            const aesKey = await deriveKey(passwordKey, salt, ["encrypt"]);
            const encryptedContent = await window.crypto.subtle.encrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                },
                aesKey,
                enc.encode(secretData)
            );

            const encryptedContentArr = new Uint8Array(encryptedContent);
            let buff = new Uint8Array(
                salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
            );
            buff.set(salt, 0);
            buff.set(iv, salt.byteLength);
            buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
            const base64Buff = buff_to_base64(buff);
            return base64Buff;
        } catch (e) {
            //console.log(`Error - ${e}`);
            return "";
        }
    }

    async function decryptData(encryptedData, password) {
        try {
            const encryptedDataBuff = base64_to_buf(encryptedData);
            const salt = encryptedDataBuff.slice(0, 16);
            const iv = encryptedDataBuff.slice(16, 16 + 12);
            const data = encryptedDataBuff.slice(16 + 12);
            const passwordKey = await getPasswordKey(password);
            const aesKey = await deriveKey(passwordKey, salt, ["decrypt"]);
            const decryptedContent = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: iv,
                },
                aesKey,
                data
            );
            return dec.decode(decryptedContent);
        } catch (e) {
            //console.log(`Error - ${e}`);
            return "";
        }
    }

	window.addEventListener("load", () => {
		buildDOM();
	});
})()
