import {
  generatePriorityWeightMap,
  getVolumeMultiplier,
  applyPriorityVolumeAdjustment,
  calculateTotalPrioritizedVolume,
  getMusclePrioritySummary,
  PRIORITY_CONFIGS
} from '../services/musclePriorityService';

// Mock data for verification
const mockPriorities = [
  {
    id: '1',
    user_id: 'user1',
    muscle_id: 'muscle1',
    priority_level: 1,
    created_at: '2023-01-01',
    muscle_name: 'Chest',
    muscle_slug: 'chest'
  },
  {
    id: '2',
    user_id: 'user1',
    muscle_id: 'muscle2',
    priority_level: 2,
    created_at: '2023-01-01',
    muscle_name: 'Back',
    muscle_slug: 'back'
  },
  {
    id: '3',
    user_id: 'user1',
    muscle_id: 'muscle3',
    priority_level: 3,
    created_at: '2023-01-01',
    muscle_name: 'Shoulders',
    muscle_slug: 'shoulders'
  }
];

interface TestResult {
  test: string;
  passed: boolean;
  expected: any;
  actual: any;
  details?: string;
}

export const runMusclePriorityTests = () => {
  const results: TestResult[] = [];

  // Test 1: Priority configs are correctly defined
  results.push({
    test: 'Priority configs have correct values',
    passed: PRIORITY_CONFIGS[1].volumeMultiplier === 1.3 && 
            PRIORITY_CONFIGS[2].volumeMultiplier === 1.2 && 
            PRIORITY_CONFIGS[3].volumeMultiplier === 1.1,
    expected: { p1: 1.3, p2: 1.2, p3: 1.1 },
    actual: { 
      p1: PRIORITY_CONFIGS[1].volumeMultiplier, 
      p2: PRIORITY_CONFIGS[2].volumeMultiplier, 
      p3: PRIORITY_CONFIGS[3].volumeMultiplier 
    }
  });

  // Test 2: Weight map generation
  const weightMap = generatePriorityWeightMap(mockPriorities);
  results.push({
    test: 'Weight map generation',
    passed: weightMap.chest === 1.3 && weightMap.back === 1.2 && weightMap.shoulders === 1.1,
    expected: { chest: 1.3, back: 1.2, shoulders: 1.1 },
    actual: weightMap
  });

  // Test 3: Volume multiplier retrieval
  const chestMultiplier = getVolumeMultiplier('chest', mockPriorities);
  const nonPriorityMultiplier = getVolumeMultiplier('legs', mockPriorities);
  results.push({
    test: 'Volume multiplier retrieval',
    passed: chestMultiplier === 1.3 && nonPriorityMultiplier === 1.0,
    expected: { chest: 1.3, legs: 1.0 },
    actual: { chest: chestMultiplier, legs: nonPriorityMultiplier }
  });

  // Test 4: Volume adjustment application
  const baseVolume = 10;
  const adjustedChest = applyPriorityVolumeAdjustment(baseVolume, 'chest', mockPriorities);
  const adjustedLegs = applyPriorityVolumeAdjustment(baseVolume, 'legs', mockPriorities);
  results.push({
    test: 'Volume adjustment application',
    passed: adjustedChest === 13 && adjustedLegs === 10, // 10 * 1.3 = 13, 10 * 1.0 = 10
    expected: { chest: 13, legs: 10 },
    actual: { chest: adjustedChest, legs: adjustedLegs }
  });

  // Test 5: Muscle priority summary
  const chestSummary = getMusclePrioritySummary('chest', mockPriorities);
  const legsSummary = getMusclePrioritySummary('legs', mockPriorities);
  results.push({
    test: 'Muscle priority summary',
    passed: chestSummary.isPrioritized === true && 
            chestSummary.level === 1 && 
            chestSummary.description === 'Primary Focus' &&
            legsSummary.isPrioritized === false,
    expected: { chestPrioritized: true, chestLevel: 1, legsPrioritized: false },
    actual: { 
      chestPrioritized: chestSummary.isPrioritized, 
      chestLevel: chestSummary.level, 
      legsPrioritized: legsSummary.isPrioritized 
    }
  });

  // Test 6: Total volume calculation
  const baseVolumes = {
    chest: 10,
    back: 12,
    shoulders: 8,
    legs: 16
  };
  const totalAdjusted = calculateTotalPrioritizedVolume(baseVolumes, mockPriorities);
  results.push({
    test: 'Total volume calculation',
    passed: totalAdjusted.chest === 13 && // 10 * 1.3
            totalAdjusted.back === 14 &&  // 12 * 1.2
            totalAdjusted.shoulders === 9 && // 8 * 1.1
            totalAdjusted.legs === 16, // 16 * 1.0
    expected: { chest: 13, back: 14, shoulders: 9, legs: 16 },
    actual: totalAdjusted
  });

  return results;
};

export const logMusclePriorityTestResults = () => {
  console.log('🎯 Running Muscle Priority System Tests...\n');
  
  const results = runMusclePriorityTests();
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${status}: ${result.test}`);
    console.log(`   Expected: ${JSON.stringify(result.expected)}`);
    console.log(`   Actual: ${JSON.stringify(result.actual)}`);
    if (result.details) {
      console.log(`   Details: ${result.details}`);
    }
    console.log('');
  });
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log(`📊 Results: ${passedCount}/${totalCount} tests passed`);
  
  if (passedCount === totalCount) {
    console.log('🎉 All muscle priority system tests passed!');
    console.log('✅ Priority weight map generation working correctly');
    console.log('✅ Volume adjustments applying properly'); 
    console.log('✅ Muscle summaries providing accurate data');
  } else {
    console.log('⚠️  Some tests failed - check the muscle priority configurations');
  }
  
  return { passed: passedCount, total: totalCount, results };
};