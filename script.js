const target = new Date("2026-12-26T20:00:00+02:00").getTime();
function tick(){
  const now=Date.now(), diff=Math.max(0,target-now);
  const d=Math.floor(diff/86400000), h=Math.floor(diff%86400000/3600000), m=Math.floor(diff%3600000/60000), s=Math.floor(diff%60000/1000);
  document.getElementById("days").textContent=String(d).padStart(2,"0");
  document.getElementById("hours").textContent=String(h).padStart(2,"0");
  document.getElementById("mins").textContent=String(m).padStart(2,"0");
  document.getElementById("secs").textContent=String(s).padStart(2,"0");
}
tick(); setInterval(tick,1000);
