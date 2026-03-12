import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export default function DurationPicker({ value, onChange, onClose }) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Parse existing value on open
  useEffect(() => {
    if (value) {
      const hourMatch = value.match(/(\d+)\s*h/);
      const minMatch = value.match(/(\d+)\s*m/);
      if (hourMatch) setHours(parseInt(hourMatch[1]));
      if (minMatch) setMinutes(parseInt(minMatch[1]));
    }
  }, []);

  const handleConfirm = () => {
    let result = '';
    if (hours > 0 && minutes > 0) result = `${hours}h ${minutes}m`;
    else if (hours > 0) result = `${hours}h`;
    else if (minutes > 0) result = `${minutes}m`;
    else result = '0m';
    onChange(result);
    onClose();
  };

  const modal = (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '30px',
        width: '320px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      }}>
        <h5 style={{ marginBottom: '20px', fontWeight: 600 }}>
          <i className="fa fa-clock me-2"></i> Select Duration
        </h5>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          {/* Hours */}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', color: '#666', marginBottom: '6px', display: 'block' }}>Hours</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setHours(h => Math.max(0, h - 1))}
                style={{ padding: '8px 12px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >−</button>
              <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '18px' }}>{hours}</span>
              <button
                type="button"
                onClick={() => setHours(h => Math.min(99, h + 1))}
                style={{ padding: '8px 12px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >+</button>
            </div>
          </div>

          {/* Minutes */}
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '13px', color: '#666', marginBottom: '6px', display: 'block' }}>Minutes</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setMinutes(m => Math.max(0, m - 1))}
                style={{ padding: '8px 12px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >−</button>
              <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: '18px' }}>{minutes}</span>
              <button
                type="button"
                onClick={() => setMinutes(m => Math.min(55, m + 1))}
                style={{ padding: '8px 12px', background: '#f5f5f5', border: 'none', cursor: 'pointer', fontSize: '16px' }}
              >+</button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{
          background: '#f0f4ff',
          borderRadius: '8px',
          padding: '10px',
          textAlign: 'center',
          marginBottom: '20px',
          color: '#4a4a8a',
          fontWeight: 600,
        }}>
          {hours === 0 && minutes === 0
            ? 'No duration selected'
            : `${hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''}` : ''} ${minutes > 0 ? `${minutes} min` : ''}`.trim()
          }
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: '10px',
              border: '1px solid #ddd', borderRadius: '8px',
              background: '#fff', cursor: 'pointer', fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              flex: 1, padding: '10px',
              border: 'none', borderRadius: '8px',
              background: '#6c5ce7', color: '#fff',
              cursor: 'pointer', fontWeight: 600,
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}