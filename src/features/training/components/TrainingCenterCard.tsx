import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Dumbbell, Calendar, Settings, ChevronDown } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import { startFromProgram, startFromTemplate } from "../hooks/useLaunchers";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ProgramTemplatePicker } from "@/features/programs/components/ProgramTemplatePicker";
import { getNextProgramTemplate } from "@/features/programs/api/programs";
import { useQuery } from "@tanstack/react-query";

type Mode = "template" | "program";

export default function TrainingCenterCard() {
  const navigate = useNavigate();
  const { loading, templates, programs, error } = useFavorites();
  const [mode, setMode] = useState<Mode>("program");
  const [templateId, setTemplateId] = useState<string>("");
  const [programId, setProgramId] = useState<string>("");
  const [isStarting, setIsStarting] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  // Get next template for selected program
  const { data: nextTemplate } = useQuery({
    queryKey: ['next-program-template', programId],
    queryFn: () => getNextProgramTemplate(programId),
    enabled: !!programId && mode === 'program',
  });

  // Default to first favorite when loaded
  const ready = !loading && !error;
  useMemo(() => {
    if (!ready) return;
    if (templates.length && !templateId) setTemplateId(templates[0].id);
    if (programs.length && !programId) setProgramId(programs[0].id);
  }, [ready, templates, programs, templateId, programId]);

  async function onStart() {
    setIsStarting(true);
    try {
      if (mode === "template" && templateId) {
        console.log('[TrainingCenter] Starting from template:', templateId);
        const { workoutId } = await startFromTemplate(templateId);
        console.log('[TrainingCenter] Started workout:', workoutId);
        navigate(`/app/workouts/${workoutId}`);
      } else if (mode === "program" && programId) {
        console.log('[TrainingCenter] Starting from program:', programId);
        const { workoutId } = await startFromProgram(programId);
        console.log('[TrainingCenter] Started workout:', workoutId);
        navigate(`/app/workouts/${workoutId}`);
      }
    } catch (error: any) {
      console.error('[TrainingCenter] FULL ERROR:', error);
      console.error('[TrainingCenter] Error message:', error?.message);
      console.error('[TrainingCenter] Error details:', JSON.stringify(error, null, 2));
      
      const errorMsg = error?.message || error?.toString() || 'Unknown error';
      toast.error(`ERROR: ${errorMsg}`, {
        description: error?.details || error?.hint || 'Check console for full details',
        duration: 10000,
      });
    } finally {
      setIsStarting(false);
    }
  }

  const canStart = ready && (
    (mode === "template" && templateId && templates.length > 0) ||
    (mode === "program" && programId && programs.length > 0)
  );

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Training Center
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/programs')}
            className="px-3"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Start a session from your favorites
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* MODE TOGGLE */}
        <div className="flex rounded-md border p-1 bg-background">
          <button
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-sm transition-colors flex items-center justify-center gap-2 ${
              mode === "program" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setMode("program")}
            disabled={loading || !programs.length}
          >
            <Calendar className="h-4 w-4" />
            Program
            {programs.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {programs.length}
              </Badge>
            )}
          </button>
          <button
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-sm transition-colors flex items-center justify-center gap-2 ${
              mode === "template" 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setMode("template")}
            disabled={loading || !templates.length}
          >
            <Dumbbell className="h-4 w-4" />
            Template
            {templates.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {templates.length}
              </Badge>
            )}
          </button>
        </div>

        {/* SELECTION */}
        {mode === "template" ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Choose Template
            </label>
            <Select
              value={templateId}
              onValueChange={setTemplateId}
              disabled={loading || !templates.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Choose Program
            </label>
            <Select
              value={programId}
              onValueChange={setProgramId}
              disabled={loading || !programs.length}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a program..." />
              </SelectTrigger>
              <SelectContent>
                {programs.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* START BUTTON */}
        {mode === "program" ? (
          <div className="space-y-2">
            <Button
              onClick={onStart}
              className="w-full bg-primary hover:bg-primary/90"
              disabled={!canStart || isStarting}
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              {isStarting ? 'Starting...' : 'Start Next in Program'}
            </Button>
            
            {programId && (
              <Button
                variant="outline"
                onClick={() => setShowTemplatePicker(true)}
                className="w-full"
                disabled={!canStart || isStarting}
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                {nextTemplate?.template_name ? `Next: ${nextTemplate.template_name}` : 'Pick Different Template'}
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={onStart}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!canStart || isStarting}
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            {isStarting ? 'Starting...' : 'Start Workout'}
          </Button>
        )}

        {/* ERROR/EMPTY STATES */}
        {error && (
          <p className="text-sm text-destructive">
            Couldn't load favorites: {error}
          </p>
        )}
        
        {!loading && !error && !templates.length && !programs.length && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              No favorites yet
            </p>
            <p className="text-xs text-muted-foreground">
              Mark templates or programs as favorites to see them here
            </p>
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-10 bg-muted rounded animate-pulse" />
          </div>
        )}

        {/* PROGRAM TEMPLATE PICKER */}
        {showTemplatePicker && programId && (
          <ProgramTemplatePicker
            open={showTemplatePicker}
            onOpenChange={setShowTemplatePicker}
            programId={programId}
            programName={programs.find(p => p.id === programId)?.name || 'Program'}
          />
        )}
      </CardContent>
    </Card>
  );
}