import React from 'react';
import { Exercise, BaseSetFormProps } from './BaseSetForm';
import BodyweightSetForm from './BodyweightSetForm';
import WeightRepsSetForm from './WeightRepsSetForm';
import CardioSetForm from './CardioSetForm';

interface SmartSetFormProps extends BaseSetFormProps {}

/**
 * Smart set form that automatically selects the appropriate form component
 * based on the exercise's effort_mode and load_mode
 */
const SmartSetForm: React.FC<SmartSetFormProps> = (props) => {
  const { exercise } = props;
  const { effort_mode, load_mode, equipment } = exercise;

  // Determine form type based on exercise characteristics
  const getFormType = (): 'bodyweight' | 'weightReps' | 'cardio' => {
    console.log('🎯 SmartSetForm Form Selection Debug:', {
      exerciseId: exercise.id,
      effort_mode,
      load_mode,
      equipment_slug: equipment?.slug,
      equipment_type: equipment?.equipment_type
    });

    // PRIMARY: Cardio exercises (time, distance, calories based)
    if (effort_mode === 'time' || effort_mode === 'distance' || effort_mode === 'calories') {
      console.log('🏃 Selected CARDIO form for exercise:', exercise.id, 'effort_mode:', effort_mode);
      return 'cardio';
    }

    // CRITICAL: Bodyweight exercises based on load_mode (THE DEFINITIVE CHECK)
    if (load_mode === 'bodyweight_plus_optional' || load_mode === 'external_assist') {
      console.log('💪 BODYWEIGHT FORM SELECTED for exercise:', exercise.id, 'load_mode:', load_mode);
      return 'bodyweight';
    }

    // Equipment-based fallback for bodyweight detection (backup)
    const equipmentSlug = equipment?.slug;
    if (equipmentSlug === 'dip-bars' || equipmentSlug === 'pull-up-bar' || equipmentSlug === 'bodyweight') {
      console.log('💪 BODYWEIGHT FORM SELECTED (equipment fallback) for exercise:', exercise.id, 'equipment:', equipmentSlug);
      return 'bodyweight';
    }

    // FALLBACK: Default to weight & reps
    console.log('🏋️ Selected WEIGHT-REPS form for exercise:', exercise.id, 'load_mode:', load_mode);
    return 'weightReps';
  };

  const formType = getFormType();

  // Additional debug logging
  console.log('SmartSetForm final decision:', {
    exerciseId: exercise.id,
    selectedFormType: formType,
    willRenderBodyweightForm: formType === 'bodyweight'
  });

  // Render the appropriate form component
  switch (formType) {
    case 'bodyweight':
      console.log('✅ Rendering BodyweightSetForm for exercise:', exercise.id);
      return <BodyweightSetForm {...props} />;
    
    case 'cardio':
      console.log('✅ Rendering CardioSetForm for exercise:', exercise.id);
      return <CardioSetForm {...props} />;
    
    case 'weightReps':
    default:
      console.log('✅ Rendering WeightRepsSetForm for exercise:', exercise.id);
      return <WeightRepsSetForm {...props} />;
  }
};

export default SmartSetForm;