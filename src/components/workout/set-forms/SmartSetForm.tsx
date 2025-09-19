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

  // Determine form type ONLY from database fields
  const getFormType = (): 'bodyweight' | 'weightReps' | 'cardio' => {
    console.log('🎯 SmartSetForm v0.4.1 Debug:', {
      exerciseId: exercise.id,
      effort_mode,
      load_mode,
      equipment_id: (exercise as any).equipment_id
    });

    // Time-based exercises = cardio form
    if (effort_mode === 'time' || effort_mode === 'distance' || effort_mode === 'calories') {
      console.log('🏃 CARDIO form - effort_mode:', effort_mode);
      return 'cardio';
    }

    // Bodyweight exercises = bodyweight form  
    if (load_mode === 'bodyweight_plus_optional' || load_mode === 'external_assist') {
      console.log('💪 BODYWEIGHT form - load_mode:', load_mode);
      return 'bodyweight';
    }

    // Equipment-based check for dips (equipment_id: fb81ae58-bf4e-44e8-b45a-6026147bca8e)
    if ((exercise as any).equipment_id === 'fb81ae58-bf4e-44e8-b45a-6026147bca8e') {
      console.log('💪 BODYWEIGHT form - dips equipment_id match');
      return 'bodyweight';
    }

    console.log('🏋️ WEIGHT-REPS form - fallback');
    return 'weightReps';
  };

  const formType = getFormType();

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