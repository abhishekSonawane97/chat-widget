chat-widget.js
/**
 * Fully self-contained Chat Widget Web Component
 * Uses Shadow DOM for style isolation and encapsulates all HTML, CSS, and JS functionality.
 * Initialization is automatic on script load.
 */

class ChatWidget extends HTMLElement {
    constructor() {
        super();
        this.BACKEND_URL = '';
        this.THEME_COLOR = '#667eea';
        this.isOpen = false;
        this.isLoading = false;
        this.messages = [];
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        // 1. Get configuration from script tag
        const script = document.currentScript || document.querySelector('script[src*="chat-widget.js"]');
        if (script) {
            this.BACKEND_URL = script.dataset.backend || this.BACKEND_URL;
            this.THEME_COLOR = script.dataset.color || this.THEME_COLOR;
        }

        // 2. Inject HTML and CSS into Shadow DOM
        this.shadow.innerHTML = this.getStyle() + this.getTemplate();

        // 3. Get Shadow DOM elements
        this.elements = this.getElements();

        // 4. Initialize event listeners and state
        this.initListeners();
        this.loadMessages();
        this.updateLoadingState();
    }

    getStyle() {
        return `
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                /* Chat Widget Styles */
                .chat-widget-container {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 1000;
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
                }

                .chat-window.open {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    pointer-events: all;
                }

                .chat-header {
                    background: linear-gradient(135deg, ${this.THEME_COLOR} 0%, #764ba2 100%);
                    color: white;
                    padding: 16px;
                    border-radius: 16px 16px 0 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #fefefe;
                }

                .chat-header-content {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .template-options {
                    display: flex;
                    flex-wrap: wrap;
                    row-gap: 24px;
                    align-items: center;
                    justify-content: center;
                    border-top: 1px solid #fefefe;
                    padding-top: 12px;
                }
                .template-options label,
                .template-options input{
                    margin-right: 12px;
                }
                .chat-avatar {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
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
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .close-btn svg {
                    width: 16px;
                    height: 16px;
                }

                .messages-area {
                    height: 400px;
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
                    background: rgba(37, 211, 102, 0.1); /* Static green for icon background */
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
                    color: #25D366; /* Static green for icon color */
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
                    background: linear-gradient(135deg, ${this.THEME_COLOR} 0%, #764ba2 100%);
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
                    padding: 12px 16px;
                    border-radius: 16px;
                    border-bottom-left-radius: 4px;
                    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .typing-dots {
                    display: flex;
                    gap: 4px;
                }

                .typing-dot {
                    width: 8px;
                    height: 8px;
                    background: #6b7280;
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }

                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                .typing-text {
                    font-size: 14px;
                    color: #1f2937;
                }

                .input-area {
                    padding: 16px;
                    background: white;
                    border-radius: 0 0 16px 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .input-container {
                    display: flex;
                    gap: 8px;
                }

                .message-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 24px;
                    font-size: 14px;
                    font-family: inherit;
                    outline: none;
                    background: #f9fafb;
                    transition: all 0.2s;
                }

                .message-input:focus {
                    border-color: #6e67aa;
                    background: white;
                }

                .message-input:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .send-btn {
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, ${this.THEME_COLOR} 0%, #764ba2 100%);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .send-btn:hover:not(:disabled) {
                    background: linear-gradient(135deg, ${this.THEME_COLOR} 0%, #764ba2 100%);
                    transform: scale(1.05);
                }

                .send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .send-btn svg {
                    width: 18px;
                    height: 18px;
                }

                .hint-bubble {
                    position: absolute;
                    bottom: 72px;
                    right: 0;
                    background: white;
                    color: #1f2937;
                    padding: 12px 16px;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    font-size: 14px;
                    white-space: nowrap;
                    animation: fadeIn 0.3s ease-out, pulse 2s infinite;
                    border: 1px solid #e5e7eb;
                }

                .hint-bubble.hidden {
                    display: none;
                }

                .chat-toggle-btn {
                    width: 56px;
                    height: 56px;
                    background: linear-gradient(135deg, ${this.THEME_COLOR} 0%, #764ba2 100%);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .chat-toggle-btn:hover {
                    transform: scale(1.1);
                    background: linear-gradient(135deg, ${this.THEME_COLOR} 0%, #764ba2 100%);
                    box-shadow: 0 6px 16px rgba(37, 211, 102, 0.5);
                }

                .chat-toggle-btn svg {
                    width: 24px;
                    height: 24px;
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
            </style>
        `;
    }

