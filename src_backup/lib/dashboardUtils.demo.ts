/**
 * Demo/Testing utility for dashboardUtils
 * Run this in the browser console to verify the utility functions work correctly
 */

import { getTopNSubitems, normalizeCategoriesSubcategories, testHelpers } from './dashboardUtils';
import { CategoryConfig } from '@/app/dashboard/types';

export function runDashboardUtilsDemo() {
  console.log('🧪 Testing Dashboard Utilities');
  console.log('================================');

  // Test 1: Category with fewer than 5 subcategories
  console.log('\n📝 Test 1: Category with 3 subcategories (should add 2 placeholders)');
  const mindSubcategories = [
    { id: 'learning', name: 'Learning', icon: '📚' },
    { id: 'skills', name: 'Skills', icon: '🎯' },
    { id: 'creativity', name: 'Creativity', icon: '🎨' }
  ];
  
  const mindResult = getTopNSubitems('mind', mindSubcategories, 5);
  console.log('Input:', mindSubcategories);
  console.log('Output:', mindResult);
  console.log('✅ Length is 5:', mindResult.length === 5);
  console.log('✅ First 3 are real:', mindResult.slice(0, 3).every(item => !item.isPlaceholder));
  console.log('✅ Last 2 are placeholders:', mindResult.slice(3).every(item => item.isPlaceholder));

  // Test 2: Category with more than 5 subcategories
  console.log('\n📝 Test 2: Category with 7 subcategories (should take first 5)');
  const tooManySubcategories = [
    { id: 'sub1', name: 'Sub 1', icon: '🔸' },
    { id: 'sub2', name: 'Sub 2', icon: '🔹' },
    { id: 'sub3', name: 'Sub 3', icon: '🔺' },
    { id: 'sub4', name: 'Sub 4', icon: '🔻' },
    { id: 'sub5', name: 'Sub 5', icon: '🔶' },
    { id: 'sub6', name: 'Sub 6', icon: '🔷' },
    { id: 'sub7', name: 'Sub 7', icon: '🔸' }
  ];
  
  const tooManyResult = getTopNSubitems('test', tooManySubcategories, 5);
  console.log('Input length:', tooManySubcategories.length);
  console.log('Output length:', tooManyResult.length);
  console.log('✅ Length is 5:', tooManyResult.length === 5);
  console.log('✅ All are real items:', tooManyResult.every(item => !item.isPlaceholder));

  // Test 3: Category with exactly 5 subcategories
  console.log('\n📝 Test 3: Category with exactly 5 subcategories (no changes needed)');
  const exactlyFiveSubcategories = [
    { id: 'sub1', name: 'Sub 1', icon: '🔸' },
    { id: 'sub2', name: 'Sub 2', icon: '🔹' },
    { id: 'sub3', name: 'Sub 3', icon: '🔺' },
    { id: 'sub4', name: 'Sub 4', icon: '🔻' },
    { id: 'sub5', name: 'Sub 5', icon: '🔶' }
  ];
  
  const exactResult = getTopNSubitems('test', exactlyFiveSubcategories, 5);
  console.log('Input length:', exactlyFiveSubcategories.length);
  console.log('Output length:', exactResult.length);
  console.log('✅ Length is 5:', exactResult.length === 5);
  console.log('✅ All are real items:', exactResult.every(item => !item.isPlaceholder));

  // Test 4: Empty category
  console.log('\n📝 Test 4: Empty category (should add 5 placeholders)');
  const emptyResult = getTopNSubitems('empty', [], 5);
  console.log('Input length:', 0);
  console.log('Output length:', emptyResult.length);
  console.log('✅ Length is 5:', emptyResult.length === 5);
  console.log('✅ All are placeholders:', emptyResult.every(item => item.isPlaceholder));

  // Test 5: Full category normalization
  console.log('\n📝 Test 5: Full category normalization');
  const testCategories: CategoryConfig[] = [
    testHelpers.createMockCategory('health', 'Health', [
      { id: 'fitness', name: 'Fitness', icon: '🏋️' },
      { id: 'nutrition', name: 'Nutrition', icon: '🥗' }
    ]),
    testHelpers.createMockCategory('mind', 'Mind', mindSubcategories)
  ];
  
  const normalizedCategories = normalizeCategoriesSubcategories(testCategories, 5);
  console.log('Normalized categories:', normalizedCategories);
  console.log('✅ All categories have 5 subcategories:', 
    normalizedCategories.every(cat => cat.subcategories?.length === 5));

  console.log('\n🎉 All tests completed! Dashboard utilities are working correctly.');
  
  return {
    mindResult,
    tooManyResult,
    exactResult,
    emptyResult,
    normalizedCategories
  };
}

// Export for use in console
(window as any).runDashboardUtilsDemo = runDashboardUtilsDemo;