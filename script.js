document.addEventListener('DOMContentLoaded', function(){
  try{ if('scrollRestoration' in history) history.scrollRestoration = 'manual'; }catch(e){}
  if(location.hash){ setTimeout(()=>{ try{ window.scrollTo(0,0); }catch(e){}; try{ history.replaceState(null,'', location.pathname + location.search); }catch(e){} }, 20); }
  
  // 检测用户是否偏好减少动画
  window.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // 页面加载渐入动画
  document.body.classList.add('loaded');

  // 生成并注入 PNG favicon 以兼容不支持 SVG 的浏览器
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grd = ctx.createLinearGradient(0,0,32,32);
    grd.addColorStop(0, '#ff3d92');
    grd.addColorStop(1, '#9ad3ff');
    ctx.fillStyle = grd;
    ctx.roundRect ? ctx.roundRect(0,0,32,32,6) : ctx.fillRect(0,0,32,32);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Y', 16, 18);
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/png';
    link.sizes = '32x32';
    link.href = pngUrl;
    document.head.appendChild(link);
  } catch (e) { /* 忽略favicon生成错误 */ }

  
  // 添加元素淡入动画
  const fadeElements = document.querySelectorAll('.card, .hero-inner, h2, p');
  fadeElements.forEach(el => el.classList.add('fade-in'));
  
  // 监听滚动以触发元素动画
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.1});
  
  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
  // 缓存常用 DOM 节点引用
  const navToggle = document.querySelector('.nav-toggle');
  const themeToggle = document.getElementById('themeToggle');
  const siteNav = document.querySelector('.site-nav');
  const copyBtn = document.getElementById('copyEmailBtn');
  const email = 'ylmjc114@gmail.com';
  const yearEl = document.getElementById('year');
  // 设置页脚年份为当前年份
  yearEl.textContent = new Date().getFullYear();

  // 国际化字典（含 HTML 片段），每个 key 对应页面上带有 data-i18n 的元素
  const i18n = {
    zh: {
      'nav.home':'首页', 'nav.projects':'作品', 'nav.contact':'联系',
      'github':'GitHub',
      'hero.greeting':'你好,我是',
      'name':'樱落满尽城',
      'hero.tagline':'热爱前端与交互设计，喜欢把想法做成有趣的页面。',
      'btn.viewProjects':'查看作品', 'btn.copyEmail':'复制邮箱', 'btn.copied':'已复制 ✓', 'copy.failed':'复制失败，请手动复制：',
      'projects.title':'作品',
      'project1.title':'个人作品集','project1.desc':'一个响应式作品集网站，展示了我在交互、动画和页面结构上的实践。','project1.tech':'技术：HTML / CSS / JS',
      'project2.title':'小工具 & 组件','project2.desc':'若干可复用的小组件：自定义弹窗、可访问的表单控件、轻量动画库封装等。','project2.tech':'技术：JavaScript',
      'contact.title':'联系我','contact.email':'邮箱：<a id="emailLink" href="mailto:ylmjc114@gmail.com">ylmjc114@gmail.com</a>','contact.hint':'也可以直接发邮件到上面的地址，或点击上方的"复制邮箱"按钮把邮箱复制到剪贴板。',
      'hitokoto.refresh':'换一言',
      'telegram': 'Telegram'
    }
  };

  // 读取主题偏好
  let theme = localStorage.getItem('site-theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  // whether user prefers reduced motion
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyTheme(){
    try{
      if(theme === 'light'){
        document.documentElement.setAttribute('data-theme','light');
      }else{
        document.documentElement.removeAttribute('data-theme');
      }
      // reflect state on the toggle for accessibility if present
      if(themeToggle){
        themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
      }
      // 同步背景覆盖层样式以保证文字可读性
      try{
        let overlay = document.querySelector('.bg-overlay');
        if(!overlay){
          overlay = document.createElement('div');
          overlay.className = 'bg-overlay';
          document.body.appendChild(overlay);
        }
        overlay.style.opacity = theme === 'light' ? 0.1 : 0.4;
      }catch(e){}
      
      localStorage.setItem('site-theme', theme);
    }catch(e){}
  }
  
  // 应用主题
  applyTheme();
  
  // 主题切换
  if(themeToggle){
    themeToggle.addEventListener('click', (e) => {
      theme = theme === 'dark' ? 'light' : 'dark';
      applyTheme();
    });
  }

  // 移动端导航切换
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      // 切换 aria 属性以便无障碍，同时控制移动端导航的显示
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.setAttribute('aria-hidden', String(expanded));
    });
  }

  // 按钮点击效果
  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('click', function(e){
      if(reduceMotion) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 0.8;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      ripple.style.background = 'rgba(255,255,255,0.10)';
      btn.appendChild(ripple);
      ripple.style.transform = 'scale(0)';
      const anim = ripple.animate([
        {transform:'scale(0)', opacity:0.55},
        {transform:'scale(3.2)', opacity:0}
      ],{duration:420, easing:'cubic-bezier(.22,.8,.26,1)'});
      anim.onfinish = ()=> ripple.remove();
    });
  });

  // 滚动方向检测
  let lastScroll = window.scrollY || 0;
  let ticking = false;
  function onScroll(){
    const y = window.scrollY || 0;
    if(Math.abs(y - lastScroll) < 8) { ticking = false; return; }
    if(y > lastScroll) document.body.classList.add('scroll-down'), document.body.classList.remove('scroll-up');
    else document.body.classList.add('scroll-up'), document.body.classList.remove('scroll-down');
    lastScroll = y;
    ticking = false;
  }
  window.addEventListener('scroll', ()=>{
    if(!ticking){
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, {passive:true});
  
  // 卡片倾斜交互
  const cards = document.querySelectorAll('.card[data-tilt]');
  cards.forEach(card => {
    if (reduceMotion) return;
    
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const tiltX = (y / rect.height - 0.5) * 10;
      const tiltY = (0.5 - x / rect.width) * 10;
      
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      card.style.setProperty('--glare-x', `${glareX}%`);
      card.style.setProperty('--glare-y', `${glareY}%`);
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
  
  // 视差滚动效果
  function initParallaxEffect() {
    if (!('IntersectionObserver' in window) || reduceMotion) return;
    
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('parallax-active');
        }
      });
    }, {
      threshold: 0.1
    });
    
    parallaxElements.forEach(el => {
      observer.observe(el);
      
      const speed = el.getAttribute('data-parallax') || 0.2;
      el.style.setProperty('--parallax-speed', speed);
    });
    
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      
      parallaxElements.forEach(el => {
        if (!el.classList.contains('parallax-active')) return;
        
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        const viewportPercentage = (rect.top + rect.height / 2) / viewportHeight;
        
        const speed = parseFloat(el.style.getPropertyValue('--parallax-speed'));
        const yOffset = (viewportPercentage - 0.5) * speed * 100;
        
        el.style.transform = `translateY(${yOffset}px)`;
      });
    }, { passive: true });
  }

  // 复制邮箱
  if(copyBtn){
    copyBtn.addEventListener('click', async ()=>{
      try{
        await navigator.clipboard.writeText(email);
        copyBtn.textContent = i18n.zh['btn.copied'] || 'Copied ✓'; 
        setTimeout(()=> copyBtn.textContent = i18n.zh['btn.copyEmail'] || 'Copy Email', 2000);
      }catch(e){
        alert((i18n.zh['copy.failed'] || 'Copy failed: ') + email);
      }
    });
  }
  
  // 初始化视差滚动效果
  initParallaxEffect();

  // 平滑滚动与滚动高亮
  const navLinks = document.querySelectorAll('.site-nav a');
  navLinks.forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(href && href.startsWith('#')){
        e.preventDefault();
        const target = document.querySelector(href);
        if(target){
          setTimeout(()=> target.scrollIntoView({behavior:'smooth', block:'start'}), 10);
          if(window.innerWidth <= 700){
            siteNav.setAttribute('aria-hidden','true');
            if(navToggle) navToggle.setAttribute('aria-expanded','false');
          }
        }
      }
    });
  });

  // 滚动 reveal 与导航高亮
  const revealEls = document.querySelectorAll('.panel, .hero-inner');
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('reveal');
        entry.target.classList.remove('hidden');
      }
    });
  },{threshold:0.12});
  revealEls.forEach(el=>observer.observe(el));

  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const id = entry.target.id;
        document.querySelectorAll('.site-nav a').forEach(a=>{
          a.classList.toggle('active', a.getAttribute('href') === ('#'+id));
        });
      }
    });
  },{threshold:0.5});
  sections.forEach(s=>navObserver.observe(s));

  // 随机二次元风格背景拼接（多图垂直拼接，含预加载与轻量过渡）
  // 背景图片功能已移除
});