    getTemplate() {
        return `
            <div class="chat-widget-container">
                <div class="chat-window" id="chatWindow">
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

                <div class="hint-bubble" id="hintBubble">
                    Ask me about plugin variables! 💬
                </div>

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

    getElements() {
        // Map of IDs to be queried within the shadow root
        return {
            chatWindow: this.shadow.getElementById('chatWindow'),
            chatToggleBtn: this.shadow.getElementById('chatToggleBtn'),
            closeBtn: this.shadow.getElementById('closeBtn'),
            messagesArea: this.shadow.getElementById('messagesArea'),
            messageInput: this.shadow.getElementById('messageInput'),
            sendBtn: this.shadow.getElementById('sendBtn'),
            emptyState: this.shadow.getElementById('emptyState'),
            hintBubble: this.shadow.getElementById('hintBubble'),
            chatIcon: this.shadow.getElementById('chatIcon'),
            closeIcon: this.shadow.getElementById('closeIcon'),
            sendIcon: this.shadow.getElementById('sendIcon'),
            spinnerIcon: this.shadow.getElementById('spinnerIcon'),
            templateInputs: this.shadow.querySelectorAll('input[name="template"]'),
        };
    }

    initListeners() {
        this.elements.chatToggleBtn.addEventListener('click', this.toggleChat.bind(this));
        this.elements.closeBtn.addEventListener('click', this.toggleChat.bind(this));
        this.elements.sendBtn.addEventListener('click', this.sendMessage.bind(this));
        this.elements.messageInput.addEventListener('keypress', this.handleInputKeypress.bind(this));
        this.elements.messageInput.addEventListener('input', this.handleInput.bind(this));
        this.elements.templateInputs.forEach(input => {
            input.addEventListener('change', this.handleTemplateChange.bind(this));
        });
    }
    
    // Save messages to session storage
    saveMessages() {
        sessionStorage.setItem('chatMessages', JSON.stringify(this.messages));
    }

    // Load messages from session storage
    loadMessages() {
        const saved = sessionStorage.getItem('chatMessages');
        if (saved) {
            this.messages = JSON.parse(saved);
            this.renderMessages();
        }
    }

    // Toggle chat window
    toggleChat() {
        this.isOpen = !this.isOpen;
        this.elements.chatWindow.classList.toggle('open', this.isOpen);
        this.elements.hintBubble.classList.toggle('hidden', this.isOpen);

        if (this.isOpen) {
            this.elements.chatIcon.style.display = 'none';
            this.elements.closeIcon.style.display = 'block';
            setTimeout(() => this.elements.messageInput.focus(), 300);
        } else {
            this.elements.chatIcon.style.display = 'block';
            this.elements.closeIcon.style.display = 'none';
        }
    }

    handleTemplateChange() {
        // Simple logic for template radio buttons (selection updates are handled by standard form behavior)
        // No explicit state update needed here, but you could add UI feedback if required.
    }

    // Format time
    formatTime(date) {
        return new Date(date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Create message element
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender}`;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        const text = document.createElement('div');
        text.className = 'message-text';
        text.innerText = message.text;

        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.formatTime(message.timestamp);

        bubble.appendChild(text);
        bubble.appendChild(time);
        messageDiv.appendChild(bubble);

        return messageDiv;
    }

    // Show typing indicator
    showTypingIndicator() {
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

        this.elements.messagesArea.appendChild(typingDiv);
        this.scrollToBottom();
    }

