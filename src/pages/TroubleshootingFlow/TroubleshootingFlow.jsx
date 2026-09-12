import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HudPanel } from '../../components/HudPanel/HudPanel';
import { ProgressIndicator } from '../../components/ProgressIndicator/ProgressIndicator';
import { ImageViewer } from '../../components/ImageViewer/ImageViewer';
import { LiveNetworkCheck } from '../../components/LiveNetworkCheck/LiveNetworkCheck';
import { LiveDeviceCheck } from '../../components/LiveDeviceCheck/LiveDeviceCheck';
import { fetchPrinterCheck, fetchDisplayCheck, fetchPeripheralCheck } from '../../services/api/deviceChecks';
import { fetchTroubleshootingSteps } from '../../services/api/knowledgeBase';
import { useDiagnosticHistory } from '../../hooks/useDiagnosticHistory';

export function TroubleshootingFlow() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [steps, setSteps] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastCheckResult, setLastCheckResult] = useState(null);
  const { addEntry } = useDiagnosticHistory();

  useEffect(() => {
    let cancelled = false;
    setSteps(null);
    setCurrentIndex(0);
    fetchTroubleshootingSteps(problemId).then((data) => {
      if (!cancelled) setSteps(data);
    });
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  if (steps === null) {
    return (
      <HudPanel eyebrow="Loading" title="Preparing troubleshooting steps…">
        <p className="text-sm text-muted">Fetching from the offline knowledge base.</p>
      </HudPanel>
    );
  }

  if (steps.length === 0) {
    return (
      <HudPanel eyebrow="Not found" title="No steps available">
        <p className="text-sm text-muted">
          There's no troubleshooting content for "{problemId}" yet.
        </p>
        <Link to="/categories" className="mt-4 inline-block text-sm text-signal hover:underline">
          ← Back to categories
        </Link>
      </HudPanel>
    );
  }

  const step = steps[currentIndex];
  const isLastStep = currentIndex === steps.length - 1;

  function goNext() {
    if (isLastStep) {
      addEntry({
        categoryId: problemId,
        outcome: 'resolved',
        ...(lastCheckResult !== null && { hasValidIP: lastCheckResult }),
      });
      navigate(`/results/${problemId}`, { state: { outcome: 'resolved' } });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  function goBack() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function escalate() {
    addEntry({ categoryId: problemId, outcome: 'escalate' });
    navigate(`/results/${problemId}`, { state: { outcome: 'escalate' } });
  }

  return (
    <div className="space-y-4">
      <HudPanel eyebrow={`Troubleshooting · ${problemId}`} title={step.title}>
        <ProgressIndicator current={currentIndex} total={steps.length} />

        {step.type === 'live-check' && (
          <div className="mt-5 space-y-4">
            <p className="text-sm leading-relaxed text-ghost">{step.instruction}</p>
            <LiveNetworkCheck onResult={(hasValidIP) => setLastCheckResult(hasValidIP)} />
          </div>
        )}

        {step.type === 'live-printer-check' && (
          <div className="mt-5 space-y-4">
            <p className="text-sm leading-relaxed text-ghost">{step.instruction}</p>
            <LiveDeviceCheck
              fetchFn={fetchPrinterCheck}
              buttonLabel="Run Live Printer Check"
              renderList={(data) =>
                (data.printers ?? []).map((p, i) => ({
                  key: `${p.name}-${i}`,
                  label: `${p.name}: ${p.status}${p.jobCount != null ? ` (${p.jobCount} jobs queued)` : ''}`,
                }))
              }
            />
          </div>
        )}

        {step.type === 'live-display-check' && (
          <div className="mt-5 space-y-4">
            <p className="text-sm leading-relaxed text-ghost">{step.instruction}</p>
            <LiveDeviceCheck
              fetchFn={fetchDisplayCheck}
              buttonLabel="Run Live Display Check"
              renderList={(data) =>
                (data.displays ?? []).map((d, i) => ({
                  key: `${d.name}-${i}`,
                  label: `${d.name}${d.resolution ? `: ${d.resolution}` : d.width ? `: ${d.width}x${d.height}` : ''}`,
                }))
              }
            />
          </div>
        )}

        {step.type === 'live-peripheral-check' && (
          <div className="mt-5 space-y-4">
            <p className="text-sm leading-relaxed text-ghost">{step.instruction}</p>
            <LiveDeviceCheck
              fetchFn={fetchPeripheralCheck}
              buttonLabel="Run Live Peripheral Check"
              renderList={(data) =>
                (data.devices ?? []).map((d, i) => ({
                  key: `${d.name ?? d.id}-${i}`,
                  label: `${d.name}${d.status ? ` (${d.status})` : ''}`,
                }))
              }
            />
          </div>
        )}

        {!step.type && (
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <ImageViewer alt={step.title} src={step.image} />
            <div className="flex flex-col justify-center">
              <p className="text-sm leading-relaxed text-ghost">{step.instruction}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
          <button
            onClick={goBack}
            disabled={currentIndex === 0}
            className="rounded-md border border-border px-4 py-2 text-sm text-ghost/80 transition-colors hover:bg-white/5 disabled:opacity-30"
          >
            Back
          </button>

          <button
            onClick={escalate}
            className="text-xs text-status-offline hover:underline"
          >
            Still not working? Escalate
          </button>

          <button
            onClick={goNext}
            className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-onAccent shadow-glow-sm transition-transform hover:scale-[1.02]"
          >
            {isLastStep ? 'Mark Resolved' : 'Next Step'}
          </button>
        </div>
      </HudPanel>
    </div>
  );
}
