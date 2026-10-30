A2Z SONG WEBSITE — SETUP (Malayalam)

ഈ ZIP-ൽ ഉള്ളത്:
- index.html       : Public Home Page (എല്ലാ songs-ഉം ഇവിടെ)
- admin.html       : Admin login + song add/edit/delete
- style.css        : Mobile/Desktop design
- app.js           : Home page player, search, download
- admin.js         : Admin functions
- config.js        : Supabase settings ചേർക്കേണ്ട ഫയൽ
- supabase-setup.sql : Database table + security policies

പ്രധാനമായി:
GitHub Pages static hosting ആണ്. അതിനാൽ Admin login, songs list എന്നിവയ്ക്ക് Supabase backend ചേർത്തിട്ടുണ്ട്.
MP3 ഫയലുകൾ Cloudflare R2-ൽ തന്നെ സൂക്ഷിക്കാം. Admin panel-ൽ R2 public MP3 URL paste ചെയ്താൽ മതി.
R2 secret key / access key ഒരിക്കലും HTML/JS-ൽ ഇടരുത്.

STEP 1 — Supabase തയ്യാറാക്കുക
1. https://supabase.com ൽ project ഉണ്ടാക്കുക.
2. Project → SQL Editor തുറക്കുക.
3. supabase-setup.sql ഫയലിലെ മുഴുവൻ SQL paste ചെയ്ത് Run ചെയ്യുക.
4. Authentication → Providers / Sign-in settings ൽ Email sign-in enable ആണെന്ന് ഉറപ്പാക്കുക.
5. Authentication settings-ൽ public sign-ups disable ചെയ്യുക.
6. Authentication → Users → Add user വഴി നിങ്ങളുടെ admin email/password ഉണ്ടാക്കുക.
   (ആവശ്യമെങ്കിൽ email confirm ചെയ്യുക.)
7. Project Settings → API ൽ Project URL, anon/public key copy ചെയ്യുക.

STEP 2 — config.js മാറ്റുക
config.js തുറന്ന്:
SUPABASE_URL: "..."
SUPABASE_ANON_KEY: "..."
എന്നിടങ്ങളിൽ നിങ്ങളുടെ Supabase Project URL, anon/public key paste ചെയ്ത് Save ചെയ്യുക.
service_role key ഉപയോഗിക്കരുത്.

STEP 3 — GitHub Pages
1. GitHub-ൽ പുതിയ repository ഉണ്ടാക്കുക (ഉദാ: a2z-song).
2. ഈ ZIP extract ചെയ്ത് എല്ലാ ഫയലുകളും repository-യുടെ root-ൽ upload ചെയ്യുക.
3. Commit changes ചെയ്യുക.
4. Repository → Settings → Pages തുറക്കുക.
5. Deploy from a branch → main → /(root) → Save.
6. GitHub Pages URL ലഭിച്ചാൽ തുറന്ന് website പരിശോധിക്കുക.
Home: https://YOUR-USERNAME.github.io/a2z-song/
Admin: https://YOUR-USERNAME.github.io/a2z-song/admin.html

STEP 4 — Songs ചേർക്കുക
1. Admin URL തുറക്കുക.
2. Supabase-ൽ ഉണ്ടാക്കിയ admin email/password ഉപയോഗിച്ച് sign in ചെയ്യുക.
3. Song title, singer, album, year എന്നിവ നൽകുക.
4. Cover image URL optional ആണ്.
5. Cloudflare R2-ൽ നിന്ന് MP3 public URL copy ചെയ്ത് R2 MP3 URL box-ൽ paste ചെയ്യുക.
6. Save song അമർത്തുക. Home page-ൽ song വരും.
Edit/Delete ബട്ടണുകളും admin-ൽ ലഭിക്കും.

CLOUDFLARE R2 കുറിപ്പ്
- R2 bucket public access / custom domain അല്ലെങ്കിൽ public URL ശരിയായി configure ചെയ്തിരിക്കണം.
- MP3 URL browser-ൽ തുറക്കുമ്പോൾ audio ലഭിക്കണം.
- Download നിർബന്ധമായി നേരിട്ട് നടക്കാൻ Worker വഴി Content-Disposition: attachment; filename="song.mp3" header നൽകാം.
- Cross-origin link-ൽ HTML download attribute മാത്രം എല്ലാ browser-ലും ഉറപ്പായി പ്രവർത്തിക്കില്ല. R2/Worker response headers ആണ് നിർണായകം.
- നിങ്ങളുടെ R2 link-ന് ആവശ്യമായ CORS configuration കൂടി ചെയ്യുക.

SECURITY
ഈ starter-ൽ sign-in ചെയ്ത Supabase users-ന് songs add/edit/delete permission ഉണ്ട്.
അതുകൊണ്ട് public sign-ups disable ചെയ്ത് admin user നിങ്ങൾ തന്നെ സൃഷ്ടിക്കുക. കൂടുതൽ കർശനമായ multi-admin role control വേണമെങ്കിൽ പിന്നീട് admin role table/policies ചേർക്കാം.
GitHub repository public ആണെങ്കിൽ config.js-ലെ anon key കാണാം; അത് public client key ആണ്. RLS policies ആണ് യഥാർത്ഥ സംരക്ഷണം നൽകുന്നത്. service_role key ഒരിക്കലും publish ചെയ്യരുത്.

പ്രശ്നമുണ്ടെങ്കിൽ GitHub Pages URL, Supabase setup ഘട്ടം, error screenshot എന്നിവ അയയ്ക്കുക.
