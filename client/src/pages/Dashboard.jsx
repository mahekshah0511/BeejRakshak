import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/* ─── SVG icon paths ─── */
const ICONS = {
  home: 'M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  weather: 'M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z',
  mandi: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z',
  satellite: 'M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  advisory: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
  signout: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
  menu: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
  chevronLeft: 'M15.75 19.5L8.25 12l7.5-7.5',
  bell: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: ICONS.home },
  { id: 'weather', label: 'Weather', icon: ICONS.weather },
  { id: 'mandi', label: 'Mandi Prices', icon: ICONS.mandi },
  { id: 'satellite', label: 'SAR Monitor', icon: ICONS.satellite },
  { id: 'advisory', label: 'Crop Advisory', icon: ICONS.advisory },
]

function Icon({ d, className = 'w-5 h-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  )
}

export default function Dashboard({ session, onSignOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)
  const [mobileSidebar, setMobileSidebar] = useState(false)

  useEffect(() => {
    if (!session?.id) return
    supabase
      .from('registrations')
      .select('*')
      .eq('user_id', session.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [session?.id])

  const initials = (session?.name || 'F').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  function handleNav(id) {
    setActiveTab(id)
    setMobileSidebar(false)
  }

  return (
    <div className="min-h-screen flex bg-[#f8faf9]">
      {/* Mobile overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden" onClick={() => setMobileSidebar(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-40 top-0 bottom-0 flex flex-col bg-[#0c1f17] text-white transition-all duration-300 ease-out ${
          mobileSidebar ? 'left-0' : '-left-72 md:left-0'
        } ${sidebarOpen ? 'w-64' : 'w-[72px]'}`}
      >
        {/* Brand */}
        <div className={`flex items-center gap-3 border-b border-white/[0.06] transition-all duration-300 ${sidebarOpen ? 'px-5 py-5' : 'px-3 py-5 justify-center'}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-4.8 1.6-4.8 6.4 0 2.4.8 4 2.4 5.2V21h4.8v-6.4c1.6-1.2 2.4-2.8 2.4-5.2C16.8 4.6 13.2 3 12 3z" />
              <path strokeLinecap="round" d="M12 3v6" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="animate-fade-in">
              <h1 className="font-extrabold text-sm tracking-tight">BeejRakshak</h1>
              <p className="text-[10px] text-emerald-400/60 font-medium">AgriTech Platform</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                sidebarOpen ? 'px-3 py-3' : 'px-0 py-3 justify-center'
              } ${
                activeTab === item.id
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
              }`}
            >
              <div className="relative shrink-0">
                <Icon d={item.icon} className="w-5 h-5" />
                {activeTab === item.id && (
                  <div className="absolute -left-[19px] top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-400 rounded-r-full" style={sidebarOpen ? {} : { display: 'none' }} />
                )}
              </div>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Profile + signout */}
        <div className="border-t border-white/[0.06] p-3 space-y-2">
          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white/90 truncate">{session?.name || 'Farmer'}</p>
                <p className="text-[11px] text-white/40 truncate">{session?.mobile || ''}</p>
              </div>
            </div>
          )}
          <button
            onClick={onSignOut}
            className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-white/40 hover:bg-white/[0.05] hover:text-white/70 transition-all ${
              sidebarOpen ? 'px-3 py-2.5' : 'py-2.5 justify-center'
            }`}
          >
            <Icon d={ICONS.signout} className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-stone-200/60 px-4 md:px-6 py-3 flex items-center gap-4">
          {/* Mobile menu button */}
          <button onClick={() => setMobileSidebar(true)} className="md:hidden p-2 rounded-lg hover:bg-stone-100 text-stone-600">
            <Icon d={ICONS.menu} className="w-5 h-5" />
          </button>
          {/* Desktop collapse */}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="hidden md:flex p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <Icon d={sidebarOpen ? ICONS.chevronLeft : ICONS.menu} className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Notification bell */}
          <button className="relative p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
            <Icon d={ICONS.bell} className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-stone-200">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[11px] font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-stone-800 leading-tight">{session?.name || 'Farmer'}</p>
              <p className="text-[11px] text-stone-400">{session?.mobile || ''}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeTab === 'overview' && <OverviewTab session={session} profile={profile} greeting={greeting} />}
          {activeTab === 'weather' && <WeatherTab profile={profile} />}
          {activeTab === 'mandi' && <MandiTab profile={profile} />}
          {activeTab === 'satellite' && <SatelliteTab profile={profile} />}
          {activeTab === 'advisory' && <AdvisoryTab profile={profile} />}
        </main>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   OVERVIEW TAB
   ═══════════════════════════════════════════════════ */
function OverviewTab({ session, profile, greeting }) {
  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.04] rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/[0.03] rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm font-medium">{greeting}</p>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-1">{session?.name || 'Farmer'}</h2>
          <p className="text-emerald-100/70 text-sm mt-2 max-w-lg">
            Your farm intelligence dashboard. Monitor crops, weather, and market prices — all powered by SAR satellite data.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Location"
          value={profile?.village ? `${profile.village}` : 'Not set'}
          sub={profile?.district || ''}
          gradient="from-emerald-500 to-teal-600"
          iconPath={ICONS.home}
        />
        <StatCard
          label="Primary Crop"
          value={profile?.primary_crop ? cap(profile.primary_crop) : '—'}
          sub={profile?.crop_stage ? cap(profile.crop_stage) + ' stage' : ''}
          gradient="from-amber-500 to-orange-600"
          iconPath={ICONS.advisory}
        />
        <StatCard
          label="Land Area"
          value={profile?.land_area ? `${profile.land_area}` : '—'}
          sub={profile?.land_unit ? cap(profile.land_unit) + 's' : ''}
          gradient="from-blue-500 to-indigo-600"
          iconPath={ICONS.chart}
        />
        <StatCard
          label="SAR Monitor"
          value={profile?.satellite_consent ? 'Active' : 'Inactive'}
          sub={profile?.satellite_consent ? 'All systems go' : 'Enable in settings'}
          gradient={profile?.satellite_consent ? 'from-teal-500 to-cyan-600' : 'from-stone-400 to-stone-500'}
          iconPath={ICONS.satellite}
        />
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Farm Details */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-800">Farm Profile</h3>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Registered</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <InfoRow label="Farmer Name" value={profile?.farmer_name || session?.name || '—'} />
              <InfoRow label="Mobile" value={profile?.mobile || session?.mobile || '—'} />
              <InfoRow label="Language" value={profile?.preferred_language ? cap(profile.preferred_language) : '—'} />
              <InfoRow label="Primary Crop" value={profile?.primary_crop ? cap(profile.primary_crop) : '—'} />
              <InfoRow label="Crop Stage" value={profile?.crop_stage ? cap(profile.crop_stage) : '—'} />
              <InfoRow label="Land Area" value={profile?.land_area ? `${profile.land_area} ${profile.land_unit || ''}` : '—'} />
              <InfoRow label="Village" value={profile?.village || '—'} />
              <InfoRow label="District" value={profile?.district || '—'} />
              <InfoRow label="State" value={profile?.state || '—'} />
              <InfoRow label="Market" value={profile?.market_preference ? cap(profile.market_preference.replace(/_/g, ' ')) : '—'} />
            </div>
          </div>
        </div>

        {/* SAR Status */}
        <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h3 className="font-bold text-stone-800">SAR Satellite</h3>
          </div>
          <div className="p-6 flex flex-col items-center text-center">
            {/* Radar visual */}
            <div className="relative w-32 h-32 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-200" />
              <div className="absolute inset-4 rounded-full border border-emerald-200/60" />
              <div className="absolute inset-8 rounded-full border border-emerald-200/40" />
              <div className="absolute inset-[52px] rounded-full bg-emerald-500 animate-pulse" />
              {profile?.satellite_consent && (
                <div className="absolute inset-0 origin-center animate-radar">
                  <div className="w-1/2 h-0.5 bg-gradient-to-r from-emerald-500/80 to-transparent mt-[calc(50%-1px)] ml-[50%]" />
                </div>
              )}
            </div>
            <p className="font-bold text-stone-800">{profile?.satellite_consent ? 'Monitoring Active' : 'Monitoring Inactive'}</p>
            <p className="text-xs text-stone-500 mt-1">
              {profile?.latitude
                ? `Coordinates: ${Number(profile.latitude).toFixed(4)}, ${Number(profile.longitude).toFixed(4)}`
                : 'No coordinates captured'
              }
            </p>
            {profile?.satellite_consent && (
              <div className="mt-4 w-full space-y-2">
                <MiniGauge label="Soil Moisture" value={68} color="emerald" />
                <MiniGauge label="Crop Health" value={82} color="teal" />
                <MiniGauge label="Flood Risk" value={12} color="amber" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard
          title="Weather Alert"
          desc="Light rainfall expected in the next 48 hours. Good for sowing preparations."
          color="blue"
          icon="🌧️"
        />
        <InsightCard
          title="Market Update"
          desc={`${profile?.primary_crop ? cap(profile.primary_crop) : 'Crop'} prices holding steady at nearby mandis.`}
          color="amber"
          icon="📈"
        />
        <InsightCard
          title="Advisory"
          desc={profile?.crop_stage === 'sowing' ? 'Optimal window for sowing. Soil conditions favorable.' : 'Monitor crop growth regularly for best results.'}
          color="emerald"
          icon="💡"
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   WEATHER TAB
   ═══════════════════════════════════════════════════ */
function WeatherTab({ profile }) {
  const days = ['Today', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const temps = [32, 30, 28, 31, 33, 29, 27]
  const icons = ['☀️', '⛅', '🌧️', '⛅', '☀️', '🌧️', '⛅']

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Weather Intelligence</h2>
        <span className="text-xs text-stone-400">{profile?.village || 'Your location'}</span>
      </div>

      {/* Current weather */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-sky-200 text-sm font-medium">Current Weather</p>
            <div className="flex items-end gap-3 mt-2">
              <span className="text-6xl font-extrabold">32°</span>
              <span className="text-xl text-sky-200 mb-2">C</span>
            </div>
            <p className="text-sky-100 mt-1">Partly cloudy, humidity 65%</p>
          </div>
          <div className="text-right">
            <span className="text-7xl">⛅</span>
            <p className="text-sky-200 text-sm mt-2">Wind: 12 km/h NE</p>
          </div>
        </div>
      </div>

      {/* 7-day */}
      <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-800">7-Day Forecast</h3>
        </div>
        <div className="p-4 grid grid-cols-7 gap-2">
          {days.map((d, i) => (
            <div key={d} className={`flex flex-col items-center py-4 rounded-xl transition-all ${i === 0 ? 'bg-blue-50 border border-blue-200' : 'hover:bg-stone-50'}`}>
              <span className="text-xs font-semibold text-stone-500">{d}</span>
              <span className="text-2xl my-2">{icons[i]}</span>
              <span className="text-sm font-bold text-stone-800">{temps[i]}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* Farm weather insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniCard title="Rainfall" value="12mm" sub="Expected this week" accent="sky" />
        <MiniCard title="Humidity" value="65%" sub="Moderate levels" accent="blue" />
        <MiniCard title="UV Index" value="6.2" sub="High — protect crops" accent="amber" />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   MANDI TAB
   ═══════════════════════════════════════════════════ */
function MandiTab({ profile }) {
  const crop = profile?.primary_crop ? cap(profile.primary_crop) : 'Wheat'
  const prices = [
    { mandi: 'Ahmedabad APMC', price: '₹2,450', trend: 'up', change: '+₹120' },
    { mandi: 'Rajkot Market', price: '₹2,380', trend: 'down', change: '-₹40' },
    { mandi: 'Surat Mandi', price: '₹2,510', trend: 'up', change: '+₹85' },
    { mandi: 'Vadodara APMC', price: '₹2,420', trend: 'stable', change: '₹0' },
  ]

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Mandi Prices</h2>
        <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">{crop}</span>
      </div>

      {/* Price highlight */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.06] rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-amber-100 text-sm font-medium">Best price today for {crop}</p>
          <p className="text-4xl font-extrabold mt-2">₹2,510 <span className="text-lg font-medium text-amber-200">/ quintal</span></p>
          <p className="text-amber-100 text-sm mt-1">Surat Mandi — 45 km from your location</p>
        </div>
      </div>

      {/* Price table */}
      <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h3 className="font-bold text-stone-800">Nearby Mandis</h3>
        </div>
        <div className="divide-y divide-stone-100">
          {prices.map((p, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
              <div>
                <p className="font-semibold text-stone-800">{p.mandi}</p>
                <p className="text-xs text-stone-400 mt-0.5">{crop} per quintal</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-stone-800">{p.price}</p>
                <p className={`text-xs font-medium ${p.trend === 'up' ? 'text-emerald-600' : p.trend === 'down' ? 'text-red-500' : 'text-stone-400'}`}>
                  {p.change}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   SATELLITE TAB
   ═══════════════════════════════════════════════════ */
function SatelliteTab({ profile }) {
  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <h2 className="text-2xl font-bold text-stone-800">SAR Satellite Monitoring</h2>

      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0c1f17] to-[#0a2a1f] p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-1/2 right-8 -translate-y-1/2 w-40 h-40 opacity-30">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/50" />
          <div className="absolute inset-4 rounded-full border border-emerald-500/30" />
          <div className="absolute inset-8 rounded-full border border-emerald-500/20" />
          <div className="absolute inset-[68px] rounded-full bg-emerald-400 animate-pulse" />
          <div className="absolute inset-0 origin-center animate-radar">
            <div className="w-1/2 h-0.5 bg-gradient-to-r from-emerald-400/80 to-transparent mt-[calc(50%-1px)] ml-[50%]" />
          </div>
        </div>
        <div className="relative z-10 max-w-lg">
          <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Synthetic Aperture Radar</p>
          <h3 className="text-xl font-bold mt-2">Government SAR Satellites</h3>
          <p className="text-emerald-200/60 text-sm mt-2">Works through clouds, day and night. Monitoring your farm for soil moisture, crop health, flood risk, and sowing validation.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Soil Moisture', value: '68%', icon: '🌧️', color: 'emerald' },
          { label: 'Flood Risk', value: 'Low', icon: '🚜', color: 'blue' },
          { label: 'Crop Growth', value: 'Normal', icon: '🌱', color: 'teal' },
          { label: 'Sowing Valid.', value: 'Verified', icon: '⏱️', color: 'amber' },
        ].map((m, i) => (
          <div key={i} className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-5 hover-lift">
            <span className="text-2xl">{m.icon}</span>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mt-3">{m.label}</p>
            <p className="text-xl font-bold text-stone-800 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Gauges */}
      {profile?.satellite_consent && (
        <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-6">
          <h3 className="font-bold text-stone-800 mb-4">Farm Health Metrics</h3>
          <div className="space-y-4">
            <GaugeBar label="Soil Moisture" value={68} max={100} color="emerald" unit="%" />
            <GaugeBar label="NDVI (Crop Health)" value={0.72} max={1} color="teal" unit="" />
            <GaugeBar label="Flood Risk Index" value={12} max={100} color="blue" unit="%" />
            <GaugeBar label="Growth Consistency" value={85} max={100} color="amber" unit="%" />
          </div>
        </div>
      )}

      {profile?.latitude && (
        <div className="rounded-2xl bg-stone-50 border border-stone-200 p-6 text-center">
          <p className="text-sm text-stone-500">
            Farm coordinates: <span className="font-mono font-semibold text-stone-700">{Number(profile.latitude).toFixed(4)}, {Number(profile.longitude).toFixed(4)}</span>
          </p>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   ADVISORY TAB
   ═══════════════════════════════════════════════════ */
function AdvisoryTab({ profile }) {
  const crop = profile?.primary_crop ? cap(profile.primary_crop) : 'Crop'
  const stage = profile?.crop_stage ? cap(profile.crop_stage) : 'Growing'

  const advisories = [
    { priority: 'high', title: 'Irrigation Advisory', text: `Based on soil moisture data (68%), reduce irrigation frequency for ${crop}. SAR data shows adequate moisture levels.`, time: '2 hours ago' },
    { priority: 'medium', title: 'Pest Alert', text: `${stage} stage ${crop} crops in your region reporting increased pest activity. Monitor closely.`, time: '6 hours ago' },
    { priority: 'low', title: 'Fertilizer Timing', text: `Optimal window for nitrogen application begins in 3 days based on your crop stage and weather forecast.`, time: '1 day ago' },
    { priority: 'info', title: 'Government Scheme', text: 'PM-KISAN installment disbursement scheduled for next week. Ensure Aadhaar linkage is updated.', time: '2 days ago' },
  ]

  const colors = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-amber-300 bg-amber-50',
    low: 'border-blue-300 bg-blue-50',
    info: 'border-stone-300 bg-stone-50',
  }

  const dots = {
    high: 'bg-red-500',
    medium: 'bg-amber-500',
    low: 'bg-blue-500',
    info: 'bg-stone-400',
  }

  return (
    <div className="space-y-6 max-w-6xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-stone-800">Crop Advisory</h2>
        <span className="text-xs text-stone-400">{crop} — {stage} stage</span>
      </div>

      {/* Advisory hero */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/[0.04] rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-emerald-200 text-sm font-medium">Personalised for your farm</p>
          <h3 className="text-xl font-bold mt-1">AI-Powered Crop Intelligence</h3>
          <p className="text-emerald-100/70 text-sm mt-2">
            Advisories based on your location, crop ({crop}), growth stage ({stage}), SAR satellite data, and real-time weather.
          </p>
        </div>
      </div>

      {/* Advisories */}
      <div className="space-y-3">
        {advisories.map((a, i) => (
          <div key={i} className={`rounded-xl border-l-4 p-4 ${colors[a.priority]} hover-lift`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${dots[a.priority]}`} />
              <h4 className="font-bold text-stone-800 text-sm">{a.title}</h4>
              <span className="text-[10px] text-stone-400 ml-auto">{a.time}</span>
            </div>
            <p className="text-sm text-stone-600 ml-4">{a.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════ */
function StatCard({ label, value, sub, gradient, iconPath }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200/80 shadow-sm p-5 hover-lift group">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
        <Icon d={iconPath} className="w-5 h-5 text-white" />
      </div>
      <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-stone-800 mt-0.5 capitalize">{value}</p>
      {sub && <p className="text-xs text-stone-400 capitalize">{sub}</p>}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm py-2 border-b border-stone-100 last:border-0">
      <span className="text-stone-400">{label}</span>
      <span className="font-medium text-stone-700 capitalize">{value}</span>
    </div>
  )
}

function MiniGauge({ label, value, color }) {
  const bg = color === 'emerald' ? 'bg-emerald-100' : color === 'teal' ? 'bg-teal-100' : 'bg-amber-100'
  const fill = color === 'emerald' ? 'bg-emerald-500' : color === 'teal' ? 'bg-teal-500' : 'bg-amber-500'
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-stone-500">{label}</span>
        <span className="font-bold text-stone-700">{value}%</span>
      </div>
      <div className={`h-2 rounded-full ${bg}`}>
        <div className={`h-full rounded-full ${fill} transition-all duration-700`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function GaugeBar({ label, value, max, color, unit }) {
  const pct = (value / max) * 100
  const fills = { emerald: 'from-emerald-400 to-emerald-600', teal: 'from-teal-400 to-teal-600', blue: 'from-blue-400 to-blue-600', amber: 'from-amber-400 to-amber-600' }
  const bgs = { emerald: 'bg-emerald-100', teal: 'bg-teal-100', blue: 'bg-blue-100', amber: 'bg-amber-100' }
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-stone-500 font-medium">{label}</span>
        <span className="font-bold text-stone-700">{value}{unit}</span>
      </div>
      <div className={`h-3 rounded-full ${bgs[color] || 'bg-stone-100'}`}>
        <div className={`h-full rounded-full bg-gradient-to-r ${fills[color]} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function InsightCard({ title, desc, color, icon }) {
  const styles = {
    blue: 'border-blue-200 bg-blue-50',
    amber: 'border-amber-200 bg-amber-50',
    emerald: 'border-emerald-200 bg-emerald-50',
  }
  return (
    <div className={`rounded-2xl border p-5 ${styles[color] || styles.emerald} hover-lift`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <h4 className="font-bold text-stone-800 text-sm">{title}</h4>
      </div>
      <p className="text-sm text-stone-600">{desc}</p>
    </div>
  )
}

function MiniCard({ title, value, sub, accent }) {
  const styles = {
    sky: 'border-sky-200 bg-sky-50',
    blue: 'border-blue-200 bg-blue-50',
    amber: 'border-amber-200 bg-amber-50',
  }
  return (
    <div className={`rounded-2xl border p-5 ${styles[accent] || 'border-stone-200 bg-white'} hover-lift`}>
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-bold text-stone-800 mt-1">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{sub}</p>
    </div>
  )
}

function cap(s) {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
