import React, { useState, useRef, useEffect } from 'react';
import { MousePointer, Eye, Sliders, Info, Compass } from 'lucide-react';

export default function HeatmapCanvas({ clicks = [], totalClicks = 0, pageUrl = '' }) {
  const [coordMode, setCoordMode] = useState('viewport'); // 'viewport' or 'document'
  const [radius, setRadius] = useState(12);
  const [opacity, setOpacity] = useState(0.65);
  const [hoveredClick, setHoveredClick] = useState(null);
  const canvasRef = useRef(null);

  // Standard preview dimensions
  const PREVIEW_WIDTH = 960;
  const PREVIEW_HEIGHT = 600;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < PREVIEW_WIDTH; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, PREVIEW_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < PREVIEW_HEIGHT; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(PREVIEW_WIDTH, y);
      ctx.stroke();
    }

    if (clicks.length === 0) return;

    // Render click points
    clicks.forEach((c) => {
      // Determine coordinates and scaling factors
      const rawX = coordMode === 'viewport' ? (c.clientX || 0) : (c.pageX || c.clientX || 0);
      const rawY = coordMode === 'viewport' ? (c.clientY || 0) : (c.pageY || c.clientY || 0);

      const refWidth = (coordMode === 'viewport' ? c.viewportWidth : c.pageWidth) || 1280;
      const refHeight = (coordMode === 'viewport' ? c.viewportHeight : c.pageHeight) || 800;

      // Scale to current canvas width and height
      const scaleX = PREVIEW_WIDTH / (refWidth > 0 ? refWidth : 1280);
      const scaleY = PREVIEW_HEIGHT / (refHeight > 0 ? refHeight : 800);

      const x = Math.min(PREVIEW_WIDTH, Math.max(0, rawX * scaleX));
      const y = Math.min(PREVIEW_HEIGHT, Math.max(0, rawY * scaleY));

      // Draw radial gradient heatmap dot
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(239, 68, 68, ${opacity})`);       // Red core
      grad.addColorStop(0.4, `rgba(249, 115, 22, ${opacity * 0.8})`); // Orange
      grad.addColorStop(0.7, `rgba(6, 182, 212, ${opacity * 0.5})`);  // Cyan
      grad.addColorStop(1, 'rgba(6, 182, 212, 0)');                    // Fade out

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Center point
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, opacity + 0.3)})`;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [clicks, coordMode, radius, opacity]);

  // Handle canvas mousemove for inspection
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || clicks.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check proximity to any rendered click
    let closest = null;
    let minDist = radius + 10;

    clicks.forEach((c) => {
      const rawX = coordMode === 'viewport' ? (c.clientX || 0) : (c.pageX || c.clientX || 0);
      const rawY = coordMode === 'viewport' ? (c.clientY || 0) : (c.pageY || c.clientY || 0);
      const refWidth = (coordMode === 'viewport' ? c.viewportWidth : c.pageWidth) || 1280;
      const refHeight = (coordMode === 'viewport' ? c.viewportHeight : c.pageHeight) || 800;

      const scaleX = PREVIEW_WIDTH / (refWidth > 0 ? refWidth : 1280);
      const scaleY = PREVIEW_HEIGHT / (refHeight > 0 ? refHeight : 800);

      const x = rawX * scaleX;
      const y = rawY * scaleY;

      const dist = Math.hypot(mouseX - x, mouseY - y);
      if (dist < minDist) {
        minDist = dist;
        closest = {
          ...c,
          canvasX: Math.round(x),
          canvasY: Math.round(y)
        };
      }
    });

    setHoveredClick(closest);
  };

  const handleMouseLeave = () => {
    setHoveredClick(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Notice Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 18px',
        background: 'rgba(6, 182, 212, 0.08)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.85rem',
        color: '#67e8f9'
      }}>
        <Info size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Normalized Coordinate Visualization:</strong> Click points recorded from diverse screen resolutions
          are normalized and scaled to this preview canvas based on recorded viewport dimensions and scroll offsets.
        </span>
      </div>

      {/* Heatmap Controls Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Coordinate Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={16} color="var(--accent-cyan)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Coordinate Mode:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setCoordMode('viewport')}
              className={`btn btn-sm ${coordMode === 'viewport' ? 'btn-primary' : 'btn-secondary'}`}
              id="btn-mode-viewport"
            >
              Viewport (clientX/Y)
            </button>
            <button
              onClick={() => setCoordMode('document')}
              className={`btn btn-sm ${coordMode === 'document' ? 'btn-primary' : 'btn-secondary'}`}
              id="btn-mode-document"
            >
              Document (pageX/Y)
            </button>
          </div>
        </div>

        {/* Sliders for Radius & Opacity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="var(--text-muted)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Radius: {radius}px</span>
            <input
              type="range"
              min="6"
              max="30"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-cyan)', width: '90px' }}
              id="slider-radius"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Opacity: {Math.round(opacity * 100)}%
            </span>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-cyan)', width: '90px' }}
              id="slider-opacity"
            />
          </div>

          <span className="badge badge-click" style={{ padding: '6px 12px' }}>
            {clicks.length} points plotted
          </span>
        </div>
      </div>

      {/* Canvas Container with Simulated Browser Frame */}
      <div style={{
        position: 'relative',
        background: '#0d1322',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden'
      }}>
        {/* Browser Top Window Bar */}
        <div style={{
          background: '#151d30',
          padding: '10px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 12px',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {pageUrl || 'http://localhost:3000/'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Canvas Scale: {PREVIEW_WIDTH} &times; {PREVIEW_HEIGHT}
          </span>
        </div>

        {/* Heatmap Canvas */}
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <canvas
            ref={canvasRef}
            width={PREVIEW_WIDTH}
            height={PREVIEW_HEIGHT}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              display: 'block',
              maxWidth: '100%',
              height: 'auto',
              cursor: 'crosshair',
              background: '#090d1a'
            }}
          />

          {/* Interactive Tooltip */}
          {hoveredClick && (
            <div style={{
              position: 'absolute',
              left: `${Math.min(PREVIEW_WIDTH - 220, hoveredClick.canvasX + 15)}px`,
              top: `${Math.min(PREVIEW_HEIGHT - 120, hoveredClick.canvasY + 15)}px`,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--accent-cyan)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '0.8rem',
              color: '#fff',
              pointerEvents: 'none',
              boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
              zIndex: 10,
              minWidth: '180px'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                &lt;{hoveredClick.targetTag || 'element'}&gt; {hoveredClick.targetId ? `#${hoveredClick.targetId}` : ''}
              </div>
              {hoveredClick.targetText && (
                <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Text: &ldquo;{hoveredClick.targetText}&rdquo;
                </div>
              )}
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                X: {hoveredClick.clientX}px &bull; Y: {hoveredClick.clientY}px
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Viewport: {hoveredClick.viewportWidth} &times; {hoveredClick.viewportHeight}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
