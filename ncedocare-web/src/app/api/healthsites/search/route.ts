import { NextRequest, NextResponse } from 'next/server'

const HEALTHSITES_API_KEY = process.env.HEALTHSITES_API_KEY
const BASE_URL = 'https://healthsites.io/api/v3/facilities/'

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

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') ?? '').toLowerCase().trim()
    const country = searchParams.get('country') ?? 'South Africa'

    if (!HEALTHSITES_API_KEY) {
        return NextResponse.json(
            { error: 'Healthsites API key not configured on the server.' },
            { status: 500 }
        )
    }

    try {
        const url = `${BASE_URL}?api-key=${HEALTHSITES_API_KEY}&country=${encodeURIComponent(
            country
        )}&page=1&output=json&flat-properties=true`

        const res = await fetch(url, { next: { revalidate: 3600 } })

        if (!res.ok) {
            return NextResponse.json(
                { error: `Healthsites API error: ${res.status}` },
                { status: res.status }
            )
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

        return NextResponse.json({ facilities })
    } catch {
        return NextResponse.json(
            { error: 'Failed to reach Healthsites API.' },
            { status: 502 }
        )
    }
}