const BASE_USL = "https://openaccess-api.clevelandart.org/api";
const PAGE_SIZE = 24;
const FIELDS = "id,title,creators,creation_date,creation_date_earliest,images";

export type Artwork = {
    id: number;
    title: string;
    artist: string | null;
    date: string | null;
    yearStart: number | null;
    imageUrl: string | null;
};

export type ArtworkList = {
    artworks: Artwork[];
    total: number;
    totalPages: number;

};

type CmaArtwork = {
    id: number;
    title: string;
    creators: { description: string }[];
    creation_date: string | null;
    creation_date_earliest: number | null;
    images: { web?: { url: string } } | null;
}

type CmaListResponse = {
    info: { total: number };
    data: CmaArtwork[];
};

function toArtwork(raw: CmaArtwork): Artwork {
    return {
        id: raw.id,
        title: raw.title,
        artist: raw.creators?.[0]?.description ?? null,
        date: raw.creation_date,
        yearStart: raw.creation_date_earliest,
        imageUrl: raw.images?.web?.url ?? null,
    };
}

export async function searchArtworks(query: string, page: number = 1): Promise<ArtworkList> {
    const params = new URLSearchParams({
        has_image: "1",
        limit: String(PAGE_SIZE),
        skip: String((page - 1) * PAGE_SIZE),
        fields: FIELDS,
    });
    if (query) params.set("q", query);
    
    const res = await fetch(`${BASE_USL}/artworks/?${params}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json: CmaListResponse = await res.json();

    return {
        artworks: json.data.map(toArtwork),
        total: json.info.total,
        totalPages: Math.ceil(json.info.total / PAGE_SIZE),
    };
}

