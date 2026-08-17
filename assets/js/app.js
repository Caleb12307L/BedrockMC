function card(x){return `<a class="card" href="content/${x.id}.html"><div class="thumb"><img src="${x.image}" alt=""><span>${x.tag}</span></div><div class="card-body"><h3>${x.title}</h3><p>${x.desc}</p><div class="meta"><span>Bedrock ${x.version}</span><span>↓ ${fmt(x.downloads)}</span></div></div></a>`}
function fmt(n){return n>=1000?(n/1000).toFixed(1)+'K':n}
function render(list,id){const el=document.getElementById(id);if(el)el.innerHTML=list.length?list.map(card).join(''):'<div class="empty">No encontramos contenido con esos filtros.</div>'}
function goSearch(){location.href='catalogo.html?q='+encodeURIComponent(document.getElementById('homeSearch').value)}
if(document.getElementById('featured')) render(CONTENT.slice(0,4),'featured');
if(document.getElementById('results')){
 const p=new URLSearchParams(location.search); document.getElementById('search').value=p.get('q')||''; document.getElementById('category').value=p.get('cat')||'';
 const update=()=>{let q=document.getElementById('search').value.toLowerCase(),c=document.getElementById('category').value,v=document.getElementById('version').value,s=document.getElementById('sort').value;let a=CONTENT.filter(x=>(!q||(`${x.title} ${x.desc} ${x.tag}`).toLowerCase().includes(q))&&(!c||x.category===c)&&(!v||x.version===v));if(s==='popular')a.sort((x,y)=>y.downloads-x.downloads);render(a,'results')};['search','category','version','sort'].forEach(id=>document.getElementById(id).addEventListener('input',update));update();}
