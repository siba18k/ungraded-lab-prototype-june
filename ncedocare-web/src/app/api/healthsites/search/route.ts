import { NextRequest, NextResponse } from 'next/server'

const HEALTHSITES_API_KEY = process.env.HEALTHSITES_API_KEY
const BASE_URL = 'https://healthsites.io/api/v3/facilities/'

const MOCK_FACILITIES = [
    { osmId: 'mock-1', osmType: 'node', name: 'Netcare Milpark Hospital', amenity: 'hospital', address: '9 Guild Rd, Parktown West, Johannesburg', lat: -26.1857, lng: 28.0257 },
    { osmId: 'mock-2', osmType: 'node', name: 'Groote Schuur Hospital', amenity: 'hospital', address: 'Main Rd, Observatory, Cape Town', lat: -33.9422, lng: 18.4632 },
    { osmId: 'mock-3', osmType: 'node', name: 'Chris Hani Baragwanath Academic Hospital', amenity: 'hospital', address: '26 Chris Hani Rd, Diepkloof, Soweto', lat: -26.2637, lng: 27.9384 },
    { osmId: 'mock-4', osmType: 'node', name: 'Life Fourways Hospital', amenity: 'hospital', address: 'Cedar Rd, Fourways, Sandton', lat: -26.0154, lng: 28.0088 },
    { osmId: 'mock-5', osmType: 'node', name: 'Steve Biko Academic Hospital', amenity: 'hospital', address: 'Malherbe St, Pretoria', lat: -25.7343, lng: 28.1878 },
    { osmId: 'mock-6', osmType: 'node', name: 'Charlotte Maxeke Johannesburg Academic Hospital', amenity: 'hospital', address: 'Jubilee Rd, Parktown, Johannesburg', lat: -26.1815, lng: 28.0447 },
    { osmId: 'mock-7', osmType: 'node', name: 'Tygerberg Hospital', amenity: 'hospital', address: 'Francie van Zijl Dr, Parow, Cape Town', lat: -33.9006, lng: 18.6009 },
    { osmId: 'mock-8', osmType: 'node', name: 'Inkosi Albert Luthuli Central Hospital', amenity: 'hospital', address: '800 Vusi Mzimela Rd, Durban', lat: -29.8353, lng: 30.9204 },
]

interface HealthsiteRaw {
    osm_id?: number | string
    osm_type?: string
    name?: string
    'name:en'?: string
    amenity?: string
    'addr:full'?: string
    'addr:street'?: string
    'addr:city'?: string
    lat?: number
    lng?: number
    properties?: HealthsiteRaw
    geometry?: { coordinates?: [number, number] }
}

function mockResponse(q: string, reason: string) {
    const filtered = MOCK_FACILITIES.filter(
        (f) => q === '' || f.name.toLowerCase().includes(q)
    )
    return NextResponse.json({ facilities: filtered, source: 'mock', notice: reason })
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') ?? '').toLowerCase().trim()
    const country = searchParams.get('country') ?? 'South Africa'

    if (!HEALTHSITES_API_KEY) {
        return mockResponse(q, 'No API key configured — showing sample data.')
    }

    try {
        const url = `${BASE_URL}?api-key=${HEALTHSITES_API_KEY}&country=${encodeURIComponent(
            country
        )}&page=1&output=json&flat-properties=true`

        const res = await fetch(url, { next: { revalidate: 3600 } })

        if (res.status === 401 || res.status === 403) {
            return mockResponse(
                q,
                'Healthsites API key not yet active (pending approval) — showing sample data.'
            )
        }

        if (!res.ok) {
            return mockResponse(q, `Healthsites API returned ${res.status} — showing sample data.`)
        }

        const data = await res.json()
        const items: HealthsiteRaw[] = Array.isArray(data)
            ? data
            : (data as { features?: HealthsiteRaw[] }).features ?? []

        const facilities = items
            .map((item) => {
                const props = item.properties ?? item
                const coords = item.geometry?.coordinates
                return {
                    osmId: String(props.osm_id ?? item.osm_id ?? ''),
                    osmType: props.osm_type ?? item.osm_type ?? 'node',
                    name: props.name || props['name:en'] || 'Unnamed facility',
                    amenity: props.amenity ?? 'hospital',
                    address:
                        props['addr:full'] ||
                        [props['addr:street'], props['addr:city']]
                            .filter(Boolean)
                            .join(', '),
                    lat: coords?.[1] ?? props.lat ?? 0,
                    lng: coords?.[0] ?? props.lng ?? 0,
                }
            })
            .filter((f) => f.osmId && (q === '' || f.name.toLowerCase().includes(q)))
            .slice(0, 25)

        return NextResponse.json({ facilities, source: 'live' })
    } catch {
        return mockResponse(q, 'Could not reach Healthsites API — showing sample data.')
    }
}