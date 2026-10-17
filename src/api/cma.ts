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

export type SearchOptions = {
    query: string;
    type?: string;
    page?: number;
}

export async function searchArtworks({
    query = "",
    type = "",
    page = 1,
}:   SearchOptions): Promise<ArtworkList> {
    const params = new URLSearchParams({
        has_image: "1",
        limit: String(PAGE_SIZE),
        skip: String((page - 1) * PAGE_SIZE),
        fields: FIELDS,
    });
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    
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

// ===== สำหรับเกม Guess the Year =====
export type GuessArtwork = Artwork & {
  yearStart: number;
  yearEnd: number;
};

type CmaGuessArtwork = CmaArtwork & { creation_date_latest: number | null };

const GUESS_FILTERS = {
  type: "Painting",
  has_image: "1",
  created_after: "1400",
  created_before: "2000",
};

export async function getGuessArtworks(count = 5): Promise<GuessArtwork[]> {
  // 1) ถามก่อนว่ามีทั้งหมดกี่ชิ้น (ขอแค่ 1 ชิ้น เพื่อดู info.total)
  const countParams = new URLSearchParams({ ...GUESS_FILTERS, limit: "1", fields: "id" });
  const countRes = await fetch(`${BASE_URL}/artworks/?${countParams}`);
  if (!countRes.ok) throw new Error(`API error: ${countRes.status}`);
  const total: number = (await countRes.json()).info.total;

  // 2) สุ่มตำแหน่งเริ่ม แล้วดึงมา 100 ชิ้น
  const skip = Math.floor(Math.random() * Math.max(1, total - 100));
  const params = new URLSearchParams({
    ...GUESS_FILTERS,
    limit: "100",
    skip: String(skip),
    fields: `${FIELDS},creation_date_latest`,
  });
  const res = await fetch(`${BASE_URL}/artworks/?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: { data: CmaGuessArtwork[] } = await res.json();

  // 3) เก็บเฉพาะงานที่มีรูป และระบุปีชัด (ช่วงห่างไม่เกิน 5 ปี)
  const candidates = json.data.filter(
    (a) =>
      a.creation_date_earliest !== null &&
      a.creation_date_latest !== null &&
      a.creation_date_latest - a.creation_date_earliest <= 5 &&
      a.images?.web?.url
  );

  // 4) สลับลำดับแบบสุ่ม แล้วเลือกมา count ชิ้น
  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((a) => ({
    ...toArtwork(a),
    yearStart: a.creation_date_earliest!,
    yearEnd: a.creation_date_latest!,
  }));
}
