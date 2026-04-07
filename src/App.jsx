
import React, { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

const pricing={"Pre-Sale Exterior Boost":{small:1500,medium:2000,large:2500},"Pre-Sale Value Boost":{small:3000,medium:3500,large:4000},"Full Value Lift":{base:5000}};
const addonPrices={fencing:1200,turf:1500,driveway:2000,garden:1200};
const defaults={weekLabel:"",targets:{agencyVisits:5,agentConversations:10,followUps:5,quotesSent:5,jobsWon:2,jobsCompleted:2,revenueQuoted:10000,revenueWon:5000,photosCaptured:2},actuals:{agencyVisits:0,agentConversations:0,followUps:0,quotesSent:0,jobsWon:0,jobsCompleted:0,revenueQuoted:0,revenueWon:0,photosCaptured:0},notes:""};
const labels={agencyVisits:"Agencies visited",agentConversations:"Agents spoken to",followUps:"Follow-ups made",quotesSent:"Quotes sent",jobsWon:"Jobs won",jobsCompleted:"Jobs completed",revenueQuoted:"Revenue quoted",revenueWon:"Revenue won",photosCaptured:"Before/after sets"};
const STORE="lellco-weekly-scoreboard-v1";

const money=n=>`$${Number(n||0).toLocaleString()}`;
const fname=t=>((t||"lellco-quote").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""))||"lellco-quote";

async function buildPdf({property,agent,issueCount,packageType,size,addons,scope,totalPrice}){
 const doc=new jsPDF({unit:"pt",format:"a4"}),L=40,W=doc.internal.pageSize.getWidth(); let y=48;
 const selected=Object.entries(addons).filter(([,v])=>v).map(([k])=>`${k} (+${money(addonPrices[k])})`);
 doc.setFillColor(46,59,47); doc.roundedRect(L,y,W-80,88,16,16,"F"); doc.setTextColor(255,255,255); doc.setFont("helvetica","bold"); doc.setFontSize(20); doc.text("Lellco Outdoor & Property Services",L+18,y+28); doc.setFontSize(12); doc.setFont("helvetica","normal"); doc.text("Pre-Sale Exterior Quote",L+18,y+50); y+=120; doc.setTextColor(31,41,55);
 const sec=(title,lines)=>{doc.setFont("helvetica","bold"); doc.setFontSize(14); doc.text(title,L,y); y+=18; doc.setFont("helvetica","normal"); doc.setFontSize(11); lines.forEach(line=>{const wrap=doc.splitTextToSize(line,W-100); doc.text(wrap,L,y); y+=wrap.length*14;}); y+=10;};
 sec("Property Details",[ `Property: ${property||"—"}`, `Agent: ${agent||"—"}`, `Issues Found: ${issueCount}` ]);
 sec("Recommended Package",[ `${packageType}${packageType!=="Full Value Lift"?` (${size})`:""}`, "Targeted pre-sale improvement designed to improve first impression and buyer appeal." ]);
 sec("Scope of Works", scope.map(i=>`• ${i}`));
 sec("Add-ons", selected.length?selected.map(i=>`• ${i}`):["No add-ons selected"]);
 doc.setFont("helvetica","bold"); doc.setFontSize(18); doc.setTextColor(46,59,47); doc.text(`Quote Total: ${money(totalPrice)}`,L,y+10); y+=36;
 doc.setFont("helvetica","italic"); doc.setFontSize(11); doc.setTextColor(75,85,99); const closing=doc.splitTextToSize("This is a targeted pre-sale improvement designed to increase buyer appeal, improve first impressions, and help achieve a stronger sale result.",W-100); doc.text(closing,L,y);
 const blob=doc.output("blob"); return new File([blob],`${fname(property)}-quote.pdf`,{type:"application/pdf"});
}

