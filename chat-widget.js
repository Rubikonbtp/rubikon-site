(function(){
  // === STYLES ===
  const css = document.createElement('style');
  css.textContent = `
  #rb-chat-btn{position:fixed;bottom:24px;right:24px;z-index:9999;width:60px;height:60px;border-radius:50%;background:#D42B2B;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(212,43,43,.4);display:flex;align-items:center;justify-content:center;transition:all .3s}
  #rb-chat-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(212,43,43,.5)}
  #rb-chat-btn svg{width:28px;height:28px}
  #rb-chat-btn.open svg.ico-chat{display:none}
  #rb-chat-btn:not(.open) svg.ico-close{display:none}
  #rb-chat-box{position:fixed;bottom:96px;right:24px;z-index:9998;width:380px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 140px);background:#fff;border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,.15);display:none;flex-direction:column;overflow:hidden;font-family:'DM Sans',sans-serif}
  #rb-chat-box.open{display:flex;animation:rbSlideUp .3s ease}
  @keyframes rbSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .rb-hdr{background:#0F1923;color:#fff;padding:16px 20px;display:flex;align-items:center;gap:12px;flex-shrink:0}
  .rb-hdr-dot{width:10px;height:10px;border-radius:50%;background:#34D399;flex-shrink:0}
  .rb-hdr-info h4{font-size:15px;font-weight:700;margin:0}
  .rb-hdr-info p{font-size:12px;margin:0;opacity:.6}
  .rb-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:#F8F9FB}
  .rb-msg{max-width:85%;padding:12px 16px;border-radius:16px;font-size:14px;line-height:1.6;word-wrap:break-word}
  .rb-msg a{color:#D42B2B;text-decoration:underline}
  .rb-msg-bot{background:#fff;color:#1a1a1a;border-bottom-left-radius:4px;align-self:flex-start;box-shadow:0 1px 4px rgba(0,0,0,.06)}
  .rb-msg-user{background:#D42B2B;color:#fff;border-bottom-right-radius:4px;align-self:flex-end}
  .rb-typing{align-self:flex-start;background:#fff;padding:12px 20px;border-radius:16px;border-bottom-left-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
  .rb-typing span{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ccc;animation:rbBounce .6s infinite alternate;margin:0 2px}
  .rb-typing span:nth-child(2){animation-delay:.2s}
  .rb-typing span:nth-child(3){animation-delay:.4s}
  @keyframes rbBounce{to{background:#999;transform:translateY(-4px)}}
  .rb-input{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #eee;background:#fff;flex-shrink:0}
  .rb-input input{flex:1;border:1px solid #e5e7eb;border-radius:12px;padding:10px 14px;font-size:14px;outline:none;font-family:inherit}
  .rb-input input:focus{border-color:#D42B2B}
  .rb-input button{width:40px;height:40px;border-radius:12px;background:#D42B2B;color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;flex-shrink:0}
  .rb-input button:hover{background:#b52222}
  .rb-input button:disabled{background:#ccc;cursor:not-allowed}
  .rb-powered{text-align:center;padding:6px;font-size:10px;color:#aaa;background:#fff}
  @media(max-width:480px){
    #rb-chat-box{bottom:0;right:0;width:100%;max-width:100%;height:100vh;max-height:100vh;border-radius:0}
    #rb-chat-btn{bottom:16px;right:16px}
  }
  `;
  document.head.appendChild(css);

  // === HTML ===
  const chatBtn = document.createElement('button');
  chatBtn.id = 'rb-chat-btn';
  chatBtn.title = 'Чат с Рубикон';
  chatBtn.innerHTML = `
    <svg class="ico-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    <svg class="ico-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  document.body.appendChild(chatBtn);

  const chatBox = document.createElement('div');
  chatBox.id = 'rb-chat-box';
  chatBox.innerHTML = `
    <div class="rb-hdr">
      <div class="rb-hdr-dot"></div>
      <div class="rb-hdr-info"><h4>Ассистент Рубикон</h4><p>Онлайн • Отвечаем мгновенно</p></div>
    </div>
    <div class="rb-msgs" id="rb-msgs"></div>
    <div class="rb-input">
      <input type="text" id="rb-inp" placeholder="Напишите сообщение..." autocomplete="off">
      <button id="rb-send" title="Отправить">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
    <div class="rb-powered">Рубикон AI • rubikonbtp.ru</div>`;
  document.body.appendChild(chatBox);

  // === STATE ===
  let isOpen = false;
  let history = [];
  let isLoading = false;
  const msgs = document.getElementById('rb-msgs');
  const inp = document.getElementById('rb-inp');
  const sendBtn = document.getElementById('rb-send');

  // === GREETING ===
  function showGreeting(){
    addMsg('bot', 'Здравствуйте! Я AI-ассистент компании «Рубикон». Помогу разобраться в нашем оборудовании — пластинчатых теплообменниках и блочных тепловых пунктах. Задайте вопрос!');
  }

  // === TOGGLE ===
  chatBtn.addEventListener('click', function(){
    isOpen = !isOpen;
    chatBox.classList.toggle('open', isOpen);
    chatBtn.classList.toggle('open', isOpen);
    if(isOpen && msgs.children.length === 0){
      showGreeting();
    }
    if(isOpen) inp.focus();
  });

  // === ADD MESSAGE ===
  function addMsg(role, text){
    const div = document.createElement('div');
    div.className = 'rb-msg rb-msg-' + (role === 'bot' ? 'bot' : 'user');
    // Simple markdown: **bold**, links
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
    div.innerHTML = html;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping(){
    const div = document.createElement('div');
    div.className = 'rb-typing';
    div.id = 'rb-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping(){
    const t = document.getElementById('rb-typing');
    if(t) t.remove();
  }

  // === SEND ===
  async function send(){
    const text = inp.value.trim();
    if(!text || isLoading) return;
    
    addMsg('user', text);
    inp.value = '';
    isLoading = true;
    sendBtn.disabled = true;
    showTyping();

    history.push({ role: 'user', content: text });

    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-10) }) // last 10 messages for context
      });
      
      const data = await res.json();
      hideTyping();
      
      if(data.reply){
        history.push({ role: 'assistant', content: data.reply });
        addMsg('bot', data.reply);
      } else if(data.error){
        addMsg('bot', 'Извините, произошла ошибка. Позвоните нам: 8 (800) 301-79-78');
      }
    } catch(err){
      hideTyping();
      addMsg('bot', 'Нет связи с сервером. Свяжитесь с нами: 8 (800) 301-79-78 или info@kbbcompany.ru');
    }
    
    isLoading = false;
    sendBtn.disabled = false;
    inp.focus();
  }

  sendBtn.addEventListener('click', send);
  inp.addEventListener('keydown', function(e){
    if(e.key === 'Enter') send();
  });
})();
