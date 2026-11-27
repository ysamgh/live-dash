const USGS_FEED = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
const NASA_APOD = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
const $ = (selector) => document.querySelector(selector);
const state = { quakes: [], map: null, markers: [], saved: loadSaved(), lastUpdated: null, currentDiscovery: null };
const rabbitHoles = [
  { title: "The hidden infrastructure of the internet", description: "Thousands of kilometres of submarine cables carry most intercontinental data. Explore the physical network beneath our connected world.", url: "https://www.submarinecablemap.com/", label: "Submarine Cable Map" },
  { title: "A different view of the world", description: "Compare the true size of countries and see how map projections can distort our intuition.", url: "https://www.thetruesize.com/", label: "The True Size" },
  { title: "A planet in motion", description: "Explore wind, weather systems and ocean conditions through a living global map.", url: "https://www.windy.com/", label: "Windy" },
  { title: "The scale of everything", description: "Travel from the smallest known scales to the observable universe.", url: "https://htwins.net/scale2/", label: "Scale of the Universe" },
  { title: "A living archive of knowledge", description: "Explore freely accessible books, films, historical documents and software.", url: "https://archive.org/", label: "Internet Archive" },
  { title: "The world through data", description: "Understand long-term changes in health, energy, poverty, population and the environment.", url: "https://ourworldindata.org/", label: "Our World in Data" }
];
function loadSaved(){ try{return JSON.parse(localStorage.getItem("live-dash-saved")||"[]")}catch{return []} }
function saveSaved(){ localStorage.setItem("live-dash-saved",JSON.stringify(state.saved)); $("#saved-count").textContent=state.saved.length; }
function formatTime(value){return new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit",timeZone:"UTC"}).format(new Date(value))+" UTC"}
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]))}
function initMap(){
  if(!window.L){$("#earth-map").innerHTML='<div class="loading-state">Map library unavailable. Live event list is still available.</div>';return}
  state.map=L.map("earth-map",{worldCopyJump:true,scrollWheelZoom:false,zoomControl:true}).setView([22,12],2);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',subdomains:"abcd",maxZoom:19}).addTo(state.map);
}
function renderQuakes(){
  const features=state.quakes;
  $("#quake-total").textContent=features.length.toLocaleString();
  $("#strong-quakes").textContent=features.filter(f=>(f.properties.mag||0)>=4.5).length.toLocaleString();
  $("#event-count").textContent=features.length+" EVENTS";
  const list=features.slice(0,12).map((feature)=>{
    const p=feature.properties, coords=feature.geometry.coordinates, mag=Number(p.mag||0), when=formatTime(p.time);
    return '<article class="event-item"><div class="magnitude '+(mag>=4.5?"high":"")+'">'+mag.toFixed(1)+'</div><div class="event-copy"><b><a href="'+escapeHTML(p.url)+'" target="_blank" rel="noreferrer">'+escapeHTML(p.place||"Location not reported")+'</a></b><small>'+when+' · Depth '+Math.round(coords[2])+' km</small></div></article>';
  }).join("");
  $("#event-list").innerHTML=list||'<div class="loading-state">No events were returned by the feed.</div>';
  if(state.map){
    state.markers.forEach(marker=>marker.remove());state.markers=[];
    features.forEach(feature=>{
      const p=feature.properties,[lon,lat,depth]=feature.geometry.coordinates,mag=Number(p.mag||0);
      const marker=L.circleMarker([lat,lon],{radius:Math.max(4,Math.min(13,4+mag*1.5)),color:mag>=4.5?"#ff9478":"#67dfbd",weight:1,fillColor:mag>=4.5?"#ff9478":"#67dfbd",fillOpacity:.55});
      marker.bindPopup('<b>'+escapeHTML(p.place)+'</b><br>Magnitude '+mag.toFixed(1)+' · '+Math.round(depth)+' km<br><a href="'+escapeHTML(p.url)+'" target="_blank" rel="noreferrer">USGS event details ↗</a>');
      marker.addTo(state.map);state.markers.push(marker);
    });
  }
}
async function loadEarthquakes(){
  try{
    const response=await fetch(USGS_FEED,{cache:"no-store"});if(!response.ok)throw new Error("USGS returned "+response.status);
    const data=await response.json();state.quakes=(data.features||[]).filter(f=>f.geometry&&f.geometry.coordinates).sort((a,b)=>b.properties.time-a.properties.time);
    renderQuakes();state.lastUpdated=new Date();$("#data-status").textContent="Operational";$("#data-status").classList.add("status-live");$("#last-updated").textContent="Updated "+formatTime(state.lastUpdated);
  }catch(error){$("#data-status").textContent="Partial";$("#last-updated").textContent="USGS feed unavailable";$("#event-list").innerHTML='<div class="loading-state">Could not load the USGS feed. Check your connection and try refresh.</div>';console.error(error)}
}
async function loadApod(){
  try{
    const response=await fetch(NASA_APOD);if(!response.ok)throw new Error("NASA APOD returned "+response.status);
    const data=await response.json();$("#space-status").textContent="Available";
    const image=data.media_type==="image"?'<img class="apod-image" src="'+escapeHTML(data.url)+'" alt="'+escapeHTML(data.title)+'" loading="lazy">':'<div class="apod-image"></div>';
    $("#apod-content").innerHTML=image+'<div class="apod-copy"><h3>'+escapeHTML(data.title)+'</h3><p>'+escapeHTML(data.explanation)+'</p><a href="'+escapeHTML(data.hdurl||data.url)+'" target="_blank" rel="noreferrer">View on NASA ↗</a></div>';
  }catch(error){$("#space-status").textContent="Unavailable";$("#apod-content").innerHTML='<div class="loading-state">NASA APOD could not be loaded right now. <a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noreferrer">Visit NASA APOD ↗</a></div>';console.error(error)}
}
function showDiscovery(item){
  state.currentDiscovery=item;
  const alreadySaved=state.saved.some(saved=>saved.url===item.url);
  $("#save-discovery").textContent=alreadySaved?"✓ Saved":"☆ Save discovery";
  $("#save-discovery").disabled=alreadySaved;
  $("#discovery-body").innerHTML='<h2>'+escapeHTML(item.title)+'</h2><p>'+escapeHTML(item.description)+'</p><p><a href="'+escapeHTML(item.url)+'" target="_blank" rel="noreferrer">Explore '+escapeHTML(item.label||"source")+' ↗</a></p>';
  $("#discovery-dialog").showModal();
}
function discover(){
  const choices=[];
  if(state.quakes.length)state.quakes.slice(0,30).forEach(f=>choices.push({title:"A tremor in "+(f.properties.place||"an unknown location"),description:"Magnitude "+Number(f.properties.mag||0).toFixed(1)+" · "+new Date(f.properties.time).toUTCString()+". Explore the event record and seismic context from the United States Geological Survey.",url:f.properties.url,label:"USGS event"}));
  choices.push(...rabbitHoles);
  showDiscovery(choices[Math.floor(Math.random()*choices.length)]);
}
function setView(view){
  document.querySelectorAll(".nav-item[data-view]").forEach(button=>button.classList.toggle("active",button.dataset.view===view));
  const labels={overview:"OVERVIEW",earth:"EARTH",universe:"UNIVERSE",humanity:"HUMANITY",knowledge:"KNOWLEDGE",history:"TIME MACHINE"};
  $("#current-section").textContent=labels[view]||"OVERVIEW";
  const target={overview:".welcome",earth:".content-grid",universe:".apod-panel",humanity:".explore-panel",knowledge:".explore-panel",history:"#source-catalog"}[view];
  if(target)document.querySelector(target).scrollIntoView({behavior:"smooth",block:"start"});
}
function tickClock(){$("#clock").textContent=new Date().toISOString().slice(11,19)+" UTC"}
document.querySelectorAll(".nav-item[data-view]").forEach(button=>button.addEventListener("click",()=>setView(button.dataset.view)));
$("#discover-btn").addEventListener("click",discover);$("#discover-again").addEventListener("click",discover);$("#dialog-close").addEventListener("click",()=>$("#discovery-dialog").close());
$("#random-source-btn").addEventListener("click",()=>{const item=rabbitHoles[Math.floor(Math.random()*rabbitHoles.length)];showDiscovery(item)});
$("#refresh-btn").addEventListener("click",()=>{loadEarthquakes();loadApod()});
$("#save-discovery").addEventListener("click",()=>{if(!state.currentDiscovery)return;const item=state.currentDiscovery;if(!state.saved.some(saved=>saved.url===item.url)){state.saved.unshift(item);saveSaved();$("#save-discovery").textContent="✓ Saved";$("#save-discovery").disabled=true;}});
$("#saved-nav").addEventListener("click",()=>{if(state.saved.length){const items=state.saved.slice(0,20);$("#discovery-body").innerHTML="<h2>Your saved discoveries</h2>"+items.map((item,index)=>"<p><a href=\""+escapeHTML(item.url)+"\" target=\"_blank\" rel=\"noreferrer\">"+(index+1)+". "+escapeHTML(item.title)+" ↗</a></p>").join("");$("#save-discovery").hidden=true;$("#discovery-dialog").showModal();}else{showDiscovery({title:"Your discovery shelf is empty",description:"Use Surprise me, then save the discoveries you want to revisit.",url:"https://github.com/ysamgh/live-dash",label:"LIVE DASH roadmap"});}});
$("#discovery-dialog").addEventListener("close",()=>{$("#save-discovery").hidden=false});
async function loadSources(){
  const grid=$("#source-grid");
  try{
    const response=await fetch("data/sources.json",{cache:"no-cache"});
    if(!response.ok)throw new Error("Source registry returned "+response.status);
    state.sources=await response.json();
    const categories=[...new Set(state.sources.map(item=>item.category))].sort();
    $("#source-category").innerHTML='<option value="all">All categories</option>'+categories.map(category=>'<option value="'+escapeHTML(category)+'">'+escapeHTML(category)+'</option>').join("");
    renderSources();
  }catch(error){
    grid.innerHTML='<div class="loading-state">The source catalog is unavailable. <button class="text-button" id="retry-sources">Try again</button></div>';
    const retry=$("#retry-sources");if(retry)retry.addEventListener("click",loadSources);
    console.error(error);
  }
}
function renderSources(){
  const query=$("#source-search").value.trim().toLowerCase();
  const category=$("#source-category").value;
  const access=$("#source-access").value;
  const filtered=(state.sources||[]).filter(item=>{
    const matchesQuery=!query||(item.name+" "+item.category+" "+item.id).toLowerCase().includes(query);
    return matchesQuery&&(category==="all"||item.category===category)&&(access==="all"||item.access===access);
  });
  $("#source-count").textContent=filtered.length+" / "+(state.sources||[]).length+" SOURCES";
  const labels={"api-integrated":"Integrated API","api-review":"API review","terms-review":"Terms review","outbound":"External destination","map-provider":"Map provider"};
  $("#source-grid").innerHTML=filtered.length?filtered.map(item=>'<article class="source-card"><div class="source-card-top"><span class="source-category">'+escapeHTML(item.category)+'</span><span class="access-label access-'+escapeHTML(item.access)+'">'+escapeHTML(labels[item.access]||item.access)+'</span></div><h3>'+escapeHTML(item.name)+'</h3><a href="'+escapeHTML(item.url)+'" target="_blank" rel="noopener noreferrer">Open source ↗</a></article>').join(""):'<div class="loading-state source-empty">No sources match these filters. Try another search.</div>';
}
$("#source-search").addEventListener("input",renderSources);
$("#source-category").addEventListener("change",renderSources);
$("#source-access").addEventListener("change",renderSources);
tickClock();setInterval(tickClock,1000);initMap();loadEarthquakes();loadApod();loadSources();saveSaved();