const Btn=({active,onClick,children})=><button type="button" onClick={onClick} style={{padding:12,borderRadius:12,border:active?"1px solid #2e3b2f":"1px solid #d1d5db",background:active?"#2e3b2f":"#fff",color:active?"#fff":"#1f2937",cursor:"pointer",fontWeight:600}}>{children}</button>;
const Num=({value,onChange})=><input type="number" min="0" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:120,padding:10,borderRadius:10,border:"1px solid #d1d5db"}}/>;
const Status=({ratio})=>{let bg="#fee2e2",color="#991b1b",label="Behind"; if(ratio>=1){bg="#dcfce7";color="#166534";label="Ahead";} else if(ratio>=0.7){bg="#fef3c7";color="#92400e";label="On track";} return <span style={{background:bg,color,padding:"6px 10px",borderRadius:999,fontSize:12,fontWeight:700}}>{label}</span>;};

export default function App(){
 const [tab,setTab]=useState("quote"), [property,setProperty]=useState(""), [agent,setAgent]=useState(""), [issueCount,setIssueCount]=useState(0), [packageType,setPackageType]=useState("Pre-Sale Exterior Boost"), [size,setSize]=useState("medium"), [addons,setAddons]=useState({}), [isSharing,setIsSharing]=useState(false);
 const [scoreboard,setScoreboard]=useState(defaults), [savedWeeks,setSavedWeeks]=useState([]);
 useEffect(()=>{ if(issueCount<=2) setPackageType("Pre-Sale Exterior Boost"); else if(issueCount<=5) setPackageType("Pre-Sale Value Boost"); else setPackageType("Full Value Lift"); },[issueCount]);
 useEffect(()=>{ try { const raw=localStorage.getItem(STORE); if(raw) setSavedWeeks(JSON.parse(raw)); } catch(e){ console.error(e); } },[]);
 const persist=w=>{ setSavedWeeks(w); localStorage.setItem(STORE,JSON.stringify(w)); };
 const basePrice=useMemo(()=>packageType==="Full Value Lift"?pricing[packageType].base:pricing[packageType][size],[packageType,size]);
 const addonTotal=Object.entries(addons).filter(([,v])=>v).reduce((s,[k])=>s+addonPrices[k],0);
 const totalPrice=basePrice+addonTotal;
 const scope=useMemo(()=>{ const b=["Lawn cut, edged and defined","Garden tidy and mulch refresh","Pressure cleaning of key areas","Plant trimming and shaping","Minor repairs and detailing"]; if(packageType==="Pre-Sale Value Boost"){b.push("Full garden reshape and presentation lift");b.push("Enhanced pressure cleaning of driveways, paths, and entry");} if(packageType==="Full Value Lift"){b.push("Full landscape presentation overhaul");b.push("Entry feature improvements and styling");b.push("Advanced repair and finishing works");} return b; },[packageType]);
 const exportPdf=async()=>{ const file=await buildPdf({property,agent,issueCount,packageType,size,addons,scope,totalPrice}); const url=URL.createObjectURL(file),a=document.createElement("a"); a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000); };
 const sendQuote=async()=>{ setIsSharing(true); try{ const file=await buildPdf({property,agent,issueCount,packageType,size,addons,scope,totalPrice}); const share={title:"Lellco Pre-Sale Quote",text:`Lellco quote for ${property||"property"} — ${money(totalPrice)}`,files:[file]}; if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share(share); return; } const url=URL.createObjectURL(file),a=document.createElement("a"); a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove(); const body=encodeURIComponent(`Attached is the Lellco pre-sale quote for ${property||"the property"}.\n\nRecommended package: ${packageType}${packageType!=="Full Value Lift"?` (${size})`:""}\nQuote total: ${money(totalPrice)}\n\nIf direct file sharing is not supported on this device, the PDF has been downloaded and can be attached manually.`); window.open(`mailto:?subject=Lellco Pre-Sale Quote&body=${body}`,"_blank"); setTimeout(()=>URL.revokeObjectURL(url),2000);} finally{ setIsSharing(false);} };
 const ratios=useMemo(()=>{ const out={}; Object.keys(scoreboard.targets).forEach(k=>{const t=Number(scoreboard.targets[k]||0), a=Number(scoreboard.actuals[k]||0); out[k]=t>0?a/t:0;}); return out; },[scoreboard]);
 const kpis=useMemo(()=>{ const q=Number(scoreboard.actuals.quotesSent||0), w=Number(scoreboard.actuals.jobsWon||0), rw=Number(scoreboard.actuals.revenueWon||0), c=Number(scoreboard.actuals.jobsCompleted||0); return {closeRate:q>0?`${Math.round((w/q)*100)}%`:"0%",avgJobValue:w>0?money(Math.round(rw/w)):"$0",completionRate:w>0?`${Math.round((c/w)*100)}%`:"0%"}; },[scoreboard]);
 const setTarget=(k,v)=>setScoreboard(p=>({...p,targets:{...p.targets,[k]:v}}));
 const setActual=(k,v)=>setScoreboard(p=>({...p,actuals:{...p.actuals,[k]:v}}));
 const saveWeek=()=>{ const label=scoreboard.weekLabel||`Week ${new Date().toLocaleDateString()}`; const rec={...scoreboard,id:`${Date.now()}`,weekLabel:label}; persist([rec,...savedWeeks].slice(0,20)); };
 const loadWeek=(w)=>setScoreboard(w);
 const resetWeek=()=>setScoreboard(defaults);

 return <div style={{padding:20,maxWidth:760,margin:"0 auto",fontFamily:"sans-serif",color:"#1f2937"}}>
  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
   <img src="/favicon.png" alt="Lellco logo" style={{width:44,height:44,borderRadius:12}}/>
   <div><div style={{fontWeight:700,fontSize:22}}>Lellco Field App</div><div style={{color:"#6b7280",fontSize:13}}>Quote workflow + weekly scoreboard</div></div>
  </div>
  <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
   <Btn active={tab==="quote"} onClick={()=>setTab("quote")}>Quote Builder</Btn>
   <Btn active={tab==="scoreboard"} onClick={()=>setTab("scoreboard")}>Weekly Scoreboard</Btn>
  </div>

  {tab==="quote" ? <div style={{display:"grid",gap:12,background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:16}}>
    <input placeholder="Property Address" value={property} onChange={e=>setProperty(e.target.value)} style={{width:"100%",padding:12,borderRadius:12,border:"1px solid #d1d5db"}}/>
    <input placeholder="Agent Name" value={agent} onChange={e=>setAgent(e.target.value)} style={{width:"100%",padding:12,borderRadius:12,border:"1px solid #d1d5db"}}/>
    <div><h3 style={{margin:"4px 0 8px"}}>Issues Found</h3><Num value={issueCount} onChange={setIssueCount}/></div>
    <div><h3 style={{margin:"8px 0"}}>Recommended Package</h3><div style={{fontWeight:700,marginBottom:10}}>{packageType}</div>
      {packageType!=="Full Value Lift" && <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Btn active={size==="small"} onClick={()=>setSize("small")}>Small</Btn>
        <Btn active={size==="medium"} onClick={()=>setSize("medium")}>Medium</Btn>
        <Btn active={size==="large"} onClick={()=>setSize("large")}>Large</Btn>
      </div>}
    </div>
    <div><h3 style={{margin:"8px 0"}}>Add-ons</h3><div style={{display:"grid",gap:8}}>
      {Object.keys(addonPrices).map(k=><label key={k} style={{display:"flex",gap:10,alignItems:"center"}}><input type="checkbox" checked={!!addons[k]} onChange={()=>setAddons({...addons,[k]:!addons[k]})}/><span style={{textTransform:"capitalize"}}>{k}</span><span style={{color:"#6b7280"}}>+{money(addonPrices[k])}</span></label>)}
    </div></div>
    <div><h3 style={{margin:"8px 0"}}>Scope of Works</h3><ul style={{marginTop:0,paddingLeft:20}}>{scope.map(i=><li key={i} style={{marginBottom:6}}>{i}</li>)}</ul></div>
    <div style={{fontSize:28,fontWeight:800,color:"#2e3b2f"}}>Total: {money(totalPrice)}</div>
    <p style={{fontStyle:"italic",color:"#4b5563",margin:0}}>“This is a targeted pre-sale improvement designed to increase buyer appeal, improve first impressions, and help achieve a stronger sale result.”</p>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <button type="button" style={{padding:14,width:"100%",borderRadius:12,border:"1px solid #d1d5db",background:"#fff",cursor:"pointer"}} onClick={exportPdf}>Download PDF</button>
      <button type="button" style={{padding:14,width:"100%",borderRadius:12,border:"1px solid #2e3b2f",background:"#2e3b2f",color:"#fff",cursor:"pointer"}} onClick={sendQuote} disabled={isSharing}>{isSharing?"Preparing...":"Send Quote"}</button>
    </div>
    <div style={{color:"#6b7280",fontSize:12}}>On supported phones, Send Quote opens the native share sheet with the PDF attached.</div>
  </div> :
  <div style={{display:"grid",gap:14}}>
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:16,display:"grid",gap:14}}>
      <div><div style={{fontWeight:700,marginBottom:8}}>Week label</div><input placeholder="e.g. Week of 23 Mar 2026" value={scoreboard.weekLabel} onChange={e=>setScoreboard(p=>({...p,weekLabel:e.target.value}))} style={{width:"100%",padding:12,borderRadius:12,border:"1px solid #d1d5db"}}/></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))",gap:12}}>
        <div style={{border:"1px solid #e5e7eb",borderRadius:14,padding:14}}><div style={{fontWeight:700,marginBottom:10}}>Sales KPIs</div><div style={{marginBottom:8}}>Close rate: <strong>{kpis.closeRate}</strong></div><div style={{marginBottom:8}}>Average job value: <strong>{kpis.avgJobValue}</strong></div><div>Completion rate: <strong>{kpis.completionRate}</strong></div></div>
        <div style={{border:"1px solid #e5e7eb",borderRadius:14,padding:14}}><div style={{fontWeight:700,marginBottom:10}}>This week focus</div><div style={{color:"#6b7280",fontSize:14}}>Keep agent activity high, convert quotes faster, and capture before/after sets on every completed job.</div></div>
      </div>
      {Object.keys(scoreboard.targets).map(k=><div key={k} style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr auto",gap:10,alignItems:"center",borderTop:"1px solid #f3f4f6",paddingTop:12}}>
        <div style={{fontWeight:600}}>{labels[k]}</div>
        <div><div style={{fontSize:12,color:"#6b7280",marginBottom:4}}>Target</div><Num value={scoreboard.targets[k]} onChange={v=>setTarget(k,v)}/></div>
        <div><div style={{fontSize:12,color:"#6b7280",marginBottom:4}}>Actual</div><Num value={scoreboard.actuals[k]} onChange={v=>setActual(k,v)}/></div>
        <Status ratio={ratios[k]}/>
      </div>)}
      <div><div style={{fontWeight:700,marginBottom:8}}>Weekly notes</div><textarea placeholder="What worked, which agents responded, bottlenecks, next week's focus..." value={scoreboard.notes} onChange={e=>setScoreboard(p=>({...p,notes:e.target.value}))} rows={5} style={{width:"100%",padding:12,borderRadius:12,border:"1px solid #d1d5db",resize:"vertical"}}/></div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button type="button" onClick={saveWeek} style={{padding:12,borderRadius:12,border:"1px solid #2e3b2f",background:"#2e3b2f",color:"#fff",cursor:"pointer",fontWeight:700}}>Save Week</button>
        <button type="button" onClick={resetWeek} style={{padding:12,borderRadius:12,border:"1px solid #d1d5db",background:"#fff",cursor:"pointer",fontWeight:700}}>Reset</button>
      </div>
    </div>
    <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:16,padding:16}}>
      <div style={{fontWeight:700,marginBottom:12}}>Saved weeks</div>
      {savedWeeks.length===0 ? <div style={{color:"#6b7280"}}>No saved weeks yet.</div> : <div style={{display:"grid",gap:10}}>
        {savedWeeks.map(w=><div key={w.id} style={{border:"1px solid #e5e7eb",borderRadius:12,padding:12,display:"flex",justifyContent:"space-between",gap:12,alignItems:"center"}}><div><div style={{fontWeight:700}}>{w.weekLabel||"Saved week"}</div><div style={{color:"#6b7280",fontSize:13}}>Jobs won: {w.actuals.jobsWon} · Revenue won: {money(w.actuals.revenueWon)}</div></div><button type="button" onClick={()=>loadWeek(w)} style={{padding:10,borderRadius:10,border:"1px solid #d1d5db",background:"#fff",cursor:"pointer",fontWeight:700}}>Load</button></div>)}
      </div>}
    </div>
  </div>}
 </div>;
}
