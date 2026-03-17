/* ================================================================
   js/v6-features.js — IBM Case Intelligence Platform v6
   MAJOR RELEASE: Toast · Keyboard shortcuts · Progress bar ·
   Command palette · Status bar · Smart tooltips · Back-to-top ·
   Sticky header · Copy-to-clipboard · Print mode
   ================================================================ */
const V6 = (() => {
  "use strict";

  /* ── UTILS ─────────────────────────────────────────── */
  const _esc = s => String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  const _id  = id => document.getElementById(id);
  const _$   = (sel, ctx) => (ctx||document).querySelector(sel);
  const _isInput = () => {
    const t = (document.activeElement?.tagName||"").toLowerCase();
    return t==="input"||t==="textarea"||t==="select"||document.activeElement?.isContentEditable;
  };

  /* ── PROGRESS BAR ──────────────────────────────────── */
  let _pTimer=null;
  function showProgress(){
    const bar=_id("app-progress"),fill=_id("app-progress-fill");
    if(!bar||!fill)return;
    bar.classList.remove("hidden"); fill.style.width="0%";
    let pct=0; clearInterval(_pTimer);
    _pTimer=setInterval(()=>{
      pct+= pct<70?Math.random()*12+3:pct<90?Math.random()*3+.5:.2;
      pct=Math.min(pct,95); fill.style.width=pct+"%";
    },200);
  }
  function hideProgress(){
    const bar=_id("app-progress"),fill=_id("app-progress-fill");
    if(!bar||!fill)return;
    clearInterval(_pTimer); fill.style.width="100%";
    setTimeout(()=>{ bar.classList.add("hidden"); fill.style.width="0%"; },400);
  }

  /* ── TOAST SYSTEM ──────────────────────────────────── */
  const TOAST_DUR=4500, TOAST_MAX=5;
  const _toasts=[];
  const _SVG={
    success:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    warning:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
    info:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1.2" fill="currentColor" stroke="none"/></svg>'
  };

  function toast(title, message, type="info", duration=TOAST_DUR){
    const container=_id("toast-container"); if(!container)return;
    while(_toasts.length>=TOAST_MAX) _dismiss(_toasts.shift());
    const el=document.createElement("div");
    el.className=`toast toast-${type}`;
    el.setAttribute("role","alert");
    el.innerHTML=`
      <div class="toast-icon-wrap">${_SVG[type]||_SVG.info}</div>
      <div class="toast-body">
        <div class="toast-title">${_esc(title)}</div>
        ${message?`<div class="toast-message">${_esc(message)}</div>`:""}
      </div>
      <button class="toast-close" aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      ${duration>0?`<div class="toast-progress-bar" style="animation-duration:${duration}ms"></div>`:""}
    `;
    el.querySelector(".toast-close").addEventListener("click",()=>_dismiss(el));
    if(duration>0){
      let rem=duration, start=Date.now();
      el._t=setTimeout(()=>_dismiss(el),duration);
      el.addEventListener("mouseenter",()=>{
        clearTimeout(el._t); rem-=Date.now()-start;
        el.querySelector(".toast-progress-bar")?.style.setProperty("animation-play-state","paused");
      });
      el.addEventListener("mouseleave",()=>{
        start=Date.now();
        el._t=setTimeout(()=>_dismiss(el),Math.max(rem,0));
        el.querySelector(".toast-progress-bar")?.style.setProperty("animation-play-state","running");
      });
    }
    container.appendChild(el); _toasts.push(el); return el;
  }
  function _dismiss(el){
    if(!el||!el.parentNode)return;
    clearTimeout(el._t); el.classList.add("toast-exit");
    setTimeout(()=>{ el.parentNode?.removeChild(el); const i=_toasts.indexOf(el); if(i>-1)_toasts.splice(i,1); },300);
  }

  /* ── KEYBOARD SHORTCUTS ────────────────────────────── */
  const NAV_MAP={"1":"overview","2":"team","3":"members","4":"customer","5":"closed","6":"performance","7":"weekly-tracker","8":"knowledge-hub","9":"investigate"};
  const NAV_LBL={overview:"Overview",team:"Team Cases",members:"Member Dashboard",customer:"Customer Cases",closed:"Closed Cases",performance:"Performance","weekly-tracker":"Weekly Tracker","knowledge-hub":"Knowledge Hub",investigate:"Case Investigation"};

  function _initKB(){
    document.addEventListener("keydown",e=>{
      const cmdOpen  = _id("cmd-palette-overlay")&&!_id("cmd-palette-overlay").classList.contains("hidden");
      const kbOpen   = _id("kb-shortcuts-overlay")&&!_id("kb-shortcuts-overlay").classList.contains("hidden");
      const modOpen  = _id("modal-overlay")&&!_id("modal-overlay").classList.contains("hidden");
      if(e.key==="Escape"){
        if(cmdOpen){_closeCmd();return;}
        if(kbOpen){_id("kb-shortcuts-overlay").classList.add("hidden");return;}
        if(modOpen){_id("modal-close")?.click();return;}
        const ai=_id("ai-chat-panel");
        if(ai&&!ai.classList.contains("hidden")){_id("ai-chat-close")?.click();return;}
        if(_isInput())document.activeElement.blur();
        return;
      }
      if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();_toggleCmd();return;}
      if(_isInput())return;
      if(modOpen||kbOpen)return;
      if(e.key==="?"||( e.shiftKey&&e.key==="/")){e.preventDefault();_id("kb-shortcuts-overlay")?.classList.toggle("hidden");return;}
      if(e.key==="/"){e.preventDefault();const gs=_id("global-search");if(gs){gs.focus();gs.select();}return;}
      if(e.key==="a"||e.key==="A"){_id("float-ai-btn")?.click();return;}
      const tab=NAV_MAP[e.key];
      if(tab&&typeof App!=="undefined"){e.preventDefault();App.renderTab(tab);toast("Navigated",NAV_LBL[tab]||tab,"info",1800);}
    });
  }
  function _initKBModal(){
    const ov=_id("kb-shortcuts-overlay");
    _id("kb-shortcuts-close")?.addEventListener("click",()=>ov?.classList.add("hidden"));
    ov?.addEventListener("click",e=>{if(e.target===ov)ov.classList.add("hidden");});
    _id("header-shortcut-hint")?.addEventListener("click",()=>ov?.classList.toggle("hidden"));
  }

  /* ── COMMAND PALETTE ───────────────────────────────── */
  const CMDS=[
    {id:"overview",       label:"Overview Dashboard",       icon:"⊞", group:"Navigate", nav:"overview"},
    {id:"team",           label:"Team Cases",               icon:"👥",group:"Navigate", nav:"team"},
    {id:"members",        label:"Member Dashboard",         icon:"👤",group:"Navigate", nav:"members"},
    {id:"customer",       label:"Customer Cases",           icon:"🏢",group:"Navigate", nav:"customer"},
    {id:"closed",         label:"Closed Cases",             icon:"✓", group:"Navigate", nav:"closed"},
    {id:"performance",    label:"Performance Analytics",    icon:"⚡",group:"Navigate", nav:"performance"},
    {id:"weekly-tracker", label:"Weekly Tracker",           icon:"📅",group:"Navigate", nav:"weekly-tracker"},
    {id:"knowledge-hub",  label:"Knowledge Hub",            icon:"★", group:"Navigate", nav:"knowledge-hub"},
    {id:"investigate",    label:"Case Investigation",       icon:"🔍",group:"Navigate", nav:"investigate"},
    {id:"copilot",        label:"AI Copilot",               icon:"🤖",group:"Navigate", nav:"copilot"},
    {id:"intelligence",   label:"Support Intelligence",     icon:"📊",group:"Navigate", nav:"intelligence"},
    {id:"info",           label:"Information & Help",       icon:"ℹ", group:"Navigate", nav:"info"},
    {id:"changelog",      label:"Version History",          icon:"📋",group:"Navigate", nav:"changelog"},
    {id:"search",         label:"Focus Search Bar",         icon:"/", group:"Actions",  fn:"search"},
    {id:"ai-open",        label:"Open AI Assistant",        icon:"✦", group:"Actions",  fn:"ai"},
    {id:"reload",         label:"Reload Data File",         icon:"↻", group:"Actions",  fn:"reload"},
    {id:"ibm-case",       label:"Open New IBM Case",        icon:"⊕", group:"Actions",  fn:"ibmcase"},
    {id:"shortcuts",      label:"Keyboard Shortcuts Help",  icon:"⌨", group:"Help",     fn:"shortcuts"}
  ];
  let _cmdIdx=0;

  function _execCmd(item){
    _closeCmd();
    if(item.nav&&typeof App!=="undefined"){App.renderTab(item.nav);return;}
    ({
      search:  ()=>{const s=_id("global-search");if(s){s.focus();s.select();}},
      ai:      ()=>_id("float-ai-btn")?.click(),
      reload:  ()=>_id("reload-input")?.click(),
      ibmcase: ()=>window.open("https://www.ibm.com/mysupport/s/createrecord/NewCase","_blank"),
      shortcuts:()=>_id("kb-shortcuts-overlay")?.classList.remove("hidden")
    })[item.fn]?.();
  }

  function _toggleCmd(){
    const ov=_id("cmd-palette-overlay"); if(!ov)return;
    if(!ov.classList.contains("hidden")){_closeCmd();}
    else{ov.classList.remove("hidden");const i=_id("cmd-palette-input");if(i){i.value="";i.focus();}_renderCmd("");}
  }
  function _closeCmd(){ _id("cmd-palette-overlay")?.classList.add("hidden"); }

  function _renderCmd(q){
    const list=_id("cmd-palette-list"); if(!list)return;
    const lq=q.toLowerCase().trim();
    const items=lq?CMDS.filter(it=>it.label.toLowerCase().includes(lq)||it.group.toLowerCase().includes(lq)):CMDS;
    if(!items.length){list.innerHTML=`<div class="cmd-empty">No results for &ldquo;${_esc(q)}&rdquo;</div>`;_cmdIdx=0;return;}
    const groups={};
    items.forEach(it=>{(groups[it.group]=groups[it.group]||[]).push(it);});
    let html="",idx=0;
    Object.keys(groups).forEach(g=>{
      html+=`<div class="cmd-group-label">${_esc(g)}</div>`;
      groups[g].forEach(it=>{
        const lbl=lq?_hlCmd(it.label,lq):_esc(it.label);
        html+=`<button class="cmd-item${idx===0?" cmd-item-active":""}" data-idx="${idx}" data-id="${_esc(it.id)}">
          <span class="cmd-item-icon">${it.icon}</span>
          <span class="cmd-item-label">${lbl}</span>
          <span class="cmd-item-group">${_esc(it.group)}</span>
        </button>`;
        idx++;
      });
    });
    list.innerHTML=html; _cmdIdx=0;
    list.querySelectorAll(".cmd-item").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const item=CMDS.find(it=>it.id===btn.dataset.id);
        if(item)_execCmd(item);
      });
      btn.addEventListener("mouseenter",()=>{
        _cmdIdx=parseInt(btn.dataset.idx)||0;
        list.querySelectorAll(".cmd-item").forEach((b,i)=>b.classList.toggle("cmd-item-active",i===_cmdIdx));
      });
    });
  }
  function _hlCmd(text,q){
    const i=text.toLowerCase().indexOf(q); if(i<0)return _esc(text);
    return _esc(text.slice(0,i))+`<mark class="cmd-hl">${_esc(text.slice(i,i+q.length))}</mark>`+_esc(text.slice(i+q.length));
  }
  function _initCmd(){
    const ov=_id("cmd-palette-overlay"),inp=_id("cmd-palette-input"),list=_id("cmd-palette-list");
    if(!ov||!inp||!list)return;
    ov.addEventListener("click",e=>{if(e.target===ov)_closeCmd();});
    inp.addEventListener("input",()=>_renderCmd(inp.value));
    inp.addEventListener("keydown",e=>{
      const btns=[...list.querySelectorAll(".cmd-item")]; if(!btns.length)return;
      if(e.key==="ArrowDown"){e.preventDefault();_cmdIdx=Math.min(_cmdIdx+1,btns.length-1);}
      else if(e.key==="ArrowUp"){e.preventDefault();_cmdIdx=Math.max(_cmdIdx-1,0);}
      else if(e.key==="Enter"){e.preventDefault();btns[_cmdIdx]?.click();return;}
      else return;
      btns.forEach((b,i)=>b.classList.toggle("cmd-item-active",i===_cmdIdx));
      btns[_cmdIdx]?.scrollIntoView({block:"nearest"});
    });
    _id("header-cmd-hint")?.addEventListener("click",_toggleCmd);
  }

  /* ── STATUS BAR ────────────────────────────────────── */
  function updateStatusBar(){
    const bar=_id("v6-status-bar"); if(!bar)return;
    let total=0,open=0,sev1=0;
    let topCreator="",topCreatorCount=0,topCloser="",topCloserCount=0;
    const currentYear=new Date().getFullYear();
    try{
      if(typeof Data!=="undefined"&&Data.allCases){
        const all=Data.allCases(); total=all.length;
        const creatorStats={};
        const closerStats={};
        all.forEach(r=>{
          const closed=(r.Status||"").toLowerCase().includes("closed");
          if(!closed){open++;if(String(r.Severity||"").startsWith("1"))sev1++;}
          if(typeof Data.isTeamOwner==="function"&&Data.isTeamOwner(r.Owner)){
            const o=r.Owner||"?";
            // Creator: count cases whose created date is in current year
            const createdStr=r.Created||r.created||"";
            const createdYear=createdStr?new Date(createdStr).getFullYear():null;
            if(createdYear===currentYear){
              if(!creatorStats[o])creatorStats[o]=0;
              creatorStats[o]++;
            }
            // Closer: count cases whose closedDate is in current year
            if(closed){
              const closedStr=r["Closed Date"]||r.ClosedDate||r.closedDate||"";
              const closedYear=closedStr?new Date(closedStr).getFullYear():null;
              if(closedYear===currentYear){
                if(!closerStats[o])closerStats[o]=0;
                closerStats[o]++;
              }
            }
          }
        });
        Object.entries(creatorStats).forEach(([o,cnt])=>{
          if(cnt>topCreatorCount){topCreatorCount=cnt;topCreator=typeof Utils!=="undefined"?Utils.shortName(o):o;}
        });
        Object.entries(closerStats).forEach(([o,cnt])=>{
          if(cnt>topCloserCount){topCloserCount=cnt;topCloser=typeof Utils!=="undefined"?Utils.shortName(o):o;}
        });
      }
    }catch(e){}
    if(!total){bar.classList.add("hidden");return;}
    bar.classList.remove("hidden");
    const now=new Date();const t=now.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" "+now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
    const sev1H=sev1?`<span class="sb-sep">·</span><span class="sb-item sb-critical"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg> <strong>${sev1}</strong> Sev 1</span>`:"";
    const creatorH=topCreator?`<span class="sb-sep">·</span><span class="sb-item"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="c-purple"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg> <strong>${_esc(topCreator)}</strong> Top Case Creator (${topCreatorCount})</span>`:"";
    const closerH=topCloser?`<span class="sb-sep">·</span><span class="sb-item"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="c-green"><polyline points="20 6 9 17 4 12"/></svg> <strong>${_esc(topCloser)}</strong> Top Case Closer (${topCloserCount})</span>`:"";
    bar.innerHTML=`
      <div class="sb-left">
        <span class="sb-dot"></span>
        ${creatorH}
        ${closerH}
        ${sev1H}
      </div>
      <div class="sb-right">
        <span class="sb-item sb-dim">Updated ${t}</span>
        <span class="sb-sep">·</span>
        <span class="sb-item sb-dim">Dev: Kabelesh K</span>
        <span class="sb-sep">·</span>
        <span class="sb-item sb-dim">IBM Case Intelligence</span>
        <span class="sb-sep">·</span>
        <span class="sb-version">${(typeof AppVersion!=="undefined"?AppVersion.version:"v8.0.3")}</span>
      </div>`;
  }

  /* ── TOOLTIPS ──────────────────────────────────────── */
  let _tipEl=null, _tipT=null;
  function _initTooltips(){
    _tipEl=document.createElement("div"); _tipEl.className="v6-tooltip"; document.body.appendChild(_tipEl);
    document.addEventListener("mouseover",e=>{
      const t=e.target?.closest?.("[data-tip]");
      if(!t){_hideTip();return;}
      clearTimeout(_tipT);
      _tipT=setTimeout(()=>{
        _tipEl.textContent=t.dataset.tip; _tipEl.classList.add("visible");
        const r=t.getBoundingClientRect(),tt=_tipEl.getBoundingClientRect();
        let top=r.top-tt.height-8+scrollY, left=r.left+r.width/2-tt.width/2+scrollX;
        left=Math.max(8,Math.min(left,innerWidth-tt.width-8));
        _tipEl.style.cssText=`top:${top}px;left:${left}px`;
      },450);
    });
    document.addEventListener("mouseout",e=>{if(e.target?.closest?.("[data-tip]")){clearTimeout(_tipT);_hideTip();}});
    document.addEventListener("scroll",_hideTip,{passive:true,capture:true});
  }
  function _hideTip(){clearTimeout(_tipT);_tipEl?.classList.remove("visible");}

  /* ── STICKY HEADER ─────────────────────────────────── */
  function _initStickyHdr(){
    const c=_$(".main-content"),h=_$(".top-header");
    if(!c||!h)return;
    c.addEventListener("scroll",()=>h.classList.toggle("header-scrolled",c.scrollTop>4),{passive:true});
  }

  /* ── BACK TO TOP ───────────────────────────────────── */
  function _initBackToTop(){
    const btn=_id("v6-back-to-top"),c=_$(".main-content");
    if(!btn||!c)return;
    c.addEventListener("scroll",()=>btn.classList.toggle("visible",c.scrollTop>300),{passive:true});
    btn.addEventListener("click",()=>c.scrollTo({top:0,behavior:"smooth"}));
  }

  /* ── COPY TO CLIPBOARD ─────────────────────────────── */
  function copyToClipboard(text,label){
    const done=()=>toast("Copied",label?`"${label}"`:text,"success",2200);
    navigator.clipboard?.writeText(text).then(done).catch(()=>{
      const ta=document.createElement("textarea");
      ta.value=text; ta.style.cssText="position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(ta); ta.select();
      try{document.execCommand("copy");done();}catch(e){}
      document.body.removeChild(ta);
    });
  }
  function _initCopy(){
    document.addEventListener("click",e=>{
      const el=e.target?.closest?.("[data-copy]");
      if(!el)return;
      copyToClipboard(el.dataset.copy||"",el.dataset.copyLabel||el.dataset.copy||"");
    });
  }

  /* ── WELCOME + STALE ───────────────────────────────── */
  function _welcome(){
    const app=_id("app"); if(!app||app.classList.contains("hidden"))return;
    let total=0,open=0;
    try{if(typeof Data!=="undefined"&&Data.allCases){const a=Data.allCases();total=a.length;a.forEach(r=>{if(!(r.Status||"").toLowerCase().includes("closed"))open++;});}}catch(e){}
    if(total>0)toast("Platform Ready",`${total} cases loaded · ${open} open · Press ? for shortcuts`,"success",5000);
  }
  function checkStaleAlerts(){
    try{
      if(typeof Data==="undefined"||!Data.teamCases)return;
      const stale=Data.teamCases().filter(r=>{
        if((r.Status||"").toLowerCase().includes("closed"))return false;
        try{const d=Utils.parseDate(r.Updated);return d&&Utils.daysDiff(d)>=10;}catch(e){return false;}
      });
      if(stale.length>0)setTimeout(()=>toast(`${stale.length} Stale Case${stale.length>1?"s":""}`,`Not updated in 10+ days — review in Team Cases`,"warning",6000),1200);
    }catch(e){}
  }

  /* ── MISC ──────────────────────────────────────────── */
  function _patchUpload(){
    ["file-input","reload-input"].forEach(id=>{_id(id)?.addEventListener("change",showProgress,{capture:true});});
    _id("dropzone")?.addEventListener("drop",showProgress,{capture:true});
  }
  function _addVersionBadge(){
    // Version badge removed from sidebar as per v7.0.0 update
  }
  function _initPrint(){
    window.addEventListener("beforeprint",()=>document.body.classList.add("print-mode"));
    window.addEventListener("afterprint",()=>document.body.classList.remove("print-mode"));
  }
  function _whatsNew(){
    try{
      if(sessionStorage.getItem("v6_ann"))return;
      sessionStorage.setItem("v6_ann","1");
      setTimeout(()=>toast("Welcome to "+(typeof AppVersion!=="undefined"?AppVersion.version:"v8.0.3"),"Command Center · Operational Alerts · Activity Stream · Enhanced Analytics","info",7000),4200);
    }catch(e){}
  }

  /* ── INIT ──────────────────────────────────────────── */
  function init(){
    _initKB(); _initKBModal(); _initCmd();
    _addVersionBadge(); _patchUpload(); _initCopy(); _initTooltips(); _initPrint();
    const app=_id("app");
    function onVisible(){
      hideProgress(); _initStickyHdr(); _initBackToTop(); updateStatusBar();
      setTimeout(_welcome,700); setTimeout(checkStaleAlerts,2400); _whatsNew();
      setInterval(updateStatusBar,120000);
    }
    if(!app)return;
    if(!app.classList.contains("hidden")){onVisible();}
    else{
      const obs=new MutationObserver(()=>{if(!app.classList.contains("hidden")){obs.disconnect();onVisible();}});
      obs.observe(app,{attributes:true,attributeFilter:["class"]});
    }
  }

  document.readyState==="loading"
    ?document.addEventListener("DOMContentLoaded",init)
    :setTimeout(init,120);

  return {toast,showProgress,hideProgress,checkStaleAlerts,copyToClipboard,updateStatusBar};
})();
