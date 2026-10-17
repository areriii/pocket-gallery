const BASE_URL = "https://openaccess-api.clevelandart.org/api";
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
    images: { web?: { url: string }; print?: { url: string } } | null;
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
    
    const res = await fetch(`${BASE_URL}/artworks/?${params}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json: CmaListResponse = await res.json();

    return {
        artworks: json.data.map(toArtwork),
        total: json.info.total,
        totalPages: Math.ceil(json.info.total / PAGE_SIZE),
    };
}

// ข้อมูลเต็มสำหรับหน้า Detail = ข้อมูลพื้นฐาน + ฟิลด์เพิ่มเติม
export type ArtworkDetail = Artwork & {
  type: string | null;
  technique: string | null;
  measurements: string | null;
  department: string | null;
  description: string | null;
  didYouKnow: string | null;
  printImageUrl: string | null;
  museumUrl: string | null;
};

type CmaArtworkDetail = CmaArtwork & {
  type: string | null;
  technique: string | null;
  measurements: string | null;
  department: string | null;
  description: string | null;
  did_you_know: string | null;
  url: string | null;
};

export async function getArtwork(id: string): Promise<ArtworkDetail> {
  const res = await fetch(`${BASE_URL}/artworks/${id}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: { data: CmaArtworkDetail } = await res.json();
  const raw = json.data;

  return {
    ...toArtwork(raw),
    type: raw.type ?? null,
    technique: raw.technique ?? null,
    measurements: raw.measurements ?? null,
    department: raw.department ?? null,
    description: raw.description ?? null,
    didYouKnow: raw.did_you_know ?? null,
    printImageUrl: raw.images?.print?.url ?? null,
    museumUrl: raw.url ?? null,
  };
}
