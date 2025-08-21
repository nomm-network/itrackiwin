// Barrel exports for fitness feature
export { default as FitnessPage } from './pages/Fitness.page';
export { default as ExercisesPage } from './pages/Exercises.page';
export { default as ExerciseEditPage } from './pages/ExerciseEdit.page';
export { default as WorkoutSessionPage } from './pages/WorkoutSession.page';
export { default as TemplatesPage } from './pages/Templates.page';
export { default as TemplateEditorPage } from './pages/TemplateEditor.page';
export { default as FitnessConfigurePage } from './pages/FitnessConfigure.page';
export { default as HistoryPage } from './pages/History.page';
export { default as WorkoutDetailPage } from './pages/WorkoutDetail.page';

// Components
export { default as DynamicMetricsForm } from './components/DynamicMetricsForm';

// Hooks
export * from './hooks/useMetrics.hook';

// Services
export * from './services/fitness.api';