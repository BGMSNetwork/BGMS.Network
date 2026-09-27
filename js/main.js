const SERVER = 'play.bgms-network.ru';
const $ = (s) => document.querySelector(s);
const toast = (text) => { const el=$('#toast'); if(!el)return; el.textContent=text; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),1800); };

async function copyIP(){
  try{
    await navigator.clipboard.writeText(SERVER);
    toast('IP скопирован: '+SERVER);
  }catch(e){
    const t=document.createElement('textarea');
    t.value=SERVER; document.body.appendChild(t); t.select();
    document.execCommand('copy'); t.remove();
    toast('IP скопирован: '+SERVER);
  }
}

function setProgress(id, online, max){
  const el=$(id);
  if(!el)return;
  const percent=max>0 ? Math.min(100, Math.max(2,(online/max)*100)) : 2;
  el.style.width=percent+'%';
}

async function status(){
  try{
    const r=await fetch('https://api.mcsrvstat.us/3/'+SERVER,{cache:'no-store'});
    const d=await r.json();
    const online=d.online ? (d.players?.online||0) : 0;
    const max=d.players?.max||100;
    const value=d.online ? online : 0;

    if($('#heroOnline')) $('#heroOnline').textContent=d.online ? online+' / '+max : 'Офлайн';
    if($('#statOnline')) $('#statOnline').textContent=d.online ? online : '0';
    if($('#serverPlayers')) $('#serverPlayers').textContent=d.online ? online : '0';
    if($('#networkOnline')) $('#networkOnline').textContent=d.online ? online.toLocaleString('ru-RU') : '0';
    if($('#networkMainPlayers')) $('#networkMainPlayers').textContent=d.online ? online.toLocaleString('ru-RU') : '0';
    if($('#networkMiniPlayers')) $('#networkMiniPlayers').textContent=d.online ? online : '0';
    setProgress('#mainProgress',value,max);
    setProgress('#miniProgress',value,max);

    if($('#recordToday')) $('#recordToday').textContent='—';
    if($('#recordAll')) $('#recordAll').textContent='—';
  }catch(e){
    ['#heroOnline','#statOnline','#serverPlayers','#networkOnline','#networkMainPlayers','#networkMiniPlayers'].forEach(sel=>{
      const el=$(sel); if(el) el.textContent=sel==='#heroOnline'?'—':'0';
    });
    setProgress('#mainProgress',0,100);
    setProgress('#miniProgress',0,100);
  }
}

function menu(){
  const b=$('#burger'),n=$('#nav');
  if(!b||!n)return;
  b.onclick=()=>n.classList.toggle('open');
  n.querySelectorAll('a').forEach(a=>a.onclick=()=>n.classList.remove('open'));
}

window.addEventListener('scroll',()=>$('#topbar')?.classList.toggle('scrolled',scrollY>20));

document.addEventListener('DOMContentLoaded',()=>{
  status();
  setInterval(status,60000);
  menu();
  $('#copyIp')?.addEventListener('click',copyIP);
  $('#joinServer')?.addEventListener('click',copyIP);
  $('#networkJoin')?.addEventListener('click',copyIP);
});
