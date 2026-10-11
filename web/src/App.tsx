import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEvergreenStore } from './store/useEvergreenStore';
import { ShellLayout } from './components/shell/ShellLayout';
import { HomeScreen } from './screens/home/HomeScreen';
import { BlastRadiusScreen } from './screens/blast-radius/BlastRadiusScreen';
import { PlanScreen } from './screens/plan/PlanScreen';
import { ResultsScreen } from './screens/results/ResultsScreen';
import { DecisionScreen } from './screens/decision/DecisionScreen';
import { RolloutScreen } from './screens/rollout/RolloutScreen';
import { RecordScreen } from './screens/record/RecordScreen';
import { EstateScreen } from './screens/estate/EstateScreen';
import { WorkloadScreen } from './screens/workload/WorkloadScreen';
import { MemoryScreen } from './screens/memory/MemoryScreen';
import { ControlsScreen } from './screens/controls/ControlsScreen';
import { PortfolioScreen } from './screens/portfolio/PortfolioScreen';
import { IntegrationsScreen } from './screens/integrations/IntegrationsScreen';
import { Gallery } from './pages/Gallery';

export const App: React.FC = () => {
  const syncWithBackend = useEvergreenStore((s) => s.syncWithBackend);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  return (
    <HashRouter>
      <Routes>
        <Route element={<ShellLayout />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/command-center" element={<HomeScreen />} />
          <Route path="/events" element={<Navigate to="/" replace />} />
          <Route path="/blast-radius" element={<BlastRadiusScreen />} />
          <Route path="/events/:id/blast-radius" element={<BlastRadiusScreen />} />
          <Route path="/plan" element={<PlanScreen />} />
          <Route path="/events/:id/plan" element={<PlanScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/events/:id/results" element={<ResultsScreen />} />
          <Route path="/decision" element={<DecisionScreen />} />
          <Route path="/events/:id/decision" element={<DecisionScreen />} />
          <Route path="/rollout" element={<RolloutScreen />} />
          <Route path="/events/:id/rollout" element={<RolloutScreen />} />
          <Route path="/record" element={<RecordScreen />} />
          <Route path="/evidence" element={<RecordScreen />} />
          <Route path="/events/:id/record" element={<RecordScreen />} />
          <Route path="/events/:id/evidence" element={<RecordScreen />} />
          <Route path="/estate" element={<EstateScreen />} />
          <Route path="/estate/workloads/:id" element={<WorkloadScreen />} />
          <Route path="/workloads/:id" element={<WorkloadScreen />} />
          <Route path="/memory" element={<MemoryScreen />} />
          <Route path="/controls" element={<ControlsScreen />} />
          <Route path="/portfolio" element={<PortfolioScreen />} />
          <Route path="/integrations" element={<IntegrationsScreen />} />
          <Route path="/connectors" element={<IntegrationsScreen />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};



export default App;
