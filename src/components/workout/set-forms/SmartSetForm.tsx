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
    // Cardio exercises (time, distance, calories based)
    if (effort_mode === 'time' || effort_mode === 'distance' || effort_mode === 'calories') {
      return 'cardio';
    }

    // Bodyweight exercises (with optional assistance or added weight)
    if (load_mode === 'bodyweight_plus_optional' || load_mode === 'external_assist') {
      return 'bodyweight';
    }

    // Equipment-based detection for bodyweight
    if (equipment?.slug === 'bodyweight' || 
        equipment?.slug === 'dip-bars' || 
        equipment?.slug === 'pull-up-bar' ||
        equipment?.equipment_type === 'bodyweight') {
      return 'bodyweight';
    }

    // Default to weight & reps for traditional strength training
    return 'weightReps';
  };

  const formType = getFormType();

  // Render the appropriate form component
  switch (formType) {
    case 'bodyweight':
      return <BodyweightSetForm {...props} />;
    
    case 'cardio':
      return <CardioSetForm {...props} />;
    
    case 'weightReps':
    default:
      return <WeightRepsSetForm {...props} />;
  }
};

export default SmartSetForm;