import { useState } from 'react'
import { saveRegistration } from '../lib/registration'

const LANGUAGES = [
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'english', label: 'English' },
]

const CROPS = [
  { value: 'rice', label: 'Rice' },
  { value: 'wheat', label: 'Wheat' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'soybean', label: 'Soybean' },
  { value: 'sugarcane', label: 'Sugarcane' },
]

const CROP_STAGES = [
  { value: 'sowing', label: 'Sowing' },
  { value: 'vegetative', label: 'Vegetative' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'harvest', label: 'Harvest' },
]

const LAND_UNITS = [
  { value: 'acre', label: 'Acre' },
  { value: 'hectare', label: 'Hectare' },
]

const MARKET_OPTIONS = [
  { value: 'nearest_mandi', label: 'Nearest mandi' },
  { value: 'local_trader', label: 'Local trader' },
  { value: 'cooperative', label: 'Cooperative' },
]

function SectionCard({ title, children }) {
  return (
    <section className="rounded-2xl bg-white shadow-agri border border-emerald-100/80 overflow-hidden">
      <h2 className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-lg font-bold">
        {title}
      </h2>
      <div className="p-6 space-y-5">{children}</div>
    </section>
  )
}

function Label({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-stone-700">
      {children}
      {required && <span className="text-amber-500 ml-0.5">*</span>}
    </label>
  )
}

