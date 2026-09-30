/* Keep old bookmarks working. Redirect only when Firebase has the complete release. */
(async function () {
  if(location.hostname!=='bsutad.github.io')return;
  const prefix='/Advisory-Board';
  if(location.pathname!==prefix&&!location.pathname.startsWith(prefix+'/'))return;
  const origin='https://tad-advisory-board.web.app';
  try {
    const response=await fetch(origin+'/migration-ready.json',{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(4000)});
    if(!response.ok)return;
    const ready=await response.json();
    if(ready.site!=='tad-advisory-board'||ready.version!==1)return;
    const target=new URL(origin);
    target.pathname=location.pathname.slice(prefix.length)||'/';
    target.search=location.search;
    target.hash=location.hash;
    // Retain an invitation already started in this tab on the old domain.
    if(target.pathname==='/account.html'&&!target.hash){
      try {const invitation=sessionStorage.getItem('tad-invite');if(/^[A-Za-z0-9]{20}$/.test(invitation||''))target.hash='invite='+invitation;}catch{}
    }
    location.replace(target.href);
  }catch{/* Leave the existing site working if the new host is unavailable. */}
})();
