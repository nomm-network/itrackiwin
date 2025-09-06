import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface ProgramBuilderProps {
  onCreateProgram: (program: {
    name: string;
    description?: string;
    blocks: Array<{
      name: string;
      order_index: number;
      template_id: string;
    }>;
  }) => void;
}

export default function ProgramBuilder({ onCreateProgram }: ProgramBuilderProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    onCreateProgram({
      name,
      description,
      blocks: []
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Training Program</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Program name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={!name}>
          Create Program
        </Button>
      </CardContent>
    </Card>
  );
}