import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Edit3, Trash2, Search, Plus, User, Calendar, Clock, Dumbbell, Heart, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFitnessProfile, useUpsertFitnessProfile, SexType } from '@/features/health/fitness/hooks/useFitnessProfile.hook';
import { useHomeEquipment, EQUIPMENT_DISPLAY_MAP } from '@/features/health/fitness/hooks/useEquipment.hook';

export default function HealthConfigureBody() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('fitness');
  const [debugError, setDebugError] = useState<string | null>(null);
  
  // Fitness profile hooks
  const { data: fitnessProfileData } = useFitnessProfile();
  const { data: homeEquipment, isLoading: isLoadingEquipment } = useHomeEquipment();
  const upsertProfile = useUpsertFitnessProfile();

  // Fitness Profile State
  const [fitnessProfile, setFitnessProfile] = useState({
    primaryWeightGoal: '',
    trainingFocus: '',
    experienceLevel: '',
    sex: '',
    daysPerWeek: '',
    sessionLength: '',
    locationType: '',
    availableEquipment: [] as string[],
    priorityMuscleGroups: [] as string[]
  });

  // Load existing fitness profile data
  useEffect(() => {
    if (fitnessProfileData && homeEquipment) {
      // Convert any legacy string equipment values to UUIDs
      let equipmentUuids: string[] = [];
      if (fitnessProfileData.available_equipment) {
        equipmentUuids = fitnessProfileData.available_equipment
          .map(item => {
            // If it's already a UUID, keep it
            if (item.length === 36 && item.includes('-')) {
              return item;
            }
            // If it's a string slug, convert to UUID
            const equipment = homeEquipment.find(eq => eq.slug === item);
            return equipment?.id;
          })
          .filter((id): id is string => Boolean(id));
      }

      setFitnessProfile({
        primaryWeightGoal: fitnessProfileData.goal || '',
        trainingFocus: fitnessProfileData.training_goal || '',
        experienceLevel: fitnessProfileData.experience_level || '',
        sex: fitnessProfileData.sex || '',
        daysPerWeek: fitnessProfileData.days_per_week?.toString() || '',
        sessionLength: fitnessProfileData.preferred_session_minutes?.toString() || '',
        locationType: fitnessProfileData.location_type || '',
        availableEquipment: equipmentUuids,
        priorityMuscleGroups: fitnessProfileData.priority_muscle_groups || []
      });
    }
  }, [fitnessProfileData, homeEquipment]);

  // Nutrition Profile State  
  const [nutritionProfile, setNutritionProfile] = useState({
    dietaryPreferences: '',
    dailyCalorieGoal: '',
    waterIntakeGoal: '',
    mealsPerDay: ''
  });

  // Wellness Profile State
  const [wellnessProfile, setWellnessProfile] = useState({
    sleepGoal: '',
    stressLevel: '',
    activityLevel: '',
    healthConditions: []
  });

  const handleSaveProfile = async (profileType: string) => {
    if (profileType === 'fitness') {
      try {
        setDebugError(null); // Clear previous errors
        
        // Validate that equipment IDs are valid UUIDs
        const validEquipmentIds = fitnessProfile.availableEquipment.filter(id => {
          return id.length === 36 && id.includes('-') && id.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
        });

        console.log('Saving equipment IDs:', validEquipmentIds);
        
        await upsertProfile.mutateAsync({
          goal: fitnessProfile.primaryWeightGoal,
          training_goal: fitnessProfile.trainingFocus,
          experience_level: fitnessProfile.experienceLevel as "new" | "returning" | "intermediate" | "advanced" | "very_experienced",
          sex: (fitnessProfile.sex || undefined) as SexType | undefined,
          days_per_week: fitnessProfile.daysPerWeek ? Number(fitnessProfile.daysPerWeek) : undefined,
          preferred_session_minutes: fitnessProfile.sessionLength ? Number(fitnessProfile.sessionLength) : undefined,
          location_type: fitnessProfile.locationType as "home" | "gym" | undefined,
          available_equipment: validEquipmentIds.length > 0 ? validEquipmentIds : undefined,
          priority_muscle_groups: fitnessProfile.priorityMuscleGroups,
        });
      } catch (error) {
        console.error('Error saving fitness profile:', error);
        setDebugError(JSON.stringify(error, null, 2));
      }
    } else {
      // For other profiles, just show toast for now
      toast({
        title: "Profile saved",
        description: `Your ${profileType} profile has been updated successfully.`,
      });
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Health Configuration</h1>
        <p className="text-muted-foreground">
          Manage your health preferences, goals, and settings across all areas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="wellness">Wellness</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* FITNESS TAB */}
        <TabsContent value="fitness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5" />
                Fitness Profile
              </CardTitle>
              <CardDescription>
                Configure your training goals and workout preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Weight Goals */}
              <div className="space-y-3">
                <Label>Primary Weight Goal</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'fat_loss', label: 'Lose Weight', icon: '📉' },
                    { value: 'general_fitness', label: 'Maintain', icon: '⚖️' },
                    { value: 'recomp', label: 'Body Recomp', icon: '🔄' },
                    { value: 'muscle_gain', label: 'Gain Weight', icon: '📈' }
                  ].map(goal => (
                    <Button
                      key={goal.value}
                      variant={fitnessProfile.primaryWeightGoal === goal.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFitnessProfile(prev => ({ ...prev, primaryWeightGoal: goal.value }))}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-lg mb-1">{goal.icon}</span>
                      <span className="text-xs">{goal.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Training Focus */}
              <div className="space-y-3">
                <Label>Training Focus</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'muscle_gain', label: 'Muscle Building', icon: '💪' },
                    { value: 'strength', label: 'Strength', icon: '🏋️' },
                    { value: 'general_fitness', label: 'General Fitness', icon: '🏃' },
                    { value: 'fat_loss', label: 'Fat Loss', icon: '🔥' }
                  ].map(focus => (
                    <Button
                      key={focus.value}
                      variant={fitnessProfile.trainingFocus === focus.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFitnessProfile(prev => ({ ...prev, trainingFocus: focus.value }))}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-lg mb-1">{focus.icon}</span>
                      <span className="text-xs">{focus.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Biological Sex Selection */}
              <div className="space-y-3">
                <Label>Biological Sex</Label>
                <p className="text-sm text-muted-foreground">Used to optimize workout recommendations based on biological differences</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'male', label: 'Male', icon: '♂️' },
                    { value: 'female', label: 'Female', icon: '♀️' }
                  ].map(sex => (
                    <Button
                      key={sex.value}
                      variant={fitnessProfile.sex === sex.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFitnessProfile(prev => ({ ...prev, sex: sex.value }))}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-lg mb-1">{sex.icon}</span>
                      <span className="text-xs">{sex.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Body Metrics Notice */}
              <div className="bg-muted p-4 rounded-lg border border-dashed">
                <p className="text-sm font-medium mb-1">Body Metrics Tracking</p>
                <p className="text-xs text-muted-foreground">
                  Weight and height tracking has been moved to the dedicated Body Metrics section for better historical tracking.
                </p>
              </div>

              {/* Experience Level */}
              <div className="space-y-3">
                <Label>Experience Level</Label>
                <Select 
                  value={fitnessProfile.experienceLevel || ''} 
                  onValueChange={(value) => setFitnessProfile(prev => ({ ...prev, experienceLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New to Exercise</SelectItem>
                    <SelectItem value="returning">Returning</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="very_experienced">Very Experienced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Workout Days/Week
                  </Label>
              <Select value={fitnessProfile.daysPerWeek} onValueChange={(value) => setFitnessProfile(prev => ({ ...prev, daysPerWeek: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="2">2 days</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="4">4 days</SelectItem>
                      <SelectItem value="5">5 days</SelectItem>
                      <SelectItem value="6">6 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Session Length
                  </Label>
              <Select value={fitnessProfile.sessionLength} onValueChange={(value) => setFitnessProfile(prev => ({ ...prev, sessionLength: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="75">75 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                      <SelectItem value="120">120 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Training Location */}
              <div className="space-y-3">
                <Label>Training Location</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'gym', label: 'Gym', icon: '🏋️', description: 'Full equipment access' },
                    { value: 'home', label: 'Home', icon: '🏠', description: 'Limited equipment' }
                  ].map(location => (
                    <Button
                      key={location.value}
                      variant={fitnessProfile.locationType === location.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFitnessProfile(prev => ({ ...prev, locationType: location.value }))}
                      className="flex flex-col h-auto py-4"
                    >
                      <span className="text-2xl mb-2">{location.icon}</span>
                      <span className="font-medium">{location.label}</span>
                      <span className="text-xs text-muted-foreground">{location.description}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Available Equipment (shown only for Home) */}
              {fitnessProfile.locationType === 'home' && (
                <div className="space-y-3">
                  <Label>Available Equipment</Label>
                  <p className="text-sm text-muted-foreground">Select all equipment you have access to at home</p>
                  {isLoadingEquipment ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {homeEquipment?.map(equipment => {
                        const displayInfo = EQUIPMENT_DISPLAY_MAP[equipment.slug as keyof typeof EQUIPMENT_DISPLAY_MAP];
                        if (!displayInfo) return null;
                        
                        return (
                          <Button
                            key={equipment.id}
                            variant={fitnessProfile.availableEquipment.includes(equipment.id) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              const current = fitnessProfile.availableEquipment;
                              if (current.includes(equipment.id)) {
                                setFitnessProfile(prev => ({
                                  ...prev,
                                  availableEquipment: current.filter(e => e !== equipment.id)
                                }));
                              } else {
                                setFitnessProfile(prev => ({
                                  ...prev,
                                  availableEquipment: [...current, equipment.id]
                                }));
                              }
                            }}
                            className="flex flex-col h-auto py-3"
                          >
                            <span className="text-lg mb-1">{displayInfo.icon}</span>
                            <span className="text-xs">{displayInfo.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Priority Muscle Groups */}
              <div className="space-y-3">
                <Label>Priority Muscle Groups</Label>
                <p className="text-sm text-muted-foreground">Select muscle groups you want to focus on (optional)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: 'chest', label: 'Chest', icon: '💪' },
                    { value: 'back', label: 'Back', icon: '🔙' },
                    { value: 'shoulders', label: 'Shoulders', icon: '👐' },
                    { value: 'biceps', label: 'Biceps', icon: '💪' },
                    { value: 'triceps', label: 'Triceps', icon: '💪' },
                    { value: 'quads', label: 'Quadriceps', icon: '🦵' },
                    { value: 'hamstrings', label: 'Hamstrings', icon: '🦵' },
                    { value: 'glutes', label: 'Glutes', icon: '🍑' },
                    { value: 'calves', label: 'Calves', icon: '🦵' },
                    { value: 'abs', label: 'Abs', icon: '🏺' }
                  ].map(muscle => (
                    <Button
                      key={muscle.value}
                      variant={fitnessProfile.priorityMuscleGroups.includes(muscle.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const current = fitnessProfile.priorityMuscleGroups;
                        if (current.includes(muscle.value)) {
                          setFitnessProfile(prev => ({
                            ...prev,
                            priorityMuscleGroups: current.filter(m => m !== muscle.value)
                          }));
                        } else {
                          setFitnessProfile(prev => ({
                            ...prev,
                            priorityMuscleGroups: [...current, muscle.value]
                          }));
                        }
                      }}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-lg mb-1">{muscle.icon}</span>
                      <span className="text-xs">{muscle.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={() => handleSaveProfile('fitness')} className="w-full" disabled={upsertProfile.isPending}>
                {upsertProfile.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving Profile...
                  </>
                ) : (
                  <>
                    Save Fitness Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Gym & Equipment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Gym & Equipment
              </CardTitle>
              <CardDescription>
                Manage your gym locations and equipment preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>Gym management features coming soon</p>
                <p className="text-sm">You'll be able to add gyms, equipment, and micro weights</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NUTRITION TAB */}
        <TabsContent value="nutrition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Nutrition Preferences
              </CardTitle>
              <CardDescription>
                Set your dietary goals and nutrition tracking preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Dietary Preferences</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: 'omnivore', label: 'Omnivore', icon: '🍽️' },
                    { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
                    { value: 'vegan', label: 'Vegan', icon: '🌱' },
                    { value: 'keto', label: 'Keto', icon: '🥑' },
                    { value: 'paleo', label: 'Paleo', icon: '🥩' },
                    { value: 'mediterranean', label: 'Mediterranean', icon: '🫒' }
                  ].map(diet => (
                    <Button
                      key={diet.value}
                      variant={nutritionProfile.dietaryPreferences === diet.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNutritionProfile(prev => ({ ...prev, dietaryPreferences: diet.value }))}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-lg mb-1">{diet.icon}</span>
                      <span className="text-xs">{diet.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Calorie Goal</Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={nutritionProfile.dailyCalorieGoal}
                    onChange={(e) => setNutritionProfile(prev => ({ ...prev, dailyCalorieGoal: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Water Intake Goal (L)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="2.5"
                    value={nutritionProfile.waterIntakeGoal}
                    onChange={(e) => setNutritionProfile(prev => ({ ...prev, waterIntakeGoal: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Meals Per Day</Label>
                <Select value={nutritionProfile.mealsPerDay} onValueChange={(value) => setNutritionProfile(prev => ({ ...prev, mealsPerDay: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meals per day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 meals</SelectItem>
                    <SelectItem value="4">4 meals</SelectItem>
                    <SelectItem value="5">5 meals</SelectItem>
                    <SelectItem value="6">6 meals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => handleSaveProfile('nutrition')} className="w-full">
                Save Nutrition Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WELLNESS TAB */}
        <TabsContent value="wellness" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Wellness & Recovery
              </CardTitle>
              <CardDescription>
                Configure your sleep, stress management, and overall wellness goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sleep Goal (hours)</Label>
                  <Select value={wellnessProfile.sleepGoal} onValueChange={(value) => setWellnessProfile(prev => ({ ...prev, sleepGoal: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sleep goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 hours</SelectItem>
                      <SelectItem value="7">7 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                      <SelectItem value="9">9 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Current Stress Level</Label>
                  <Select value={wellnessProfile.stressLevel} onValueChange={(value) => setWellnessProfile(prev => ({ ...prev, stressLevel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stress level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="very-high">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>General Activity Level</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { value: 'sedentary', label: 'Sedentary', icon: '🪑' },
                    { value: 'light', label: 'Lightly Active', icon: '🚶' },
                    { value: 'moderate', label: 'Moderately Active', icon: '🏃' },
                    { value: 'very', label: 'Very Active', icon: '🏃‍♂️' }
                  ].map(level => (
                    <Button
                      key={level.value}
                      variant={wellnessProfile.activityLevel === level.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setWellnessProfile(prev => ({ ...prev, activityLevel: level.value }))}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="text-lg mb-1">{level.icon}</span>
                      <span className="text-xs">{level.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={() => handleSaveProfile('wellness')} className="w-full">
                Save Wellness Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INTEGRATIONS TAB */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>App Integrations</CardTitle>
              <CardDescription>
                Connect your favorite health and fitness apps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-6 text-muted-foreground">
                <Plus className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>App integrations coming soon</p>
                <p className="text-sm">Connect with MyFitnessPal, Fitbit, Apple Health, and more</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage your health-related notifications and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Workout Reminders</div>
                    <div className="text-sm text-muted-foreground">Get notified when it's time to work out</div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Meal Tracking</div>
                    <div className="text-sm text-muted-foreground">Reminders to log your meals</div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Sleep Reminders</div>
                    <div className="text-sm text-muted-foreground">Bedtime and wake-up notifications</div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Debug Error Box */}
      {debugError && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">Debug Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-red-700 overflow-auto max-h-40 whitespace-pre-wrap">
              {debugError}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}