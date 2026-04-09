(function(){
var s=document.createElement('style');
s.textContent='@keyframes vpulse{0%,100%{box-shadow:0 4px 20px rgba(220,38,38,0.4)}50%{box-shadow:0 4px 20px rgba(220,38,38,0.4),0 0 0 12px rgba(220,38,38,0)}} #voice-chat-frame{position:fixed;bottom:160px;right:24px;width:400px;height:580px;border:none;border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.3);z-index:10000;display:none;background:#0a0e17;overflow:hidden} #voice-chat-close{position:fixed;bottom:745px;right:28px;z-index:10001;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.6);color:#fff;border:none;cursor:pointer;font-size:16px;display:none;align-items:center;justify-content:center} @media(max-width:500px){#voice-chat-frame{width:calc(100% - 16px);right:8px;bottom:140px;height:70vh} #voice-chat-close{right:12px;bottom:calc(70vh + 145px)}}';
document.head.appendChild(s);
var frame=document.createElement('iframe');
frame.id='voice-chat-frame';
frame.src='/voice/';
document.body.appendChild(frame);
var closeBtn=document.createElement('button');
closeBtn.id='voice-chat-close';
closeBtn.innerHTML='✕';
closeBtn.onclick=function(){frame.style.display='none';closeBtn.style.display='none';};
document.body.appendChild(closeBtn);
var d=document.createElement('div');
d.innerHTML='<div style="position:fixed;bottom:90px;right:24px;z-index:9999;cursor:pointer;text-align:center" id="voice-fab"><div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#ef4444);display:flex;align-items:center;justify-content:center;animation:vpulse 2s infinite;transition:transform 0.2s" onmouseover="this.style.transform=\'scale(1.1)\'" onmouseout="this.style.transform=\'scale(1)\'"><svg width="26" height="26" fill="white" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></div><div style="margin-top:6px;font-size:11px;color:#dc2626;font-weight:600;font-family:system-ui;text-shadow:0 0 8px rgba(220,38,38,0.3)">Связаться<br>с менеджером</div></div>';
document.body.appendChild(d);
document.getElementById('voice-fab').onclick=function(){
var f=document.getElementById('voice-chat-frame');
var c=document.getElementById('voice-chat-close');
if(f.style.display==='none'||f.style.display===''){f.style.display='block';c.style.display='flex';}
else{f.style.display='none';c.style.display='none';}
};

if(!localStorage.getItem('cookies_accepted')){
var cb=document.createElement('div');
cb.id='cookie-banner';
cb.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#0F1923;color:rgba(255,255,255,.8);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;z-index:9998;font-family:system-ui,sans-serif;font-size:13px;flex-wrap:wrap';
cb.innerHTML='<span>Мы используем cookies для улучшения работы сайта. <a href="/privacy.html" style="color:#D42B2B">Подробнее</a></span><button onclick="localStorage.setItem(\'cookies_accepted\',\'1\');this.parentElement.remove()" style="background:#D42B2B;color:#fff;border:none;padding:8px 20px;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap">Принять</button>';
document.body.appendChild(cb);
}
})();