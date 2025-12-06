(function () {

    // --- 1. CONFIGURATION AND BOOTSTRAP ---

    // Find the current script tag to read data attributes
    const currentScript = document.currentScript;
    if (!currentScript) return;

    const BACKEND_URL = currentScript.dataset.backend;
    const THEME_COLOR = currentScript.dataset.color || '#667eea';
    const SECONDARY_COLOR = currentScript.dataset.secondaryColor || '#764ba2'; // Used for gradient

    if (!BACKEND_URL) {
        console.error("Chat Widget: 'data-backend' attribute is missing. Widget will not function.");
        return;
    }

    // --- 2. WEB COMPONENT CLASS DEFINITION ---

    class ChatWidget extends HTMLElement {
        constructor() {
            super();
            // Create Shadow DOM (closed for better encapsulation)
            const shadowRoot = this.attachShadow({ mode: 'closed' });

            // 3. Inject CSS
            const style = document.createElement('style');
            style.textContent = this.getCSS(THEME_COLOR, SECONDARY_COLOR);
            shadowRoot.appendChild(style);

            // 4. Inject HTML
            shadowRoot.innerHTML += this.getHTML();

            // 5. Adapt and execute the original JS logic
            this.initWidget(shadowRoot, BACKEND_URL);
        }

        // --- 3. HTML TEMPLATE ---

        getHTML() {
            return `
                <div class="chat-widget-container">
                    <!-- Chat Window -->
                    <div class="chat-window" id="chatWindow">
                        <!-- Header -->
                        <div class="chat-header">
                            <div class="chat-header-content">
                                <div class="chat-avatar">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div class="chat-header-text">
                                    <h3>Plugin Assistant</h3>
                                    <p>Always ready to help</p>
                                </div>
                                <div class="template-options">
                                    <label>
                                        <input type="radio" name="template" value="1">
                                        Template 1
                                    </label>
                                    <label>
                                        <input type="radio" name="template" value="2">
                                        Template 2
                                    </label>
                                    <label>
                                        <input type="radio" name="template" value="3">
                                        Template 3
                                    </label>
                                    <label>
                                        <input type="radio" name="template" value="4">
                                        Template 4
                                    </label>
                                </div>
                            </div>
                            <button class="close-btn" id="closeBtn">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <!-- Messages Area -->
                        <div class="messages-area" id="messagesArea">
                            <div class="empty-state" id="emptyState">
                                <div class="empty-state-icon">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h4>Ask me anything!</h4>
                                <p>Need help with plugin variables? Just type your question below.</p>
                            </div>
                        </div>

                        <!-- Input Area -->
                        <div class="input-area">
                            <div class="input-container">
                                <input type="text" class="message-input" id="messageInput" placeholder="Type your message..." />
                                <button class="send-btn" id="sendBtn">
                                    <svg id="sendIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    <svg id="spinnerIcon" style="display: none;" class="spinner" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"
                                            opacity="0.25" />
                                        <path fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            opacity="0.75" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Hint Bubble -->
                    <div class="hint-bubble" id="hintBubble">
                        Ask me about plugin variables! 💬
                    </div>

                    <!-- Toggle Button -->
                    <button class="chat-toggle-btn" id="chatToggleBtn">
                        <svg id="chatIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        <svg id="closeIcon" style="display: none;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            `;
        }

        // --- 4. CSS TEMPLATE ---

        getCSS(themeColor, secondaryColor) {
            return `
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                /* Custom Properties for Theme */
                :host {
                    --theme-color: ${themeColor};
                    --secondary-color: ${secondaryColor};
                    --theme-gradient: linear-gradient(135deg, var(--theme-color) 0%, var(--secondary-color) 100%);
                    --bot-icon-color: #25D366; /* Keeping original bot color for empty state */
                }
                
                /* Chat Widget Styles */
                .chat-widget-container {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 2147483647; /* Max z-index to ensure visibility */
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                }

                .chat-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 380px;
                    max-width: calc(100vw - 48px);
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    opacity: 0;
                    transform: scale(0.9) translateY(20px);
                    pointer-events: none;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    transform-origin: bottom right;
                    display: flex;
                    flex-direction: column;
                    max-height: 80vh;
                }

                .chat-window.open {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    pointer-events: all;
                }

                .chat-header {
                    background: var(--theme-gradient);
                    color: white;
                    padding: 16px;
                    border-radius: 16px 16px 0 0;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    border-bottom: 1px solid #fefefe;
                    position: relative;
                }

                .chat-header-content {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                    width: 100%;
                }

                .template-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px 12px;
                    align-items: center;
                    justify-content: flex-start;
                    border-top: 1px solid rgba(255, 255, 255, 0.3);
                    padding-top: 12px;
                    margin-top: 12px;
                    width: 100%;
                    font-size: 12px;
                }
                .template-options label {
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                .template-options input {
                    margin: 0;
                }

                .chat-avatar {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .chat-avatar svg {
                    width: 20px;
                    height: 20px;
                }

                .chat-header-text h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 2px;
                }

                .chat-header-text p {
                    font-size: 12px;
                    opacity: 0.8;
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                    position: absolute;
                    right: 12px;
                    top: 12px;
                    left: auto;
                    flex-shrink: 0;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .close-btn svg {
                    width: 16px;
                    height: 16px;
                }

                .messages-area {
                    flex-grow: 1;
                    height: 400px; /* Fixed height as per original */
                    overflow-y: auto;
                    padding: 16px;
                    background: #f0f2f5;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .messages-area::-webkit-scrollbar {
                    width: 6px;
                }

                .messages-area::-webkit-scrollbar-track {
                    background: #f0f2f5;
                }

                .messages-area::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 3px;
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    text-align: center;
                    padding: 20px;
                }

                .empty-state-icon {
                    width: 64px;
                    height: 64px;
                    background: rgba(37, 211, 102, 0.1);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 16px;
                    animation: pulse 2s infinite;
                }

                .empty-state-icon svg {
                    width: 32px;
                    height: 32px;
                    color: var(--bot-icon-color);
                }

                .empty-state h4 {
                    font-size: 18px;
                    margin-bottom: 8px;
                    color: #1f2937;
                }

                .empty-state p {
                    font-size: 14px;
                    color: #6b7280;
                }

                .message {
                    display: flex;
                    animation: fadeIn 0.3s ease-out;
                }

                .message.user {
                    justify-content: flex-end;
                }

                .message.bot {
                    justify-content: flex-start;
                }

                .message-bubble {
                    max-width: 75%;
                    padding: 10px 14px;
                    border-radius: 16px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .message.user .message-bubble {
                    background: var(--theme-gradient);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message.bot .message-bubble {
                    background: white;
                    color: #1f2937;
                    border-bottom-left-radius: 4px;
                }

                .message-text {
                    font-size: 14px;
                    line-height: 1.5;
                    word-wrap: break-word;
                }

                .message-time {
                    font-size: 10px;
                    margin-top: 4px;
                    display: block;
                    text-align: right;
                }

                .message.user .message-time {
                    color: rgba(255, 255, 255, 0.7);
                }

                .message.bot .message-time {
                    color: #6b7280;
                }

                .typing-indicator {
                    display: flex;
                    justify-content: flex-start;
                    animation: fadeIn 0.3s ease-out;
                }

                .typing-bubble {
                    background: white;
                    border-radius: 16px;
                    border-bottom-left-radius: 4px;
                    padding: 10px 14px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .typing-dots {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #9ca3af;
                    border-radius: 50%;
                    animation: typing 1.5s infinite ease-in-out;
                }

                .typing-dot:nth-child(1) {
                    animation-delay: 0s;
                }

                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                .typing-text {
                    font-size: 14px;
                    color: #6b7280;
                }

                .input-area {
                    padding: 12px 16px;
                    border-top: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 0 0 16px 16px;
                }

                .input-container {
                    display: flex;
                    align-items: center;
                    background: #f9fafb;
                    border-radius: 20px;
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                .message-input {
                    flex-grow: 1;
                    border: none;
                    padding: 10px 16px;
                    font-size: 14px;
                    background: transparent;
                    outline: none;
                }

                .send-btn {
                    background: transparent;
                    border: none;
                    color: var(--theme-color);
                    cursor: pointer;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 0.2s;
                }

                .send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .send-btn svg {
                    width: 20px;
                    height: 20px;
                    stroke-width: 2;
                }

                .hint-bubble {
                    position: absolute;
                    bottom: 80px;
                    right: 80px;
                    background: white;
                    color: #1f2937;
                    padding: 8px 12px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    font-size: 14px;
                    opacity: 1;
                    transition: opacity 0.3s, transform 0.3s;
                    pointer-events: none;
                }

                .hint-bubble.hidden {
                    opacity: 0;
                    transform: translateY(10px);
                }

                .chat-toggle-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: var(--theme-gradient);
                    color: white;
                    border: none;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s, box-shadow 0.2s;
                    position: relative;
                }

                .chat-toggle-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
                }

                .chat-toggle-btn svg {
                    width: 24px;
                    height: 24px;
                    position: absolute;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {

                    0%,
                    100% {
                        opacity: 1;
                    }

                    50% {
                        opacity: 0.7;
                    }
                }

                @keyframes typing {

                    0%,
                    60%,
                    100% {
                        transform: translateY(0);
                    }

                    30% {
                        transform: translateY(-10px);
                    }
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 640px) {
                    .chat-window {
                        width: calc(100vw - 48px);
                    }
                }
            `;
        }

        // --- 5. ADAPTED JAVASCRIPT LOGIC ---

        initWidget(shadowRoot, BACKEND_URL) {
            // Elements (scoped to shadowRoot)
            const chatWindow = shadowRoot.getElementById('chatWindow');
            const chatToggleBtn = shadowRoot.getElementById('chatToggleBtn');
            const closeBtn = shadowRoot.getElementById('closeBtn');
            const messagesArea = shadowRoot.getElementById('messagesArea');
            const messageInput = shadowRoot.getElementById('messageInput');
            const sendBtn = shadowRoot.getElementById('sendBtn');
            const emptyState = shadowRoot.getElementById('emptyState');
            const hintBubble = shadowRoot.getElementById('hintBubble');
            const chatIcon = shadowRoot.getElementById('chatIcon');
            const closeIcon = shadowRoot.getElementById('closeIcon');
            const sendIcon = shadowRoot.getElementById('sendIcon');
            const spinnerIcon = shadowRoot.getElementById('spinnerIcon');

            // State
            let isOpen = false;
            let isLoading = false;
            let messages = [];

            // Load messages from session storage
            const loadMessages = () => {
                const saved = sessionStorage.getItem('chatMessages');
                if (saved) {
                    messages = JSON.parse(saved);
                    renderMessages();
                }
            };

            // Save messages to session storage
            const saveMessages = () => {
                sessionStorage.setItem('chatMessages', JSON.stringify(messages));
            };

            // Toggle chat window
            const toggleChat = () => {
                isOpen = !isOpen;
                chatWindow.classList.toggle('open', isOpen);
                hintBubble.classList.toggle('hidden', isOpen);

                if (isOpen) {
                    chatIcon.style.display = 'none';
                    closeIcon.style.display = 'block';
                    setTimeout(() => messageInput.focus(), 300);
                } else {
                    chatIcon.style.display = 'block';
                    closeIcon.style.display = 'none';
                }
            };

            // Format time
            const formatTime = (date) => {
                return new Date(date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });
            };

            // Create message element
            const createMessageElement = (message) => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${message.sender}`;

                const bubble = document.createElement('div');
                bubble.className = 'message-bubble';

                const text = document.createElement('div');
                text.className = 'message-text';
                text.innerText = message.text;

                const time = document.createElement('span');
                time.className = 'message-time';
                time.textContent = formatTime(message.timestamp);

                bubble.appendChild(text);
                bubble.appendChild(time);
                messageDiv.appendChild(bubble);

                return messageDiv;
            };

            // Show typing indicator
            const showTypingIndicator = () => {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'typing-indicator';
                typingDiv.id = 'typingIndicator';

                typingDiv.innerHTML = `
                    <div class="typing-bubble">
                        <div class="typing-dots">
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                            <div class="typing-dot"></div>
                        </div>
                        <span class="typing-text">Typing...</span>
                    </div>
                `;

                messagesArea.appendChild(typingDiv);
                scrollToBottom();
            };

            // Remove typing indicator
            const removeTypingIndicator = () => {
                const indicator = shadowRoot.getElementById('typingIndicator');
                if (indicator) {
                    indicator.remove();
                }
            };

            // Render all messages
            const renderMessages = () => {
                // Clear messages area except empty state
                while (messagesArea.firstChild) {
                    messagesArea.removeChild(messagesArea.firstChild);
                }

                if (messages.length === 0) {
                    emptyState.style.display = 'flex';
                    messagesArea.appendChild(emptyState);
                } else {
                    emptyState.style.display = 'none';
                    messages.forEach(message => {
                        const messageEl = createMessageElement(message);
                        messagesArea.appendChild(messageEl);
                    });
                    scrollToBottom();
                }
            };

            // Scroll to bottom
            const scrollToBottom = () => {
                messagesArea.scrollTop = messagesArea.scrollHeight;
            };

            // --- handleVariableEdit (Interacts with main document, kept as document.querySelector/All) ---
            const handleVariableEdit = (formattedText) => {

                // 1️⃣ Extract values from the formatted output
                const lines = formattedText.split("\n").map(l => l.trim()).filter(Boolean);

                const currentVar = lines[1]?.replace(/"/g, "");
                const newVar = lines[3]?.replace(/"/g, "");
                const reason = lines[5] || "";

                // Extract variable name only (before :)
                const variableName = currentVar.split(":")[0].trim();

                // 2️⃣ Find plugin using partial keyword matching
                // NOTE: This intentionally uses document.querySelectorAll to interact with the host page's DOM
                const plugins = document.querySelectorAll(".plugin #headingOne > h4 > div.pull-left");

                let targetPlugin = null;

                plugins.forEach(ele => {
                    const text = ele.innerText.toLowerCase();
                    if (text.includes("variable") && text.includes("declaration")) {
                        targetPlugin = ele.closest(".plugin");
                    }
                });

                if (!targetPlugin) {
                    return;
                }

                // 3️⃣ Click the EDIT button inside the plugin
                const editBtn = targetPlugin.querySelector(".pull-right .edit-plugin.btn");

                if (!editBtn) {
                    return;
                }

                editBtn.click();

                // NOTE: This intentionally uses document.querySelector to interact with the host page's DOM
                const searchBox = document.querySelector("#searchForHtmlClasses");

                if (searchBox) {
                    searchBox.value = currentVar.split(" ")[0];

                    // simulate change
                    searchBox.dispatchEvent(new Event("change", { bubbles: true }));

                    // simulate Enter press (keyup)
                    searchBox.dispatchEvent(new KeyboardEvent("keyup", {
                        key: "Enter",
                        keyCode: 13,
                        which: 13,
                        bubbles: true
                    }));
                }
            };

            const formatBackendResponse = (data) => {
                const payload = Array.isArray(data) && data.length ? data[0] : data;
                if (!payload) return "No data received.";

                const formatChange = (cur, next, reason) => [
                    `Replace your current variable:`,
                    `"${cur}"`,
                    ``,
                    `with:`,
                    `"${next}"`,
                    ``,
                    `Reason:`,
                    `${reason || "No reason provided"}`
                ].join("\n");

                // Direct payload variables
                if (payload.current_variable && payload.new_variable) {
                    return formatChange(
                        payload.current_variable,
                        payload.new_variable,
                        payload.reason
                    );
                }

                // formatted_output exists
                if (payload.formatted_output) {
                    let fo = payload.formatted_output;

                    // If string → try JSON parse
                    if (typeof fo === "string") {
                        try {
                            fo = JSON.parse(fo);
                        } catch {
                            return fo; // plain string returned by backend
                        }
                    }

                    // Now fo is object or parsed object
                    if (fo.current_variable && fo.new_variable) {
                        return formatChange(
                            fo.current_variable,
                            fo.new_variable,
                            fo.reason
                        );
                    }

                    return JSON.stringify(fo, null, 2);
                }

                // fallback for unknown structures
                if (typeof payload === "object") {
                    return JSON.stringify(payload, null, 2);
                }

                return String(payload);
            };


            // Send message
            const sendMessage = async () => {

                let formatted;
                const text = messageInput.value.trim();
                // Scoped to shadowRoot
                const selectedTemplate = shadowRoot.querySelector('input[name="template"]:checked')?.value || null;

                if (!selectedTemplate) {
                    alert("Please select a template first.");
                    return;
                }

                if (!text || isLoading) return;

                // Create user message
                const userMessage = {
                    id: Date.now().toString(),
                    text: text,
                    sender: 'user',
                    timestamp: new Date().toISOString()
                };

                messages.push(userMessage);
                saveMessages();
                renderMessages();

                messageInput.value = '';
                isLoading = true;
                updateLoadingState();
                showTypingIndicator();

                try {
                    const response = await fetch(BACKEND_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ message: text, template: selectedTemplate })
                    });

                    const data = await response.json();

                    formatted = formatBackendResponse(data);

                    const botMessage = {
                        id: (Date.now() + 1).toString(),
                        text: formatted,
                        sender: 'bot',
                        timestamp: new Date().toISOString()
                    };

                    messages.push(botMessage);
                    saveMessages();

                } catch (error) {

                    const errorMessage = {
                        id: (Date.now() + 1).toString(),
                        text: 'Sorry, I couldn\'t connect to the server. Please try again.',
                        sender: 'bot',
                        timestamp: new Date().toISOString()
                    };

                    messages.push(errorMessage);
                    saveMessages();
                } finally {
                    isLoading = false;
                    removeTypingIndicator();
                    updateLoadingState();
                    renderMessages();
                    // Execute the external handler
                    handleVariableEdit(formatted);
                }
            };

            // Update loading state
            const updateLoadingState = () => {
                messageInput.disabled = isLoading;
                sendBtn.disabled = isLoading || !messageInput.value.trim();

                if (isLoading) {
                    sendIcon.style.display = 'none';
                    spinnerIcon.style.display = 'block';
                } else {
                    sendIcon.style.display = 'block';
                    spinnerIcon.style.display = 'none';
                }
            };

            // Event listeners
            chatToggleBtn.addEventListener('click', toggleChat);
            closeBtn.addEventListener('click', toggleChat);
            sendBtn.addEventListener('click', sendMessage);

            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            messageInput.addEventListener('input', () => {
                sendBtn.disabled = !messageInput.value.trim() || isLoading;
            });

            // Initialize
            loadMessages();
            updateLoadingState();
        }
    }

    // --- 6. AUTO-INIT SCRIPT ---

    // Define the custom element
    if (!customElements.get('chat-widget')) {
        customElements.define('chat-widget', ChatWidget);
    }

    // Auto-inject the widget into the body if it's not already there
    if (!document.querySelector('chat-widget')) {
        const widgetElement = document.createElement('chat-widget');
        // Copy data attributes from the script tag to the custom element
        for (const key in currentScript.dataset) {
            widgetElement.dataset[key] = currentScript.dataset[key];
        }
        document.body.appendChild(widgetElement);
    }

})();