export default function Registration({ session, onComplete, onSignOut }) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const mobileFromAuth = session?.mobile ?? ''

  const [form, setForm] = useState({
    farmerName: '',
    aadhaar: '',
    preferredLanguage: '',
    village: '',
    district: '',
    state: '',
    latitude: null,
    longitude: null,
    landArea: '',
    landUnit: 'acre',
    primaryCrop: '',
    cropStage: '',
    satelliteConsent: false,
    marketPreference: '',
  })

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const aadhaarNumericOnly = (v) => v.replace(/\D/g, '').slice(0, 12)
  const landAreaNumeric = (v) => v.replace(/[^\d.]/g, '').slice(0, 10)

  function getValidationErrors() {
    const errs = []
    if (!form.aadhaar.trim()) errs.push('Aadhaar number is required.')
    else if (form.aadhaar.length !== 12) errs.push('Aadhaar must be 12 digits.')
    if (!form.preferredLanguage) errs.push('Please select preferred language.')
    if (!form.village?.trim()) errs.push('Village is required.')
    if (!form.district?.trim()) errs.push('District is required.')
    if (!form.state?.trim()) errs.push('State is required.')
    if (form.landArea !== '' && (isNaN(Number(form.landArea)) || Number(form.landArea) <= 0))
      errs.push('Enter a valid land area.')
    if (!form.primaryCrop) errs.push('Primary crop is required.')
    if (!form.cropStage) errs.push('Current crop stage is required.')
    if (!form.marketPreference) errs.push('Market preference is required.')
    return errs
  }

  const [locating, setLocating] = useState(false)

  async function handleUseLocation() {
    setLocating(true)
    setSubmitError('')

    function saveCoords(lat, lng) {
      update('latitude', lat)
      update('longitude', lng)
      setLocating(false)
    }

    async function fallbackIP() {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const d = await res.json()
        if (d.latitude && d.longitude) {
          saveCoords(d.latitude, d.longitude)
          return
        }
      } catch {}
      setLocating(false)
    }

    if (!navigator.geolocation) {
      await fallbackIP()
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => saveCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        navigator.geolocation.getCurrentPosition(
          (pos) => saveCoords(pos.coords.latitude, pos.coords.longitude),
          () => { fallbackIP() },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')
    const errs = getValidationErrors()
    if (errs.length) {
      setSubmitError(errs[0])
      return
    }
    const userId = session?.id
    if (!userId) {
      setSubmitError('Please sign in again.')
      return
    }
    setSubmitting(true)
    const result = await saveRegistration(userId, {
      ...form,
      mobile: mobileFromAuth || null,
      landArea: form.landArea === '' ? null : form.landArea,
    })
    setSubmitting(false)
    if (!result.ok) {
      setSubmitError('Something went wrong. Please try again.')
      return
    }
    onComplete()
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-stone-50 to-amber-50/30" />
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-amber-200/20 to-transparent" />

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700">
                Complete your profile
              </h1>
              <p className="mt-2 text-stone-600 font-medium">
                A few details to personalise your experience.
              </p>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-sm font-medium transition-colors shrink-0"
            >
              Sign out
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium shadow-sm" role="alert">
                {submitError}
              </div>
            )}

            <SectionCard title="Basic identity">
              <div>
                <Label>Farmer name (optional)</Label>
                <input
                  type="text"
                  value={form.farmerName}
                  onChange={(e) => update('farmerName', e.target.value)}
                  placeholder="Your name"
                  className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg bg-stone-50/50"
                />
              </div>
              <div>
                <Label required>Aadhaar number</Label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.aadhaar}
                  onChange={(e) => update('aadhaar', aadhaarNumericOnly(e.target.value))}
                  placeholder="12 digits"
                  maxLength={12}
                  className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg bg-stone-50/50"
                />
                <p className="mt-1.5 text-sm text-stone-500">
                  Used only for identity verification and government scheme eligibility.
                </p>
              </div>
              <div>
                <Label>Mobile number</Label>
                <input
                  type="text"
                  value={mobileFromAuth}
                  readOnly
                  className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 bg-stone-100 text-stone-600 font-medium"
                />
              </div>
              <div>
                <Label required>Preferred language</Label>
                <select
                  value={form.preferredLanguage}
                  onChange={(e) => update('preferredLanguage', e.target.value)}
                  className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg bg-stone-50/50"
                >
                  <option value="">Select</option>
                  {LANGUAGES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </SectionCard>

            <SectionCard title="Location">
              <p className="text-sm text-stone-500 mb-4">
                Tap the button to capture your GPS coordinates (used for satellite monitoring, weather and mandi prices). Then enter your village, district and state below.
              </p>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className={`w-full py-4 rounded-xl border-2 font-bold transition-colors disabled:opacity-70 ${
                  form.latitude
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
                    : 'border-dashed border-red-400 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-500'
                }`}
              >
                {locating ? 'Getting location…' : form.latitude ? 'Location captured' : 'Use my current location (required)'}
              </button>
              {form.latitude && form.longitude && (
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  Lat: {Number(form.latitude).toFixed(4)}, Lng: {Number(form.longitude).toFixed(4)}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <Label required>Village</Label>
                  <input
                    type="text"
                    value={form.village}
                    onChange={(e) => update('village', e.target.value)}
                    placeholder="Village"
                    className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <Label required>District</Label>
                  <input
                    type="text"
                    value={form.district}
                    onChange={(e) => update('district', e.target.value)}
                    placeholder="District"
                    className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <Label required>State</Label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    placeholder="State"
                    className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Farm details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Total land area</Label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.landArea}
                    onChange={(e) => update('landArea', landAreaNumeric(e.target.value))}
                    placeholder="e.g. 2.5"
                    className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
                  />
                </div>
                <div>
                  <Label>Unit</Label>
                  <select
                    value={form.landUnit}
                    onChange={(e) => update('landUnit', e.target.value)}
                    className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
                  >
                    {LAND_UNITS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label required>Primary crop</Label>
                <select
                  value={form.primaryCrop}
                  onChange={(e) => update('primaryCrop', e.target.value)}
                  className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 text-lg bg-stone-50/50"
                >
                  <option value="">Select</option>
                  {CROPS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label required>Current crop stage</Label>
                <select
                  value={form.cropStage}
                  onChange={(e) => update('cropStage', e.target.value)}
                  className="mt-1.5 w-full px-4 py-3.5 rounded-xl border-2 border-stone-200 focus:ring-2 focus:ring-emerald-500 text-lg bg-stone-50/50"
                >
                  <option value="">Select</option>
                  {CROP_STAGES.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </SectionCard>

            <section className="rounded-2xl overflow-hidden border-2 border-teal-400 shadow-agri-lg">
              <div className="px-6 py-4 bg-gradient-to-r from-teal-700 via-emerald-700 to-green-700 text-white">
                <h2 className="text-lg font-bold">SAR Satellite Monitoring — Core MVP</h2>
                <p className="mt-1 text-teal-100 text-sm font-medium">Powered by government SAR satellites (works through clouds)</p>
              </div>
              <div className="p-6 bg-gradient-to-b from-teal-50 to-white space-y-4">
                <p className="text-stone-700 font-medium">
                  Your farm will be monitored using Synthetic Aperture Radar (SAR) for:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-teal-200">
                    <span className="text-xl">&#x1F327;&#xFE0F;</span>
                    <span className="text-stone-800 font-medium text-sm">Soil moisture estimation</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-teal-200">
                    <span className="text-xl">&#x1F69C;</span>
                    <span className="text-stone-800 font-medium text-sm">Flood / waterlogging detection</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-teal-200">
                    <span className="text-xl">&#x1F331;</span>
                    <span className="text-stone-800 font-medium text-sm">Crop growth consistency</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-teal-200">
                    <span className="text-xl">&#x23F1;&#xFE0F;</span>
                    <span className="text-stone-800 font-medium text-sm">Sowing date validation</span>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-teal-100/60 border border-teal-300">
                  <input
                    type="checkbox"
                    id="satellite"
                    checked={form.satelliteConsent}
                    onChange={(e) => update('satelliteConsent', e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-teal-400 text-teal-700 focus:ring-teal-500"
                  />
                  <div>
                    <label htmlFor="satellite" className="font-bold text-teal-900 cursor-pointer">
                      I consent to satellite-based crop monitoring
                    </label>
                    <p className="mt-1 text-sm text-teal-700">
                      No images of people or houses. Only agricultural data for your benefit.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <SectionCard title="Market preference">
              <Label required>Where do you usually sell your produce?</Label>
              <div className="mt-3 space-y-2">
                {MARKET_OPTIONS.map((o) => (
                  <label
                    key={o.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      form.marketPreference === o.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="market"
                      value={o.value}
                      checked={form.marketPreference === o.value}
                      onChange={() => update('marketPreference', o.value)}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-stone-800">{o.label}</span>
                  </label>
                ))}
              </div>
            </SectionCard>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 transition-all"
              >
                {submitting ? 'Saving…' : 'Save and continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
