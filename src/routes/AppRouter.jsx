import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Dashboard } from '../pages/Dashboard/Dashboard';
import { ProblemCategory } from '../pages/ProblemCategory/ProblemCategory';
import { TroubleshootingFlow } from '../pages/TroubleshootingFlow/TroubleshootingFlow';
import { DiagnosticResults } from '../pages/DiagnosticResults/DiagnosticResults';
import { AIAssistant } from '../pages/AIAssistant/AIAssistant';
import { Search } from '../pages/Search/Search';
import { History } from '../pages/History/History';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<ProblemCategory />} />
        <Route path="/troubleshoot/:problemId" element={<TroubleshootingFlow />} />
        <Route path="/results/:sessionId" element={<DiagnosticResults />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/search" element={<Search />} />
        <Route path="/history" element={<History />} />
      </Route>
    </Routes>
  );
}
