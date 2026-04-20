/**
 * Toast — Notification component for success/error messages.
 * Auto-dismisses after 3 seconds (handled by AppContext).
 */
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { state } = useApp();
  const { toast } = state;

  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
      {toast.type === 'success' ? '✓' : '⚠'} {toast.message}
    </div>
  );
}
