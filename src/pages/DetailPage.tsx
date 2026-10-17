import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { getArtwork } from "../api/cma";

function DetailPage() {
  const { id } = useParams();

  const { data: art, isPending, isError, error } = useQuery({
    queryKey: ["artwork", id],
    queryFn: () => getArtwork(id!),
    enabled: !!id,
  });

  if (isPending) return <p className="p-8">กำลังโหลด...</p>;
  if (isError) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <p className="text-red-600">ไม่พบผลงานนี้ ({error.message})</p>
        <Link to="/" className="mt-4 inline-block underline">← กลับหน้าหลัก</Link>
      </main>
    );
  }

  const facts = [
    { label: "ปี", value: art.date },
    { label: "ประเภท", value: art.type },
    { label: "เทคนิค", value: art.technique },
    { label: "ขนาด", value: art.measurements },
    { label: "แผนก", value: art.department },
  ];

  return (
    <main className="mx-auto max-w-6xl p-8">
      <Link to="/" className="text-sm text-stone-500 hover:text-stone-900">
        ← กลับไปหน้า Explore
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        {/* ฝั่งซ้าย: รูป */}
        <div>
          {art.imageUrl ? (
            <a href={art.printImageUrl ?? art.imageUrl} target="_blank" rel="noreferrer">
              <img src={art.imageUrl} alt={art.title} className="w-full rounded-lg" />
            </a>
          ) : (
            <div className="aspect-square w-full rounded-lg bg-stone-200" />
          )}
          <p className="mt-2 text-sm text-stone-500">คลิกที่ภาพเพื่อดูขนาดเต็ม</p>
        </div>

        {/* ฝั่งขวา: ข้อมูล */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-red-700">{art.type}</p>
          <h1 className="mt-2 text-3xl font-bold">{art.title}</h1>
          <p className="mt-2 text-stone-600">{art.artist}</p>

          <dl className="mt-6 divide-y divide-stone-200 border-y border-stone-200">
            {facts
              .filter((f) => f.value)
              .map((f) => (
                <div key={f.label} className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">{f.label}</dt>
                  <dd className="text-right">{f.value}</dd>
                </div>
              ))}
          </dl>

          <button
            disabled
            className="mt-6 w-full rounded-lg bg-red-700 px-4 py-3 font-semibold text-white opacity-50"
          >
            ☆ บันทึกลง My Gallery (เร็วๆ นี้)
          </button>

          {art.description && (
            <p className="mt-6 leading-relaxed text-stone-700">{art.description}</p>
          )}

          {art.didYouKnow && (
            <div className="mt-6 rounded-lg bg-amber-50 p-4">
              <p className="font-semibold">รู้หรือไม่?</p>
              <p className="mt-1 text-stone-700">{art.didYouKnow}</p>
            </div>
          )}

          {art.museumUrl && (
            <a
              href={art.museumUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-block text-red-700 underline"
            >
              ดูที่เว็บพิพิธภัณฑ์ →
            </a>
          )}
        </div>
      </div>
    </main>
  );
}

export default DetailPage;