import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '\u2302' },
  { id: 'weather', label: 'Weather', icon: '\u2601' },
  { id: 'mandi', label: 'Mandi Prices', icon: '\u20B9' },
  { id: 'satellite', label: 'Satellite', icon: '\u{1F6F0}' },
  { id: 'advisory', label: 'Crop Advisory', icon: '\u{1F33E}' },
]

export default function Dashboard({ session, onSignOut }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!session?.id) return
    supabase
      .from('registrations')
      .select('*')
      .eq('user_id', session.id)
      .maybeSingle()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [session?.id])

  return (
    <div className="min-h-screen flex bg-stone-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 -ml-64 md:w-16 md:ml-0'
        } transition-all duration-300 bg-gradient-to-b from-emerald-800 via-emerald-900 to-teal-900 text-white flex flex-col shrink-0 overflow-hidden`}
      >
        {/* Brand */}
        <div className={`px-4 py-5 border-b border-white/10 ${sidebarOpen ? '' : 'md:px-2 md:py-4'}`}>
          <h1 className={`font-extrabold tracking-tight transition-all ${sidebarOpen ? 'text-xl' : 'text-xs text-center'}`}>
            {sidebarOpen ? 'BeejRakshak' : 'BR'}
          </h1>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-white/15 text-white'
                  : 'text-emerald-200 hover:bg-white/10 hover:text-white'
              } ${!sidebarOpen ? 'md:justify-center md:px-0' : ''}`}
            >
              <span className="text-lg shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onSignOut}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-emerald-200 hover:bg-white/10 hover:text-white transition-all ${!sidebarOpen ? 'md:justify-center md:px-0' : ''}`}
          >
            <span className="text-lg shrink-0">{'\u2190'}</span>
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-stone-200 shadow-sm px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 rounded-lg hover:bg-stone-100 text-stone-600"
            title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="text-right">
            <p className="text-sm font-semibold text-stone-800">{session?.name || 'Farmer'}</p>
            <p className="text-xs text-stone-500">{session?.mobile || ''}</p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-stone-800">Welcome back, {session?.name || 'Farmer'}</h2>

              {/* Quick stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Location"
                  value={profile?.village ? `${profile.village}, ${profile.district}` : 'Set up'}
                  accent="emerald"
                />
                <StatCard
                  label="Primary Crop"
                  value={profile?.primary_crop ? profile.primary_crop.charAt(0).toUpperCase() + profile.primary_crop.slice(1) : '—'}
                  accent="amber"
                />
                <StatCard
                  label="Crop Stage"
                  value={profile?.crop_stage ? profile.crop_stage.charAt(0).toUpperCase() + profile.crop_stage.slice(1) : '—'}
                  accent="teal"
                />
                <StatCard
                  label="Satellite"
                  value={profile?.satellite_consent ? 'Active' : 'Inactive'}
                  accent={profile?.satellite_consent ? 'emerald' : 'stone'}
                />
              </div>

              {/* Farm info */}
              {profile && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DashCard title="Farm Details">
                    <InfoRow label="Land Area" value={profile.land_area ? `${profile.land_area} ${profile.land_unit || ''}` : '—'} />
                    <InfoRow label="Primary Crop" value={profile.primary_crop || '—'} />
                    <InfoRow label="Crop Stage" value={profile.crop_stage || '—'} />
                    <InfoRow label="Language" value={profile.preferred_language || '—'} />
                  </DashCard>
                  <DashCard title="Location & Satellite">
                    <InfoRow label="Village" value={profile.village || '—'} />
                    <InfoRow label="District" value={profile.district || '—'} />
                    <InfoRow label="State" value={profile.state || '—'} />
                    <InfoRow label="Coordinates" value={profile.latitude ? `${Number(profile.latitude).toFixed(4)}, ${Number(profile.longitude).toFixed(4)}` : '—'} />
                    <InfoRow label="SAR Monitoring" value={profile.satellite_consent ? 'Enabled' : 'Disabled'} />
                  </DashCard>
                </div>
              )}

              {/* Market */}
              {profile?.market_preference && (
                <DashCard title="Market Preference">
                  <p className="text-stone-700 font-medium capitalize">{profile.market_preference.replace(/_/g, ' ')}</p>
                  <p className="mt-1 text-sm text-stone-500">Mandi price intelligence will be tailored to this preference.</p>
                </DashCard>
              )}
            </div>
          )}

          {activeTab === 'weather' && (
            <PlaceholderTab title="Weather Intelligence" description="Real-time weather alerts and forecasts for your farm location will appear here." />
          )}
          {activeTab === 'mandi' && (
            <PlaceholderTab title="Mandi Prices" description="Live mandi prices for your crop and nearest markets will appear here." />
          )}
          {activeTab === 'satellite' && (
            <PlaceholderTab title="SAR Satellite Monitoring" description="Soil moisture, crop stress, flood detection, and sowing validation data from government SAR satellites will appear here." />
          )}
          {activeTab === 'advisory' && (
            <PlaceholderTab title="Crop Advisory" description="Personalised crop advisories based on your location, crop, and growth stage will appear here." />
          )}
        </main>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    teal: 'bg-teal-50 border-teal-200 text-teal-800',
    stone: 'bg-stone-50 border-stone-200 text-stone-600',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colors[accent] || colors.stone}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-lg font-bold capitalize">{value}</p>
    </div>
  )
}

function DashCard({ title, children }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600">
        <h3 className="text-white font-bold">{title}</h3>
      </div>
      <div className="p-6 space-y-3">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-stone-800 capitalize">{value}</span>
    </div>
  )
}

function PlaceholderTab({ title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <span className="text-2xl text-emerald-600">{'\u{1F6A7}'}</span>
      </div>
      <h2 className="text-xl font-bold text-stone-800">{title}</h2>
      <p className="mt-2 text-stone-500 text-center max-w-md">{description}</p>
      <span className="mt-4 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">Coming soon</span>
    </div>
  )
}
