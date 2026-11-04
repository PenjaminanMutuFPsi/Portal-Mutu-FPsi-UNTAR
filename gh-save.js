/* Simpan data dashboard langsung ke repositori GitHub (file data/NAMA.json) lewat GitHub API.
   Hanya muncul saat Mode Edit (admin) aktif. Token disimpan di browser admin saja (localStorage "gh_token"). */
(function(){
var REPO="PenjaminanMutuFPsi/Portal-Mutu-FPsi-UNTAR",BR="main";
try{var h=location.hostname;if(/\.github\.io$/.test(h)){var p=location.pathname.split("/")[1];if(p)REPO=h.split(".")[0]+"/"+p}}catch(e){}
window.GHSave=function(name,get,anchorId){
 var a=document.getElementById(anchorId);if(!a)return;
 var b=document.createElement("button");b.type="button";b.textContent="\u2601 Simpan ke GitHub";b.style.display="none";
 var s=document.createElement("span");s.style.cssText="font-size:12.5px;margin-left:8px";s.setAttribute("role","status");
 a.insertAdjacentElement("afterend",b);b.insertAdjacentElement("afterend",s);
 function adm(){try{return localStorage.getItem("adm_ok")==="1"}catch(e){return false}}
 setInterval(function(){b.style.display=adm()?"":"none";if(!adm())s.textContent=""},400);
 function say(m,bad){s.textContent=m;s.style.color=bad?"#c0392b":"inherit"}
 function tok(){try{return localStorage.getItem("gh_token")}catch(e){return null}}
 var api="https://api.github.com/repos/"+REPO+"/contents/data/"+name+".json";
 function hd(t){return{"Authorization":"Bearer "+t,"Accept":"application/vnd.github+json"}}
 async function put(t,txt){
  for(var n=0;n<2;n++){
   var sha;var g=await fetch(api+"?ref="+BR+"&t="+Date.now(),{headers:hd(t)});
   if(g.status===200)sha=(await g.json()).sha;else if(g.status!==404)return g;
   var body={message:"Perbarui data "+name+" lewat dashboard",content:btoa(unescape(encodeURIComponent(txt))),branch:BR};if(sha)body.sha=sha;
   var r=await fetch(api,{method:"PUT",headers:Object.assign({"Content-Type":"application/json"},hd(t)),body:JSON.stringify(body)});
   if(r.status!==409&&r.status!==422)return r;
  }
  return r;
 }
 b.onclick=async function(){
  var t=tok();
  if(!t){t=prompt("Tempel token GitHub (Fine-grained token, akses hanya ke repositori ini, izin Contents: Read and write). Token disimpan di browser ini saja.");if(!t)return;t=t.trim();try{localStorage.setItem("gh_token",t)}catch(e){}}
  b.disabled=true;say("Menyimpan\u2026");
  try{
   var r=await put(t,JSON.stringify(get()));
   if(r.status===200||r.status===201)say("Tersimpan di GitHub. Pengunjung melihatnya sekitar 1\u20132 menit lagi.");
   else if(r.status===401||r.status===403||r.status===404){try{localStorage.removeItem("gh_token")}catch(e){}say("Gagal ("+r.status+"): token salah atau tidak punya izin ke "+REPO+". Klik lagi untuk memasukkan token baru.",true)}
   else say("Gagal menyimpan (kode "+r.status+").",true);
  }catch(e){say("Gagal terhubung ke GitHub.",true)}
  b.disabled=false;
 };
};
})();
