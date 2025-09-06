// Fitness UI components
export * from '../components/FitnessProfile';
export * from '../components/EffortSelector';
export * from '../components/WarmupFeedback';
export * from '../components/WarmupPlanPanel';
export * from '../components/WeightEntry';
// Remove invalid imports - these components need to be moved or organized differently

// Widget exports
export { default as FitnessReadiness } from './widgets/FitnessReadiness';
export { default as FitnessStats } from './widgets/FitnessStats';
export { default as TrainingDashboard } from './widgets/TrainingDashboard';

// Legacy
export { default as DynamicMetricsForm } from '../components/DynamicMetricsForm';