// workout-flow-v0.7.0 (SOT) – DO NOT DUPLICATE
import React from 'react';
import { Exercise, BaseSetFormProps } from './BaseSetForm';
import BodyweightSetForm from './BodyweightSetForm';
import WeightRepsSetForm from './WeightRepsSetForm';
import CardioSetForm from './CardioSetForm';

interface SmartSetFormProps extends BaseSetFormProps {}

/**
 * Smart set form - routes based on load_mode and effort_mode (NO legacy detection)
 */
const SmartSetForm: React.FC<SmartSetFormProps> = (props) => {
  const { exercise } = props;
  const { effort_mode, load_mode } = exercise;

  // Fix 6: Single resolver function using load_mode and effort_mode only
  const resolveFormMode = (): 'bodyweight' | 'weightReps' | 'cardio' => {
    console.log('🎯 SmartSetForm v0.7.0 - Form Router Debug:', {
      exerciseId: exercise.id,
      effort_mode,
      load_mode,
      fullExercise: exercise
    });

    // Order matters - check effort_mode first
    if (effort_mode === 'time') {
      console.log('⏱️ TIME form - effort_mode:', effort_mode);
      return 'cardio';
    }
    if (effort_mode === 'distance') {
      console.log('📏 DISTANCE form - effort_mode:', effort_mode);
      return 'cardio';
    }
    if (effort_mode === 'calories') {
      console.log('🔥 CALORIES form - effort_mode:', effort_mode);
      return 'cardio';
    }

    // For reps-based exercises, use load_mode
    switch (load_mode) {
      case 'bodyweight_plus_optional':
        console.log('💪 BODYWEIGHT form - load_mode:', load_mode);
        return 'bodyweight';
      case 'external_added':
        console.log('🏋️ WEIGHT-REPS form - load_mode:', load_mode);
        return 'weightReps';
      case 'external_assist':
        console.log('🤲 ASSIST-REPS form - load_mode:', load_mode);
        return 'bodyweight'; // assist uses bodyweight form with negatives
      case 'machine_level':
        console.log('🔧 MACHINE form - load_mode:', load_mode);
        return 'weightReps'; // machine settings in weight form
      default:
        console.log('🏋️ WEIGHT-REPS form - fallback, load_mode:', load_mode);
        return 'weightReps';
    }
  };

  const formType = resolveFormMode();
  
  // Render the appropriate form component
  switch (formType) {
    case 'bodyweight':
      console.log('✅ v0.7.0 Rendering BodyweightSetForm for exercise:', exercise.id);
      return <BodyweightSetForm {...props} />;
    
    case 'cardio':
      console.log('✅ v0.7.0 Rendering CardioSetForm for exercise:', exercise.id);
      return <CardioSetForm {...props} />;
    
    case 'weightReps':
    default:
      console.log('✅ v0.7.0 Rendering WeightRepsSetForm for exercise:', exercise.id);
      return <WeightRepsSetForm {...props} />;
  }
};

export default SmartSetForm;