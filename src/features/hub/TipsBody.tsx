import { TIPS_BY_SLUG } from "./tips-data";

export default function TipsBody({ slug }: { slug: string }) {
  const entry = TIPS_BY_SLUG[slug.toLowerCase()];
  if (!entry) return null;

  return (
    <div style={{marginTop:16}}>
      <div style={{padding:"12px 16px", background:"#fff8e1", border:"1px solid #ffe08a", borderRadius:8, marginBottom:12}}>
        <strong>{entry.title}</strong>
        <div>This module is under construction, but here are Top 10 best practices you can use right away.</div>
      </div>
      <ol style={{paddingLeft:20}}>
        {entry.tips.map((t,i)=>(
          <li key={i} style={{margin:"8px 0"}}>{t}</li>
        ))}
      </ol>
    </div>
  );
}