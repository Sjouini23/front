import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import config from '../../config.local';
 
// ─── Constants ───────────────────────────────────────────────────────────────
 
const SERVICE_LABELS = {
  'lavage-ville': 'Lavage Ville',
  'interieur': 'Intérieur',
  'exterieur': 'Extérieur',
  'complet-premium': 'Premium',
  'complet': 'Complet',
};
 
const SERVICE_DURATIONS = {
  'lavage-ville': 45,
  'interieur': 30,
  'exterieur': 20,
  'complet-premium': 60,
  'complet': 40,
};
 
const DAYS = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
 
const TICKER_MESSAGES = [
  'Réservation en ligne disponible sur notre site',
  'Produits écologiques certifiés pour tous nos services',
  'Service express disponible sur demande',
  'Lavage Ville : intérieur complet + extérieur standard',
  'Merci de votre confiance — JOUINI Car Wash',
];
 
const PRICES = [
  { key: 'lavage-ville', name: 'Lavage Ville', price: '15 DT', desc: 'Intérieur + Extérieur' },
  { key: 'interieur',    name: 'Intérieur',    price: '8 DT',  desc: 'Aspirateur + Sièges' },
  { key: 'exterieur',    name: 'Extérieur',    price: '8 DT',  desc: 'Carrosserie + Rinçage' },
  { key: 'complet-premium', name: 'Premium',   price: '60 DT', desc: 'Service complet haut de gamme', highlight: true },
];
 
// ─── Helpers ─────────────────────────────────────────────────────────────────
 
const getElapsedMinutes = (startTime) => {
  if (!startTime) return 0;
  const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 60000);
  return elapsed < 0 ? 0 : elapsed > 480 ? 0 : elapsed;
};
 
const getElapsedSeconds = (startTime) => {
  if (!startTime) return 0;
  const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  return elapsed < 0 ? 0 : elapsed;
};
 
const formatTimer = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};
 
const formatTimeStr = (dateStr) => {
  if (!dateStr) return '--:--';
  return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};
 
const getProgress = (serviceType, elapsedMin) => {
  const total = SERVICE_DURATIONS[serviceType] || 35;
  return Math.min(100, Math.round((elapsedMin / total) * 100));
};
 
const getTimerStatus = (serviceType, elapsedMin) => {
  const total = SERVICE_DURATIONS[serviceType] || 35;
  const pct = (elapsedMin / total) * 100;
  if (pct >= 100) return 'over';
  if (pct >= 80) return 'warn';
  return 'ok';
};
 
const getRemainingMin = (serviceType, elapsedMin) => {
  const total = SERVICE_DURATIONS[serviceType] || 35;
  return Math.max(0, total - elapsedMin);
};
 
const getStaffDisplay = (staff) => {
  if (!staff) return '';
  if (Array.isArray(staff)) return staff.join(', ');
  return String(staff);
};
 
// ─── Styles (inline — TV needs its own dark theme) ───────────────────────────
 
