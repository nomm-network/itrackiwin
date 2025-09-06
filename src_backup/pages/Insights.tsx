import React from "react";
import { useSimpleInsights } from "@/lib/insights";
import PageNav from "@/components/PageNav";

const Insights: React.FC = () => {
  const messages = useSimpleInsights();
  return (
    <>
      <PageNav current="Insights" />
      <main className="container py-8">
        <h1 className="text-2xl font-semibold mb-6">Insights</h1>
        <ul className="list-disc pl-6 space-y-2">
          {messages.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </main>
    </>
  );
};

export default Insights;
