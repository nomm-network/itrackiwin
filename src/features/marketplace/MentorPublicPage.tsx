import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function MentorPublicPage() {
  const { slugOrId } = useParams();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated mentor data for now
    setTimeout(() => {
      setMentor({
        id: slugOrId,
        name: "John Doe",
        city: "New York",
        country: "USA",
        specialties: ["Strength Training", "Weight Loss"],
        years_experience: 5
      });
      setLoading(false);
    }, 500);
  }, [slugOrId]);

  if (loading) return <div style={{padding:24}}>Loading...</div>;
  if (!mentor) return <div style={{padding:24}}>Mentor not found</div>;

  return (
    <div style={{padding:24}}>
      <h1>{mentor.name}</h1>
      <p>{mentor.city}, {mentor.country}</p>
      <p>Specialties: {mentor.specialties?.join(", ")}</p>
      <p>Years Experience: {mentor.years_experience ?? 'Not specified'}</p>
      
      <section style={{marginTop:24}}>
        <h2>Work With This Mentor</h2>
        <button style={{padding:"12px 24px", fontSize:16, backgroundColor:"#28a745", color:"white", border:"none", borderRadius:4}}>
          Request Mentorship
        </button>
      </section>
    </div>
  );
}