const S = {
  root: {
    background: '#080808',
    color: '#fff',
    fontFamily: "'Rajdhani', 'Segoe UI', system-ui, sans-serif",
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    background: '#0f0f0f',
    borderBottom: '1px solid #F59E0B',
    padding: '10px 28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 38, height: 38,
    background: '#F59E0B',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 20, fontWeight: 700, letterSpacing: 4, color: '#F59E0B' },
  logoSub: { fontSize: 9, color: '#6B7280', letterSpacing: 2, marginTop: 1 },
  clockWrap: { textAlign: 'center' },
  clock: { fontFamily: "'Share Tech Mono', 'Courier New', monospace", fontSize: 30, color: '#fff', letterSpacing: 2 },
  dateStr: { fontSize: 10, color: '#9CA3AF', letterSpacing: 1, marginTop: 2 },
  liveWrap: { textAlign: 'right' },
  liveDot: { width: 8, height: 8, background: '#10B981', borderRadius: '50%' },
  liveRow: { display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  liveText: { fontSize: 11, letterSpacing: 2, color: '#10B981', fontWeight: 600 },
  statsRow: { display: 'flex', gap: 18, marginTop: 4, justifyContent: 'flex-end' },
  statVal: { fontSize: 18, fontWeight: 700, color: '#fff', textAlign: 'right' },
  statLbl: { fontSize: 9, color: '#6B7280', letterSpacing: 1, textAlign: 'right' },
 
  body: { flex: 1, padding: '14px 28px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' },
  sectionLabel: {
    fontSize: 10, letterSpacing: 3, color: '#F59E0B', fontWeight: 700,
    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
  },
  sectionLine: { flex: 1, height: 1, background: 'linear-gradient(to right, rgba(245,158,11,0.3), transparent)' },
 
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
  card: {
    background: '#141414', border: '1px solid #222', borderRadius: 10,
    padding: '12px 14px', position: 'relative', overflow: 'hidden',
  },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#F59E0B', borderRadius: '10px 10px 0 0' },
  cardAccentGreen: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#10B981', borderRadius: '10px 10px 0 0' },
  cardAccentRed: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#EF4444', borderRadius: '10px 10px 0 0' },
  cardPlate: { fontFamily: "'Share Tech Mono', monospace", fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: 2 },
  cardBrand: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  cardServiceBadge: {
    display: 'inline-block',
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
    color: '#F59E0B', fontSize: 10, letterSpacing: 1,
    padding: '2px 8px', borderRadius: 4, marginTop: 8, fontWeight: 600,
  },
  cardStaff: { fontSize: 11, color: '#6B7280', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 },
  cardTimerOk: { fontFamily: "'Share Tech Mono', monospace", fontSize: 24, color: '#10B981', marginTop: 8, fontWeight: 700 },
  cardTimerWarn: { fontFamily: "'Share Tech Mono', monospace", fontSize: 24, color: '#F59E0B', marginTop: 8, fontWeight: 700 },
  cardTimerOver: { fontFamily: "'Share Tech Mono', monospace", fontSize: 24, color: '#EF4444', marginTop: 8, fontWeight: 700 },
  progressWrap: { marginTop: 8, height: 3, background: '#222', borderRadius: 2, overflow: 'hidden' },
  progressOk: { height: '100%', background: '#10B981', borderRadius: 2, transition: 'width 0.5s' },
  progressWarn: { height: '100%', background: '#F59E0B', borderRadius: 2, transition: 'width 0.5s' },
  progressOver: { height: '100%', background: '#EF4444', borderRadius: 2, transition: 'width 0.5s' },
  cardEta: { fontSize: 10, color: '#6B7280', marginTop: 4, display: 'flex', justifyContent: 'space-between' },
 
  doneGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  doneCard: { background: '#141414', border: '1px solid #222', borderRadius: 10, padding: '10px 12px', position: 'relative', overflow: 'hidden' },
  donePlate: { fontFamily: "'Share Tech Mono', monospace", fontSize: 14, color: '#fff', letterSpacing: 1 },
  doneService: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  doneDuration: { fontSize: 12, color: '#10B981', marginTop: 6, fontWeight: 600, fontFamily: 'monospace' },
  doneBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#10B981', fontSize: 9, padding: '2px 6px', borderRadius: 4, marginTop: 4, letterSpacing: 1,
  },
 
  adWrap: { background: '#141414', border: '1px solid #222', borderRadius: 10, padding: '16px 20px', textAlign: 'center', marginBottom: 10 },
  adTitle: { fontSize: 26, fontWeight: 700, color: '#F59E0B', letterSpacing: 2 },
  adSub: { fontSize: 12, color: '#9CA3AF', marginTop: 4, letterSpacing: 1 },
  adGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  adItem: { background: '#0f0f0f', border: '1px solid #222', borderRadius: 10, padding: '14px 10px', textAlign: 'center' },
  adItemHL: { background: '#0f0f0f', border: '1px solid rgba(245,158,11,0.4)', borderRadius: 10, padding: '14px 10px', textAlign: 'center' },
  adItemName: { fontSize: 11, color: '#9CA3AF', letterSpacing: 1 },
  adItemNameHL: { fontSize: 11, color: '#F59E0B', letterSpacing: 1 },
  adItemPrice: { fontSize: 22, fontWeight: 700, color: '#F59E0B', marginTop: 4 },
  adItemDesc: { fontSize: 10, color: '#4B5563', marginTop: 2 },
 
  emptyWrap: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyIcon: { width: 56, height: 56, background: '#141414', border: '1px solid #222', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 20, fontWeight: 700, color: '#6B7280', letterSpacing: 1 },
  emptyReady: { display: 'flex', alignItems: 'center', gap: 6 },
 
  footer: { flexShrink: 0 },
  navRow: { display: 'flex', gap: 6, justifyContent: 'center', padding: '6px 0 4px' },
  navDot: { width: 6, height: 6, borderRadius: '50%', background: '#222', transition: 'all 0.3s', cursor: 'default' },
  navDotActive: { width: 18, height: 6, borderRadius: 3, background: '#F59E0B', transition: 'all 0.3s' },
  tickerWrap: { background: '#0f0f0f', borderTop: '1px solid #222', padding: '8px 28px', display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' },
  tickerLabel: { background: '#F59E0B', color: '#080808', fontSize: 9, letterSpacing: 2, padding: '3px 8px', borderRadius: 3, fontWeight: 700, flexShrink: 0 },
  tickerText: { fontSize: 12, color: '#9CA3AF', letterSpacing: 0.5, whiteSpace: 'nowrap' },
 
  loadWrap: { minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#fff', fontFamily: "'Rajdhani', sans-serif" },
  loadIcon: { width: 60, height: 60, background: '#F59E0B', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  errWrap: { minHeight: '100vh', background: '#080808', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#fff', fontFamily: "'Rajdhani', sans-serif" },
  retryBtn: { marginTop: 8, padding: '10px 28px', background: '#F59E0B', color: '#080808', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', letterSpacing: 1 },
};
 
// ─── Sub-components ───────────────────────────────────────────────────────────
 
const UserIcon = () => (
  <svg width="11" height="11" fill="none" stroke="#6B7280" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
 
const CheckIcon = () => (
  <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
 
const CarIcon = ({ size = 24, color = '#6B7280' }) => (
  <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
    <path d="M5 17H3a2 2 0 01-2-2V9l3-5h14l3 5v6a2 2 0 01-2 2h-2"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="16.5" cy="17.5" r="2.5"/>
  </svg>
);
 
// Live timer hook — re-renders every second
const useLiveClock = () => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return tick;
};
 
// Service card with live timer
const ServiceCard = ({ service }) => {
  useLiveClock();
  const elapsed = getElapsedMinutes(service.start_time);
  const elapsedSec = getElapsedSeconds(service.start_time);
  const progress = getProgress(service.service_type, elapsed);
  const status = getTimerStatus(service.service_type, elapsed);
  const remaining = getRemainingMin(service.service_type, elapsed);
 
  const accentStyle = status === 'over' ? S.cardAccentRed : status === 'warn' ? S.cardAccent : S.cardAccentGreen;
  const timerStyle = status === 'over' ? S.cardTimerOver : status === 'warn' ? S.cardTimerWarn : S.cardTimerOk;
  const barStyle = status === 'over' ? S.progressOver : status === 'warn' ? S.progressWarn : S.progressOk;
  const etaColor = status === 'over' ? '#EF4444' : status === 'warn' ? '#F59E0B' : '#10B981';
  const etaText = status === 'over' ? 'En finition' : `~${remaining} min restant`;
 
  const brand = [service.vehicle_brand, service.vehicle_model].filter(Boolean).join(' ');
  const staff = getStaffDisplay(service.staff);
  const label = SERVICE_LABELS[service.service_type] || service.service_type;
 
  return (
    <div style={S.card}>
      <div style={accentStyle} />
      <div style={S.cardPlate}>{service.immatriculation || 'N/A'}</div>
      {brand && <div style={S.cardBrand}>{brand}</div>}
      <div style={S.cardServiceBadge}>{label.toUpperCase()}</div>
      {staff && (
        <div style={S.cardStaff}>
          <UserIcon />
          {staff}
        </div>
      )}
      <div style={timerStyle}>{formatTimer(elapsedSec)}</div>
      <div style={S.progressWrap}>
        <div style={{ ...barStyle, width: `${progress}%` }} />
      </div>
      <div style={S.cardEta}>
        <span>Démarré {formatTimeStr(service.start_time)}</span>
        <span style={{ color: etaColor }}>{etaText}</span>
      </div>
    </div>
  );
};
 
// Completed service card
const DoneCard = ({ service }) => {
  const plate = service.licensePlate || service.immatriculation || 'N/A';
  const label = SERVICE_LABELS[service.serviceType || service.service_type] || 'Service';
  const staffStr = getStaffDisplay(service.staff);
  const dur = service.totalDuration || service.duration;
  const durStr = dur ? formatTimer(dur) : '--:--:--';
 
  return (
    <div style={S.doneCard}>
      <div style={S.cardAccentGreen} />
      <div style={S.donePlate}>{plate}</div>
      <div style={S.doneService}>{label}{staffStr ? ` • ${staffStr}` : ''}</div>
      <div style={S.doneDuration}>{durStr}</div>
      <div style={S.doneBadge}><CheckIcon /> TERMINÉ</div>
    </div>
  );
};
 
// ─── Main Views ───────────────────────────────────────────────────────────────
 
const ServiceView = ({ services, completedCount }) => (
  <>
    <div style={S.sectionLabel}>
      SERVICES EN COURS
      <div style={S.sectionLine} />
      <span style={{ color: '#6B7280', fontSize: 10, letterSpacing: 1 }}>{services.length} actif{services.length !== 1 ? 's' : ''}</span>
    </div>
    {services.length > 0 ? (
      <div style={S.cardsGrid}>
        {services.slice(0, 6).map(s => <ServiceCard key={s.id} service={s} />)}
      </div>
    ) : (
      <div style={S.emptyWrap}>
        <div style={S.emptyIcon}><CarIcon size={28} color="#4B5563" /></div>
        <div style={S.emptyTitle}>AUCUN SERVICE ACTIF</div>
        <div style={S.emptyReady}>
          <div style={{ width: 8, height: 8, background: '#10B981', borderRadius: '50%' }} />
          <span style={{ fontSize: 11, color: '#10B981', letterSpacing: 2 }}>SYSTÈME PRÊT</span>
        </div>
      </div>
    )}
  </>
);
 
const CompletionView = ({ services }) => (
  <>
    <div style={S.sectionLabel}>
      SERVICES TERMINÉS AUJOURD'HUI
      <div style={S.sectionLine} />
      <span style={{ color: '#6B7280', fontSize: 10, letterSpacing: 1 }}>{services.length} terminé{services.length !== 1 ? 's' : ''}</span>
    </div>
    {services.length > 0 ? (
      <div style={S.doneGrid}>
        {services.slice(0, 8).map((s, i) => <DoneCard key={s.id || i} service={s} />)}
      </div>
    ) : (
      <div style={S.emptyWrap}>
        <div style={S.emptyIcon}><CheckIcon /></div>
        <div style={S.emptyTitle}>AUCUN SERVICE TERMINÉ</div>
      </div>
    )}
  </>
);
 
const AdvertisingView = () => (
  <>
    <div style={S.adWrap}>
      <div style={S.adTitle}>NOS SERVICES PREMIUM</div>
      <div style={S.adSub}>QUALITÉ PROFESSIONNELLE • PRODUITS CERTIFIÉS • RÉSULTATS GARANTIS</div>
    </div>
    <div style={S.adGrid}>
      {PRICES.map(p => (
        <div key={p.key} style={p.highlight ? S.adItemHL : S.adItem}>
          <div style={p.highlight ? S.adItemNameHL : S.adItemName}>{p.name.toUpperCase()}</div>
          <div style={S.adItemPrice}>{p.price}</div>
          <div style={S.adItemDesc}>{p.desc}</div>
        </div>
      ))}
    </div>
  </>
);
 
// ─── Main Component ───────────────────────────────────────────────────────────
 
const VIEWS = ['service', 'completion', 'advertising'];
const VIEW_TIMINGS = { service: 15000, completion: 10000, advertising: 8000 };
 
const TVDisplaySystem = () => {
  const [currentView, setCurrentView] = useState('service');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentServices, setCurrentServices] = useState([]);
  const [completedServices, setCompletedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tickerIdx, setTickerIdx] = useState(0);
  const switchTimerRef = useRef(null);
  const abortRef = useRef(null);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
 
  // Ticker
  useEffect(() => {
    const id = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_MESSAGES.length), 6000);
    return () => clearInterval(id);
  }, []);
 
  // Data fetch
  const fetchTVData = useCallback(async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) { setError('Authentification requise'); setLoading(false); return; }

      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      const [activeRes, completedRes] = await Promise.all([
        fetch(`${config.API_BASE_URL}/api/tv/current-services`, { headers, signal }),
        fetch(`${config.API_BASE_URL}/api/washes?status=completed&date=today`, { headers, signal }),
      ]);
 
      if (!activeRes.ok) throw new Error('Impossible de récupérer les services actifs');
 
      const activeData = await activeRes.json();
      const completedData = completedRes.ok ? await completedRes.json() : [];
 
      setCurrentServices(Array.isArray(activeData) ? activeData : []);
      setCompletedServices(Array.isArray(completedData) ? completedData : []);
      setError(null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('TV fetch error:', err);
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);
 
  useEffect(() => {
    fetchTVData();
    const id = setInterval(fetchTVData, 5000);
    return () => { clearInterval(id); abortRef.current?.abort(); };
  }, [fetchTVData]);
 
  // View cycling
  useEffect(() => {
    clearTimeout(switchTimerRef.current);
    switchTimerRef.current = setTimeout(() => {
      setCurrentView(prev => {
        const idx = VIEWS.indexOf(prev);
        return VIEWS[(idx + 1) % VIEWS.length];
      });
    }, VIEW_TIMINGS[currentView]);
    return () => clearTimeout(switchTimerRef.current);
  }, [currentView]);
 
  // Stats
  const stats = useMemo(() => ({
    active: currentServices.length,
    completed: completedServices.length,
  }), [currentServices, completedServices]);
 
  const clockStr = currentTime.toLocaleTimeString('fr-FR');
  const dateStr = `${DAYS[currentTime.getDay()]} ${currentTime.getDate()} ${MONTHS[currentTime.getMonth()]} ${currentTime.getFullYear()}`;
 
  // ── Loading ──
  if (loading) return (
    <div style={S.loadWrap}>
      <div style={S.loadIcon}>
        <CarIcon size={30} color="#080808" />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 3, color: '#F59E0B' }}>JOUINI CAR WASH</div>
      <div style={{ fontSize: 12, color: '#6B7280', letterSpacing: 2 }}>CONNEXION EN COURS...</div>
    </div>
  );
 
  // ── Error ──
  if (error) return (
    <div style={S.errWrap}>
      <div style={{ ...S.loadIcon, background: '#EF4444' }}>
        <span style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>!</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#EF4444', letterSpacing: 1 }}>ERREUR DE CONNEXION</div>
      <div style={{ fontSize: 12, color: '#6B7280' }}>{error}</div>
      <button style={S.retryBtn} onClick={fetchTVData}>RÉESSAYER</button>
    </div>
  );
 
  // ── Main ──
  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.logoWrap}>
          <div style={S.logoIcon}><CarIcon size={20} color="#080808" /></div>
          <div>
            <div style={S.logoText}>JOUINI</div>
            <div style={S.logoSub}>CAR WASH SERVICE</div>
          </div>
        </div>
 
        <div style={S.clockWrap}>
          <div style={S.clock}>{clockStr}</div>
          <div style={S.dateStr}>{dateStr}</div>
        </div>
 
        <div style={S.liveWrap}>
          <div style={S.liveRow}>
            <div style={{ ...S.liveDot, animation: 'tvpulse 1.5s infinite' }} />
            <div style={S.liveText}>EN DIRECT</div>
          </div>
          <div style={S.statsRow}>
            <div>
              <div style={S.statVal}>{stats.active}</div>
              <div style={S.statLbl}>ACTIFS</div>
            </div>
            <div>
              <div style={S.statVal}>{stats.completed}</div>
              <div style={S.statLbl}>TERMINÉS</div>
            </div>
          </div>
        </div>
      </div>
 
      {/* Body */}
      <div style={S.body}>
        {currentView === 'service' && (
          <ServiceView services={currentServices} completedCount={stats.completed} />
        )}
        {currentView === 'completion' && (
          <CompletionView services={completedServices} />
        )}
        {currentView === 'advertising' && (
          <AdvertisingView />
        )}
      </div>
 
      {/* Footer */}
      <div style={S.footer}>
        <div style={S.navRow}>
          {VIEWS.map((v, i) => (
            <div key={v} style={currentView === v ? S.navDotActive : S.navDot} />
          ))}
        </div>
        <div style={S.tickerWrap}>
          <div style={S.tickerLabel}>INFO</div>
          <div style={S.tickerText}>{TICKER_MESSAGES[tickerIdx]}</div>
        </div>
      </div>
 
      <style>{`
        @keyframes tvpulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};
 
export default TVDisplaySystem;