(() => {
  const cfg=window.A2Z_CONFIG||{};
  const configured=cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("PASTE_") && !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  const $=id=>document.getElementById(id);
  const loginPanel=$("login-panel"), dashboard=$("dashboard");
  const client=configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY) : null;
  let rows=[];
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function message(id,text,isError=false){$(id).textContent=text;$(id).className="form-message "+(isError?"error":"success");}
  function setSignedIn(user){loginPanel.hidden=!!user;dashboard.hidden=!user;}
  async function refresh(){
    const {data,error}=await client.from("songs").select("*").order("created_at",{ascending:false});
    if(error){$("admin-song-list").textContent=error.message;return;}
    rows=data||[];$("admin-count").textContent=rows.length;
    $("admin-song-list").innerHTML=rows.length?rows.map(s=>`<div class="admin-song-row"><div class="admin-song-name"><b>${esc(s.title)}</b><span>${esc(s.artist||s.album||s.audio_url)}</span></div><button class="outline-button small" data-edit="${s.id}">Edit</button><button class="danger-button small" data-delete="${s.id}">Delete</button></div>`).join(""):`<p class="muted">No songs yet. Add your first song above.</p>`;
  }
  function resetForm(){ $("song-form").reset();$("song-id").value="";$("form-heading").textContent="Add a new song";$("save-song").textContent="Save song";$("cancel-edit").hidden=true; }
  $("login-form").addEventListener("submit",async e=>{
    e.preventDefault(); if(!client){message("login-message","Please configure Supabase in config.js first.",true);return;}
    const {error}=await client.auth.signInWithPassword({email:$("email").value,password:$("password").value});
    if(error) message("login-message",error.message,true);
  });
  $("logout").addEventListener("click",()=>client.auth.signOut());
  $("song-form").addEventListener("submit",async e=>{
    e.preventDefault();const id=$("song-id").value;
    const payload={title:$("title").value.trim(),artist:$("artist").value.trim(),album:$("album").value.trim(),year:$("year").value?Number($("year").value):null,cover_url:$("cover").value.trim()||null,audio_url:$("audio_url").value.trim()};
    const result=id?await client.from("songs").update(payload).eq("id",id):await client.from("songs").insert(payload);
    if(result.error){message("song-message",result.error.message,true);return;}
    message("song-message",id?"Song updated.":"Song added successfully.");resetForm();refresh();
  });
  $("cancel-edit").addEventListener("click",resetForm);
  $("admin-song-list").addEventListener("click",async e=>{
    const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");
    if(edit){const s=rows.find(x=>x.id===edit.dataset.edit);if(!s)return;
      $("song-id").value=s.id;$("title").value=s.title;$("artist").value=s.artist||"";$("album").value=s.album||"";$("year").value=s.year||"";$("cover").value=s.cover_url||"";$("audio_url").value=s.audio_url;
      $("form-heading").textContent="Edit song";$("save-song").textContent="Update song";$("cancel-edit").hidden=false;window.scrollTo({top:0,behavior:"smooth"});
    }
    if(del && confirm("Delete this song from the website?")){const {error}=await client.from("songs").delete().eq("id",del.dataset.delete);if(error)message("song-message",error.message,true);else{message("song-message","Song deleted.");refresh();}}
  });
  if(!client){message("login-message","Setup needed: add your Supabase URL and anon key in config.js.",true);return;}
  client.auth.getSession().then(({data})=>{setSignedIn(data.session?.user||null);if(data.session)refresh();});
  client.auth.onAuthStateChange((_event,session)=>{setSignedIn(session?.user||null);if(session)refresh();});
})();
