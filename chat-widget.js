(function(){
  // --- config from script tag ---
  const currentScript = document.currentScript || (function(){
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length-1];
  })();
  const BACKEND_URL = (currentScript && currentScript.getAttribute('data-backend')) || 'https://n8n-automation-fe.app.n8n.cloud/webhook/variables';
  const THEME_COLOR = (currentScript && currentScript.getAttribute('data-color')) || '#667eea';
  const STORAGE_KEY = 'chatWidgetMessages_' + (location.hostname || 'default');

  // --- create host container & shadow root ---
  const host = document.createElement('div');
  host.id = 'chat-widget-host';
  host.style.all = 'initial'; // ensure no inherited styles leak
  host.style.position = 'fixed';
  host.style.bottom = '24px';
  host.style.right = '24px';
  host.style.zIndex = 2147483647; // max z-index
  document.body.appendChild(host);

  const shadow = host.attachShadow({mode:'open'});

  // --- minified CSS (bundled) ---
  const css = `
:host{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Ubuntu,Cantarell,system-ui,Arial;}
.container{position:relative;width:380px;max-width:calc(100vw - 48px);pointer-events:all}
.chat-window{position:relative;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.3);opacity:0;transform:scale(.9) translateY(20px);transform-origin:bottom right;transition:all .28s cubic-bezier(.4,0,.2,1)}
.chat-window.open{opacity:1;transform:scale(1) translateY(0)}
.header{background:linear-gradient(135deg,${THEME_COLOR} 0%, #764ba2 100%);color:#fff;padding:14px;border-radius:16px 16px 0 0;display:flex;align-items:center;gap:12px;position:relative}
.avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center}
.header-text h3{font-size:16px;margin:0;font-weight:600}
.header-text p{font-size:12px;margin:0;opacity:.85}
.template-options{display:flex;gap:8px;font-size:13px;padding-top:8px;flex-wrap:wrap}
.close-btn{position:absolute;right:10px;top:10px;background:transparent;border:none;color:#fff;padding:6px;border-radius:8px;cursor:pointer}
.messages{height:360px;overflow:auto;padding:12px;background:#f0f2f5;display:flex;flex-direction:column;gap:10px;border-bottom:1px solid #eee}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:12px;text-align:center}
.empty .icon{width:56px;height:56px;border-radius:50%;background:rgba(102,126,234,.08);display:flex;align-items:center;justify-content:center;margin-bottom:12px;animation:pl 2s infinite}
.input-area{display:flex;gap:8px;padding:12px;background:#fff;border-radius:0 0 16px 16px}
.input{flex:1;padding:10px 14px;border-radius:24px;border:1px solid #e5e7eb;background:#f9fafb;font-size:14px;outline:none}
.input:focus{border-color:#6e67aa;background:#fff}
.send{width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;background:linear-gradient(135deg,${THEME_COLOR} 0%, #764ba2 100%);display:flex;align-items:center;justify-content:center}
.msg{display:flex;animation:fi .28s}
.msg.user{justify-content:flex-end}
.bubble{max-width:75%;padding:10px 14px;border-radius:16px;box-shadow:0 1px 2px rgba(0,0,0,.06);font-size:14px}
.msg.user .bubble{background:linear-gradient(135deg,${THEME_COLOR} 0%, #764ba2 100%);color:#fff;border-bottom-right-radius:4px}
.msg.bot .bubble{background:#fff;color:#1f2937;border-bottom-left-radius:4px}
.time{display:block;font-size:10px;margin-top:6px;opacity:.7}
.typing{display:flex;gap:8px;align-items:center}
.typing .bubble{background:#fff;padding:10px 14px}
.typing-dot{width:8px;height:8px;border-radius:50%;background:#6b7280;animation:tp 1.4s infinite}
.typing-dot:nth-child(2){animation-delay:.2s}
.typing-dot:nth-child(3){animation-delay:.4s}
.hint{position:absolute;bottom:72px;right:0;background:#fff;padding:10px 12px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.12);font-size:13px;border:1px solid #e5e7eb}
.toggle{width:56px;height:56px;border-radius:50%;position:fixed;bottom:24px;right:24px;border:none;background:linear-gradient(135deg,${THEME_COLOR} 0%, #764ba2 100%);color:#fff;cursor:pointer;z-index:2147483646;display:flex;align-items:center;justify-content:center}
@keyframes fi{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes pl{0%,100%{opacity:1}50%{opacity:.7}}@keyframes tp{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}`;

  // --- HTML template (minified) ---
  const html = `
<div class="container" id="container">
  <div class="chat-window" id="chatWindow" role="dialog" aria-label="Chat widget">
    <div class="header">
      <div class="avatar" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
      </div>
      <div class="header-text">
        <h3>Plugin Assistant</h3>
        <p>Always ready to help</p>
        <div class="template-options" id="templateOptions">
          <label><input type="radio" name="template" value="1"> Template 1</label>
          <label><input type="radio" name="template" value="2"> Template 2</label>
          <label><input type="radio" name="template" value="3"> Template 3</label>
        </div>
      </div>
      <button class="close-btn" id="closeBtn" title="Close">&times;</button>
    </div>

    <div class="messages" id="messagesArea" tabindex="0">
      <div class="empty" id="emptyState">
        <div class="icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </div>
        <h4>Ask me anything!</h4>
        <p>Need help with plugin variables? Just type your question below.</p>
      </div>
    </div>

    <div class="input-area">
      <input id="messageInput" class="input" placeholder="Type your message..." aria-label="Message" />
      <button id="sendBtn" class="send" title="Send">
        <svg id="sendIcon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
        <svg id="spinnerIcon" style="display:none" width="18" height="18" viewBox="0 0 24 24" class="spinner" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75" /></svg>
      </button>
    </div>
  </div>

  <div class="hint" id="hintBubble">Ask me about plugin variables! 💬</div>
</div>
`;

  // inject style & html
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  shadow.appendChild(styleEl);

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  shadow.appendChild(wrapper);

  // toggle button in host document (outside shadow to be clickable above everything)
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'toggle';
  toggleBtn.setAttribute('aria-label','Open chat');
  toggleBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`;
  document.body.appendChild(toggleBtn);

  // --- element refs inside shadow ---
  const s = shadow;
  const chatWindow = s.getElementById('chatWindow');
  const chatToggleBtn = toggleBtn;
  const closeBtn = s.getElementById('closeBtn');
  const messagesArea = s.getElementById('messagesArea');
  const messageInput = s.getElementById('messageInput');
  const sendBtn = s.getElementById('sendBtn');
  const emptyState = s.getElementById('emptyState');
  const hintBubble = s.getElementById('hintBubble');
  const templateOptions = s.getElementById('templateOptions');

  // --- state ---
  let isOpen = false;
  let isLoading = false;
  let messages = [];

  // --- storage helpers ---
  function loadMessages(){
    try{
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if(saved){ messages = JSON.parse(saved); renderMessages(); }
    }catch(e){ console.warn('chat widget load error', e); }
  }
  function saveMessages(){
    try{ sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages)); }catch(e){}
  }

  // --- time formatter ---
  function formatTime(date){ return new Date(date).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}); }

  // --- create message element ---
  function createMessageElement(message){
    const messageDiv = document.createElement('div');
    messageDiv.className = 'msg ' + (message.sender || 'bot');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const text = document.createElement('div');
    text.textContent = message.text || '';
    bubble.appendChild(text);
    const time = document.createElement('span');
    time.className = 'time';
    time.textContent = formatTime(message.timestamp);
    bubble.appendChild(time);
    messageDiv.appendChild(bubble);
    return messageDiv;
  }

  // typing indicator
  function showTypingIndicator(){
    removeTypingIndicator();
    const div = document.createElement('div');
    div.className = 'typing';
    div.id = 'typingIndicator';
    div.innerHTML = '<div class="bubble"><div style="display:flex;gap:6px;align-items:center"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div><span style="margin-left:8px">Typing...</span></div></div>';
    messagesArea.appendChild(div);
    scrollToBottom();
  }
  function removeTypingIndicator(){ const el = s.getElementById('typingIndicator'); if(el) el.remove(); }

  // render
  function renderMessages(){
    while(messagesArea.firstChild) messagesArea.removeChild(messagesArea.firstChild);
    if(!messages || !messages.length){
      emptyState.style.display = 'flex';
      messagesArea.appendChild(emptyState);
    } else {
      emptyState.style.display = 'none';
      messages.forEach(m => messagesArea.appendChild(createMessageElement(m)));
      scrollToBottom();
    }
  }
  function scrollToBottom(){ messagesArea.scrollTop = messagesArea.scrollHeight; }

  // --- variable edit handler (exposed globally) ---
  // keeps original document-scoped behavior so it can find host-page plugins
  window.handleVariableEdit = function (formattedText){
    try{
      const lines = (formattedText||'').split("\n").map(l=>l.trim()).filter(Boolean);
      const currentVar = lines[1]?.replace(/"/g,'') || '';
      const newVar = lines[3]?.replace(/"/g,'') || '';
      const reason = lines[5] || '';
      const variableName = currentVar.split(":")[0]?.trim();
      console.log('chat-widget parsed variable:', variableName);

      // find plugin in host document (same logic as original)
      const plugins = document.querySelectorAll(".plugin #headingOne > h4 > div.pull-left");
      let targetPlugin = null;
      plugins.forEach(ele => {
        const text = ele.innerText.toLowerCase();
        if(text.includes("variable") && text.includes("declaration")) targetPlugin = ele.closest(".plugin");
      });
      if(!targetPlugin){ console.warn('chat-widget: target plugin not found'); return; }
      const editBtn = targetPlugin.querySelector(".pull-right .edit-plugin.btn");
      if(!editBtn){ console.warn('chat-widget: edit button not found'); return; }
      editBtn.click();
      const searchBox = document.querySelector("#searchForHtmlClasses");
      if(searchBox){
        searchBox.value = (currentVar.split(" ")[0] || '');
        searchBox.dispatchEvent(new Event("change",{bubbles:true}));
        searchBox.dispatchEvent(new KeyboardEvent("keyup",{key:'Enter',keyCode:13,which:13,bubbles:true}));
      }
    }catch(e){ console.error('handleVariableEdit error', e); }
  };

  // --- format backend response (same logic) ---
  function formatBackendResponse(data){
    const payload = Array.isArray(data) && data.length ? data[0] : data;
    if(!payload) return 'No data received.';
    function formatChange(cur,next,reason){ return ['Replace your current variable:','"' + cur + '"','', 'with:','"' + next + '"','', 'Reason:', reason || 'No reason provided'].join('\\n'); }
    if(payload.current_variable && payload.new_variable) return formatChange(payload.current_variable,payload.new_variable,payload.reason);
    if(payload.formatted_output){
      let fo = payload.formatted_output;
      if(typeof fo === 'string'){
        try{ fo = JSON.parse(fo); }catch(e){ return fo; }
      }
      if(fo.current_variable && fo.new_variable) return formatChange(fo.current_variable,fo.new_variable,fo.reason);
      return JSON.stringify(fo,null,2);
    }
    if(typeof payload === 'object') return JSON.stringify(payload,null,2);
    return String(payload);
  }

  // --- send message ---
  async function sendMessage(){
    const selectedTemplate = (shadow.querySelector('input[name="template"]:checked')||{}).value || null;
    const text = messageInput.value.trim();
    if(!selectedTemplate){ alert('Please select a template first.'); return; }
    if(!text || isLoading) return;

    const userMessage = { id: Date.now().toString(), text, sender:'user', timestamp:new Date().toISOString() };
    messages.push(userMessage);
    saveMessages();
    renderMessages();
    messageInput.value = '';
    isLoading = true; updateLoadingState(); showTypingIndicator();

    let formatted = '';
    try{
      const res = await fetch(BACKEND_URL, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ message:text, template:selectedTemplate })
      });
      const data = await res.json();
      formatted = formatBackendResponse(data);
      const botMessage = { id:(Date.now()+1).toString(), text:formatted, sender:'bot', timestamp:new Date().toISOString() };
      messages.push(botMessage);
      saveMessages();
    }catch(err){
      console.error('chat widget send error', err);
      messages.push({ id:(Date.now()+1).toString(), text:"Sorry, I couldn't connect to the server. Please try again.", sender:'bot', timestamp:new Date().toISOString() });
      saveMessages();
    }finally{
      isLoading = false; removeTypingIndicator(); updateLoadingState(); renderMessages();
      // call host-edit routine (keeps previous behavior)
      try{ window.handleVariableEdit(formatted); }catch(e){}
    }
  }

  // --- loading UI update ---
  function updateLoadingState(){
    messageInput.disabled = isLoading;
    sendBtn.disabled = isLoading || !messageInput.value.trim();
    const sendIcon = shadow.getElementById('sendIcon');
    const spinnerIcon = shadow.getElementById('spinnerIcon');
    if(isLoading){ if(sendIcon) sendIcon.style.display='none'; if(spinnerIcon) spinnerIcon.style.display='block'; }
    else { if(sendIcon) sendIcon.style.display='block'; if(spinnerIcon) spinnerIcon.style.display='none'; }
  }

  // --- event wiring ---
  chatToggleBtn.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', function(e){ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }});
  messageInput.addEventListener('input', function(){ sendBtn.disabled = !messageInput.value.trim() || isLoading; });

  function toggleChat(){
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    hintBubble.style.display = isOpen ? 'none' : 'block';
    chatToggleBtn.setAttribute('aria-pressed', String(isOpen));
    if(isOpen){ setTimeout(()=>messageInput.focus(), 250); }
  }

  // --- init ---
  loadMessages();
  updateLoadingState();

  // close on outside click (optional): if you click outside the shadow-hosted window and not on toggle, close it
  document.addEventListener('click', function(ev){
    if(!isOpen) return;
    const path = ev.composedPath ? ev.composedPath() : (ev.path || []);
    if(path && (path.indexOf(host) === -1 && path.indexOf(toggleBtn) === -1)){
      // click outside host
      chatWindow.classList.remove('open');
      isOpen = false;
      hintBubble.style.display = 'block';
    }
  }, true);

  // expose a small public API if needed
  window.ChatWidget = window.ChatWidget || {};
  window.ChatWidget.open = function(){ if(!isOpen) toggleChat(); };
  window.ChatWidget.close = function(){ if(isOpen) toggleChat(); };
  window.ChatWidget.send = function(msg, template){
    if(template){
      const radio = shadow.querySelector('input[name="template"][value="'+template+'"]');
      if(radio) radio.checked = true;
    }
    messageInput.value = msg;
    sendMessage();
  };

})();