    // Remove typing indicator
    removeTypingIndicator() {
        const indicator = this.shadow.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Render all messages
    renderMessages() {
        // Clear messages area except empty state (which we'll re-append if needed)
        // Find the empty state element and remove all other children.
        const messagesContainer = this.elements.messagesArea;
        const emptyState = this.elements.emptyState;

        // Clear all children except emptyState
        Array.from(messagesContainer.children).forEach(child => {
            if (child.id !== 'emptyState') {
                messagesContainer.removeChild(child);
            }
        });

        if (this.messages.length === 0) {
            emptyState.style.display = 'flex';
            messagesContainer.appendChild(emptyState);
        } else {
            emptyState.style.display = 'none';
            this.messages.forEach(message => {
                const messageEl = this.createMessageElement(message);
                messagesContainer.appendChild(messageEl);
            });
            this.scrollToBottom();
        }
    }

    // Scroll to bottom
    scrollToBottom() {
        this.elements.messagesArea.scrollTop = this.elements.messagesArea.scrollHeight;
    }

    handleVariableEdit(formattedText) {
        // This function needs to execute against the main document DOM, NOT the shadow DOM.
        // It relies on finding elements (plugins, search box) in the host page's DOM.
        // Because this function is a requirement to be kept EXACTLY as is, we must ensure 
        // it correctly queries the main document.

        // 1. Extract values from the formatted output
        const lines = formattedText.split("\n").map(l => l.trim()).filter(Boolean);

        const currentVar = lines[1]?.replace(/"/g, ""); 
        const newVar     = lines[3]?.replace(/"/g, "");
        const reason     = lines[5] || "";

        // Extract variable name only (before :)
        const variableName = currentVar ? currentVar.split(":")[0].trim() : '';

        // 2. Find plugin using partial keyword matching in the main document
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

        // 3. Click the EDIT button inside the plugin
        const editBtn = targetPlugin.querySelector(".pull-right .edit-plugin.btn");

        if (!editBtn) {
            return;
        }

        editBtn.click();

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
    }


    formatBackendResponse(data) {
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
    }

    // Send message
    async sendMessage() {
        
        let formatted;
        const text = this.elements.messageInput.value.trim();
        const selectedTemplate = this.shadow.querySelector('input[name="template"]:checked')?.value || null;

        if (!selectedTemplate) {
            alert("Please select a template first.");
            return;
        }

        if (!text || this.isLoading ) return;

        // Create user message
        const userMessage = {
            id: Date.now().toString(),
            text: text,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        this.messages.push(userMessage);
        this.saveMessages();
        this.renderMessages();

        this.elements.messageInput.value = '';
        this.isLoading = true;
        this.updateLoadingState();
        this.showTypingIndicator();

        try {
            const response = await fetch(this.BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: text, template: selectedTemplate })
            });

            const data = await response.json();

            formatted = this.formatBackendResponse(data);

            const botMessage = {
            id: (Date.now() + 1).toString(),
            text: formatted,
            sender: 'bot',
            timestamp: new Date().toISOString()
            };

            this.messages.push(botMessage);
            this.saveMessages();

        }
        catch (error) {
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I couldn\'t connect to the server. Please try again.',
                sender: 'bot',
                timestamp: new Date().toISOString()
            };

            this.messages.push(errorMessage);
            this.saveMessages();
        } finally {
            this.isLoading = false;
            this.removeTypingIndicator();
            this.updateLoadingState();
            this.renderMessages();
            this.handleVariableEdit(formatted || '');
        }
    }

    handleInputKeypress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInput() {
        this.elements.sendBtn.disabled = !this.elements.messageInput.value.trim() || this.isLoading;
    }

    // Update loading state
    updateLoadingState() {
        this.elements.messageInput.disabled = this.isLoading;
        this.elements.sendBtn.disabled = this.isLoading || !this.elements.messageInput.value.trim();

        if (this.isLoading) {
            this.elements.sendIcon.style.display = 'none';
            this.elements.spinnerIcon.style.display = 'block';
        } else {
            this.elements.sendIcon.style.display = 'block';
            this.elements.spinnerIcon.style.display = 'none';
        }
    }
}

// Auto-init: Define the custom element and inject it into the document body
(() => {
    // Define the custom element tag name
    const tagName = 'chat-widget-assistant';

    // Register the element if it hasn't been already
    if (!customElements.get(tagName)) {
        customElements.define(tagName, ChatWidget);
    }

    // Find the script tag that loaded this file to extract attributes
    const script = document.currentScript || document.querySelector('script[src*="chat-widget.js"]');
    
    // Check if the widget is already in the DOM (e.g., if the user manually added the tag)
    if (!document.querySelector(tagName) && script) {
        // Create and inject the widget element
        const widget = document.createElement(tagName);
        
        // Transfer data attributes to the custom element
        if (script.dataset.backend) {
            widget.setAttribute('data-backend', script.dataset.backend);
        }
        if (script.dataset.color) {
            widget.setAttribute('data-color', script.dataset.color);
        }

        // Append to the body
        document.body.appendChild(widget);
    }
})();
