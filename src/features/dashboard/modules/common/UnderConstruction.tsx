export default function UnderConstruction({ title, tips }:{title:string; tips:string[]}) {
  return (
    <div className="card uc">
      <div style={{padding:"12px 16px", background:"#fff8e1", border:"1px solid #ffe08a", borderRadius:8, marginBottom:12}}>
        <strong>{title}</strong>
        <div>This page is under construction, but here are some general best practices to get value right away.</div>
      </div>
      <ol style={{paddingLeft:18, marginTop:8}}>
        {tips.map((t,i)=><li key={i} style={{margin:"6px 0"}}>{t}</li>)}
      </ol>
    </div>
  );
}