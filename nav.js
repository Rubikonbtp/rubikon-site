(function(){
var html = `<style>
.n-hdr{position:sticky;top:0;z-index:1000;background:#fff;border-bottom:1px solid #E5E8ED;transition:transform .3s ease}
.n-in{display:flex;align-items:center;max-width:1200px;margin:0 auto;padding:14px 24px;gap:32px;position:relative}
.n-logo{display:flex;align-items:center;gap:10px;text-decoration:none;flex-shrink:0}
.n-logo span{font-size:22px;font-weight:900;color:#D42B2B;letter-spacing:-0.02em}
.n-nav{display:flex;gap:20px;align-items:center;flex:1;justify-content:center}
.n-link{color:#5A6578;text-decoration:none;font-size:15px;font-weight:600;transition:color .2s;background:none;border:none;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:4px;padding:0}
.n-link:hover{color:#0F1923}
.n-link svg{width:11px;height:11px;transition:transform .2s;flex-shrink:0}
.n-link.open svg{transform:rotate(180deg)}
.n-cta{margin-left:auto;flex-shrink:0}
.n-mob-tel{display:none;align-items:center;justify-content:center;width:40px;height:40px;background:#D42B2B;border-radius:50%;color:#fff;text-decoration:none;flex-shrink:0}
.n-burger{display:none;width:36px;height:36px;border:none;background:none;cursor:pointer;flex-direction:column;justify-content:center;align-items:center;gap:5px;padding:0;flex-shrink:0}
.n-burger span{display:block;width:22px;height:2px;background:#1a1a1a;border-radius:2px}
.n-mega{display:none;position:absolute;top:calc(100% + 1px);left:0;right:0;background:#fff;border:1px solid #E5E8ED;border-radius:0 0 12px 12px;box-shadow:0 8px 32px rgba(0,0,0,.10);padding:24px;z-index:100}
.n-mega-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px}
.n-card{border:1px solid #E5E8ED;border-radius:10px;overflow:hidden;text-decoration:none;display:block;color:inherit;transition:border-color .15s,box-shadow .15s}
.n-card:hover{border-color:#D42B2B;box-shadow:0 4px 16px rgba(212,43,43,.1);text-decoration:none}
.n-card.soon{opacity:.5;pointer-events:none}
.n-card-img{height:110px;background:#F8F9FB;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.n-card-img img{width:100%;height:100%;object-fit:contain;padding:10px}
.n-badge{position:absolute;top:6px;right:6px;background:#F1F3F5;color:#8895A7;font-size:9px;font-weight:700;padding:2px 7px;border-radius:20px;text-transform:uppercase;letter-spacing:.05em}
.n-card-body{padding:12px 14px}
.n-card-title{font-size:12px;font-weight:800;color:#0F1923;margin-bottom:6px}
.n-card-links{display:flex;flex-direction:column;gap:1px}
.n-card-link{font-size:11px;color:#5A6578;padding:2px 0;display:flex;align-items:center;gap:5px;text-decoration:none;transition:color .15s}
.n-card-link:hover{color:#D42B2B;text-decoration:none}
.n-card-link::before{content:'';width:3px;height:3px;border-radius:50%;background:#D5D9DF;flex-shrink:0}
.n-card-link:hover::before{background:#D42B2B}
.n-mega-footer{border-top:1px solid #E5E8ED;padding-top:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.n-all{font-size:13px;font-weight:700;color:#D42B2B;text-decoration:none}
.n-tools{display:flex;gap:20px}
.n-tool{font-size:12px;color:#5A6578;text-decoration:none;display:flex;align-items:center;gap:5px;transition:color .15s}
.n-tool:hover{color:#0F1923;text-decoration:none}
.n-tool-ico{width:24px;height:24px;background:#F8F9FB;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:12px}
.n-mob-nav{display:none;position:fixed;inset:0;top:65px;background:#fff;z-index:999;padding:24px;flex-direction:column}
.n-mob-nav.open{display:flex}
.n-mob-nav a{display:block;padding:14px 0;border-bottom:1px solid #eee;font-size:16px;font-weight:600;color:#1a1a1a;text-decoration:none}
.n-mob-nav a:hover{color:#D42B2B}
@media(max-width:768px){.n-nav{display:none}.n-mob-tel{display:flex!important}.n-burger{display:flex!important}.n-cta{display:none!important}}
</style>
<header class="n-hdr">
<div class="n-in">
  <a href="/" class="n-logo">
    <img src="/img/logo-icon.png" alt="Рубикон" style="height:36px;width:36px">
    <span>РУБИКОН</span>
  </a>
  <nav class="n-nav">
    <button class="n-link" id="nBtnProd" onclick="nToggle('prod')">Продукция<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4l4 4 4-4"/></svg></button>
    <a href="/industries.html" class="n-link">Применение</a>
    <a href="/#insights" class="n-link">Проекты</a>
    <a href="/about.html" class="n-link">О компании</a>
    <a href="/contacts.html" class="n-link">Контакты</a>
  </nav>
  <a href="https://kbb.expert/demo" target="_blank" class="btn btn-red btn-pulse n-cta" style="padding:13px 28px;font-size:15px">🖥️ Программа расчёта</a>
  <a href="tel:+78003017978" class="n-mob-tel"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg></a>
  <button class="n-burger" onclick="document.getElementById('nMobNav').classList.toggle('open')"><span></span><span></span><span></span></button>

  <div class="n-mega" id="nMegaProd">
    <div class="n-mega-grid">
      <a href="/products/btp.html" class="n-card">
        <div class="n-card-img"><img src="/img/btp-3d.jpg" alt="БТП"></div>
        <div class="n-card-body">
          <div class="n-card-title">Блочные тепловые пункты</div>
          <div class="n-card-links">
            <a class="n-card-link" href="/products/btp.html">БТП Рубикон — обзор</a>
            <a class="n-card-link" href="/products/btp-uzel-vvoda.html">Узел ввода и учёта тепла</a>
            <a class="n-card-link" href="/products/btp-otoplenie.html">Узел отопления</a>
            <a class="n-card-link" href="/products/btp-gvs.html">Узел ГВС</a>
            <a class="n-card-link" href="/products/btp-ventilyaciya.html">Узел вентиляции</a>
          </div>
        </div>
      </a>
      <a href="/products.html" class="n-card">
        <div class="n-card-img"><img src="/img/pto-3d.jpg" alt="ПТО"></div>
        <div class="n-card-body">
          <div class="n-card-title">Пластинчатые теплообменники</div>
          <div class="n-card-links">
            <a class="n-card-link" href="/products.html">ПТО Рубикон — обзор</a>
            <a class="n-card-link" href="/products/raschet-pto.html">Подбор теплообменника</a>
          </div>
        </div>
      </a>
      <div class="n-card soon">
        <div class="n-card-img"><img src="/img/btp-node-vvod1.png" alt="Клапаны"><span class="n-badge">Скоро</span></div>
        <div class="n-card-body">
          <div class="n-card-title">Клапаны и электроприводы</div>
          <div class="n-card-links">
            <span class="n-card-link">Регулирующие клапаны</span>
            <span class="n-card-link">Электроприводы Рубикон</span>
          </div>
        </div>
      </div>
      <div class="n-card soon">
        <div class="n-card-img"><img src="/img/btp-node-gvs.png" alt="Контроллеры"><span class="n-badge">Скоро</span></div>
        <div class="n-card-body">
          <div class="n-card-title">Контроллеры управления</div>
          <div class="n-card-links">
            <span class="n-card-link">Контроллер БТП</span>
            <span class="n-card-link">Диспетчеризация</span>
          </div>
        </div>
      </div>
    </div>
    <div class="n-mega-footer">
      <a href="/products.html" class="n-all">Все продукты Рубикон →</a>
      <div class="n-tools">
        <a href="/products/raschet-btp.html" class="n-tool"><span class="n-tool-ico">🖥️</span>Расчёт БТП</a>
        <a href="/products/raschet-pto.html" class="n-tool"><span class="n-tool-ico">📐</span>Расчёт ПТО</a>
        <a href="/docs/" class="n-tool"><span class="n-tool-ico">📄</span>Документация</a>
      </div>
    </div>
  </div>
</div>
</header>
<div class="n-mob-nav" id="nMobNav">
  <a href="/products.html">Продукция</a>
  <a href="/industries.html">Применение</a>
  <a href="/#insights">Проекты</a>
  <a href="/about.html">О компании</a>
  <a href="/contacts.html">Контакты</a>
  <a href="/products/raschet-btp.html" style="color:#D42B2B">🖥️ Расчёт БТП</a>
  <a href="/products/raschet-pto.html" style="color:#D42B2B">📐 Расчёт ПТО</a>
</div>`;

document.getElementById('site-header').innerHTML = html;

window.nToggle = function(which) {
  var m = document.getElementById('nMegaProd');
  var b = document.getElementById('nBtnProd');
  var isOpen = m.style.display === 'block';
  m.style.display = isOpen ? 'none' : 'block';
  b.classList.toggle('open', !isOpen);
};

document.addEventListener('click', function(e) {
  if(!e.target.closest('.n-in')) {
    var m = document.getElementById('nMegaProd');
    var b = document.getElementById('nBtnProd');
    if(m) m.style.display = 'none';
    if(b) b.classList.remove('open');
  }
});

var lastY = 0;
window.addEventListener('scroll', function() {
  var hdr = document.querySelector('.n-hdr');
  if(!hdr) return;
  var y = window.scrollY;
  hdr.style.transform = (y > lastY && y > 80) ? 'translateY(-100%)' : 'translateY(0)';
  lastY = y;
}, {passive:true});

})();
