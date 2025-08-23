import { 
  getSexBasedTrainingConfig,
  applyVolumeBias,
  applyProgressionBias,
  getRestTime,
  getRepRange
} from '../utils/sexBasedTraining';
import { SexType } from '../hooks/useFitnessProfile.hook';

// Simple test verification function
export const runSexBasedTrainingTests = () => {
  const results: { test: string; passed: boolean; details: string }[] = [];

  // Test 1: Female should get more glute volume
  const baseGluteVolume = 10;
  const femaleGlutes = applyVolumeBias(baseGluteVolume, 'glutes', 'female');
  const maleGlutes = applyVolumeBias(baseGluteVolume, 'glutes', 'male');
  
  results.push({
    test: 'Female glute bias',
    passed: femaleGlutes > maleGlutes,
    details: `Female: ${femaleGlutes} sets vs Male: ${maleGlutes} sets (base: ${baseGluteVolume})`
  });

  // Test 2: Male should get more upper body volume
  const baseUpperVolume = 20;
  const maleUpper = applyVolumeBias(baseUpperVolume, 'upperBody', 'male');
  const femaleUpper = applyVolumeBias(baseUpperVolume, 'upperBody', 'female');
  
  results.push({
    test: 'Male upper body bias',
    passed: maleUpper > femaleUpper,
    details: `Male: ${maleUpper} sets vs Female: ${femaleUpper} sets (base: ${baseUpperVolume})`
  });

  // Test 3: Different rest times by sex
  const maleCompoundRest = getRestTime('compound', 'male');
  const femaleCompoundRest = getRestTime('compound', 'female');
  
  results.push({
    test: 'Different rest times',
    passed: maleCompoundRest !== femaleCompoundRest,
    details: `Male: ${maleCompoundRest}s vs Female: ${femaleCompoundRest}s`
  });

  // Test 4: Male should have higher strength progression bias
  const baseProgression = 2.5;
  const maleStrength = applyProgressionBias(baseProgression, 'strength', 'male');
  const femaleStrength = applyProgressionBias(baseProgression, 'strength', 'female');
  
  results.push({
    test: 'Male strength progression bias',
    passed: maleStrength > femaleStrength,
    details: `Male: ${maleStrength} kg/week vs Female: ${femaleStrength} kg/week`
  });

  // Test 5: Neutral config should be balanced
  const neutralUpper = applyVolumeBias(baseUpperVolume, 'upperBody', 'other');
  const neutralLower = applyVolumeBias(baseUpperVolume, 'lowerBody', 'other');
  
  results.push({
    test: 'Neutral config balance',
    passed: neutralUpper === neutralLower && neutralUpper === baseUpperVolume,
    details: `Upper: ${neutralUpper}, Lower: ${neutralLower} (both should equal base: ${baseUpperVolume})`
  });

  // Test 6: Rep ranges should differ by sex
  const maleHypertrophy = getRepRange('hypertrophy', 'male');
  const femaleHypertrophy = getRepRange('hypertrophy', 'female');
  
  results.push({
    test: 'Different rep ranges by sex',
    passed: maleHypertrophy[0] !== femaleHypertrophy[0] || maleHypertrophy[1] !== femaleHypertrophy[1],
    details: `Male: ${maleHypertrophy[0]}-${maleHypertrophy[1]} reps vs Female: ${femaleHypertrophy[0]}-${femaleHypertrophy[1]} reps`
  });

  return results;
};

// Console test runner for demo purposes
export const logTestResults = () => {
  console.log('🧪 Running Sex-Based Training Bias Tests...\n');
  
  const results = runSexBasedTrainingTests();
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status}: ${result.test}`);
    console.log(`   ${result.details}\n`);
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`📊 Results: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All sex-based training biases are working correctly!');
  } else {
    console.log('⚠️  Some tests failed - check the bias configurations');
  }
  
  return { passed: passedCount, total: totalCount, results };
};