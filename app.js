(() => {
  const cfg = window.A2Z_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("PASTE_") && !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  const list = document.getElementById("song-list");
  const audio = document.getElementById("audio");
  const bar = document.getElementById("player-bar");
  let songs = [], current = -1, filtered = [];

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmt = n => { if (!Number.isFinite(n)) return "0:00"; const m=Math.floor(n/60), s=Math.floor(n%60); return `${m}:${String(s).padStart(2,"0")}`; };
  const client = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

  function render(items) {
    filtered = items;
    document.getElementById("song-count").textContent = items.length;
    if (!items.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">♫</div><h3>No songs found</h3><p>Try another search, or add songs in the admin panel.</p></div>`;
      return;
    }
    list.innerHTML = items.map((s,i) => `
      <article class="song-card">
        <button class="cover-button" data-play="${i}" aria-label="Play ${esc(s.title)}">
          ${s.cover_url ? `<img src="${esc(s.cover_url)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">` : ""}
          <span class="cover-fallback" ${s.cover_url ? 'style="display:none"' : ""}>♫</span><span class="cover-play">▶</span>
        </button>
        <div class="song-info"><b>${esc(s.title)}</b><span>${esc([s.artist,s.album,s.year].filter(Boolean).join(" · ") || "A2Z Song")}</span></div>
        <button class="icon-button play-button" data-play="${i}" aria-label="Play song">▶</button>
        <a class="icon-button download-button" href="${esc(s.audio_url)}" target="_blank" rel="noopener" download aria-label="Download song" title="Download">↓</a>
      </article>`).join("");
  }

  async function loadSongs() {
    if (!client) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">♫</div><h3>Connect your song library</h3><p>Set up Supabase and add your project details in <code>config.js</code>. Then add songs from <a href="admin.html">Admin</a>.</p></div>`;
      return;
    }
    const {data,error} = await client.from("songs").select("*").order("created_at",{ascending:false});
    if (error) { list.innerHTML = `<div class="empty-state"><h3>Could not load songs</h3><p>${esc(error.message)}</p></div>`; return; }
    songs = data || []; render(songs);
  }

  function play(index) {
    if (!filtered[index]) return;
    const s = filtered[index]; current = songs.findIndex(x => x.id === s.id);
    audio.src = s.audio_url; audio.play().catch(() => {});
    bar.hidden = false;
    document.getElementById("now-title").textContent = s.title;
    document.getElementById("now-artist").textContent = s.artist || s.album || "A2Z Song";
    document.getElementById("toggle-play").textContent = "Ⅱ";
  }
  list.addEventListener("click", e => { const b=e.target.closest("[data-play]"); if(b) play(Number(b.dataset.play)); });
  document.getElementById("search").addEventListener("input", e => {
    const q=e.target.value.toLowerCase().trim();
    render(songs.filter(s => [s.title,s.artist,s.album,String(s.year||"")].join(" ").toLowerCase().includes(q)));
  });
  document.getElementById("toggle-play").addEventListener("click", () => { if(audio.paused) audio.play(); else audio.pause(); });
  document.getElementById("next").addEventListener("click", () => { if(songs.length) { const n=(current+1)%songs.length; const s=songs[n]; render(songs); play(n); } });
  document.getElementById("prev").addEventListener("click", () => { if(songs.length) { const n=(current-1+songs.length)%songs.length; render(songs); play(n); } });
  audio.addEventListener("ended", () => { if(songs.length) { const n=(current+1)%songs.length; render(songs); play(n); } });
  audio.addEventListener("play", () => document.getElementById("toggle-play").textContent="Ⅱ");
  audio.addEventListener("pause", () => document.getElementById("toggle-play").textContent="▶");
  audio.addEventListener("loadedmetadata", () => document.getElementById("duration").textContent=fmt(audio.duration));
  audio.addEventListener("timeupdate", () => {
    document.getElementById("current-time").textContent=fmt(audio.currentTime);
    document.getElementById("seek").value=audio.duration ? audio.currentTime/audio.duration*100 : 0;
  });
  document.getElementById("seek").addEventListener("input", e => { if(audio.duration) audio.currentTime=audio.duration*Number(e.target.value)/100; });
  loadSongs();
})();
