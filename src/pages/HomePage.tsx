import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router";
import { searchArtworks } from "../api/cma";
import { useDebounce } from "../hooks/useDebounce";

const TYPES = [
  { value: "", label: "ทั้งหมด" },
  { value: "Painting", label: "ภาพวาด" },
  { value: "Print", label: "ภาพพิมพ์" },
  { value: "Drawing", label: "ภาพลายเส้น" },
  { value: "Photograph", label: "ภาพถ่าย" },
  { value: "Sculpture", label: "ประติมากรรม" },
];

function HomePage() {
  // 1) อ่านค่าจาก URL
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  // 2) ช่องพิมพ์ + debounce
  const [input, setInput] = useState(query);
  const debouncedInput = useDebounce(input, 400);

  useEffect(() => {
    if (debouncedInput === query) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedInput) next.set("q", debouncedInput);
    else next.delete("q");
    next.delete("page");
    setSearchParams(next, { replace: true });
  }, [debouncedInput, query, searchParams, setSearchParams]);

  // 3) ฟังก์ชันเปลี่ยนค่าใน URL (ใช้กับปุ่มกรองและปุ่มหน้า)
  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
    window.scrollTo({ top: 0 });
  }

  // 4) ดึงข้อมูล
  const { data, isPending, isError, error, isFetching } = useQuery({
    queryKey: ["artworks", query, type, page],
    queryFn: () => searchArtworks({ query, type, page }),
    placeholderData: keepPreviousData,
  });

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Explore</h1>

      {/* ช่องค้นหา */}
      <input
        type="search"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="ค้นหาผลงาน ศิลปิน หรือหัวข้อ เช่น monet, cat, flower…"
        className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 outline-none focus:border-stone-900"
      />

      {/* ปุ่มกรองประเภท */}
      <div className="mt-4 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => updateParam("type", t.value)}
            className={
              type === t.value
                ? "rounded-full bg-stone-900 px-4 py-1.5 text-sm text-white"
                : "rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-600 hover:border-stone-900"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ผลลัพธ์ */}
      {isPending ? (
        <p className="mt-8">กำลังโหลด...</p>
      ) : isError ? (
        <p className="mt-8 text-red-600">เกิดข้อผิดพลาด: {error.message}</p>
      ) : data.artworks.length === 0 ? (
        <p className="mt-8 text-stone-500">ไม่พบผลงานที่ตรงกับการค้นหา</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-stone-500">
            พบ {data.total.toLocaleString()} ชิ้น {isFetching && "· กำลังอัปเดต..."}
          </p>

          <div className={`mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 ${isFetching ? "opacity-60" : ""}`}>
            {data.artworks.map((art) => (
              <Link key={art.id} to={`/artwork/${art.id}`} className="group">
                {art.imageUrl ? (
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    loading="lazy"
                    className="aspect-square w-full rounded-lg object-cover transition group-hover:opacity-80"
                  />
                ) : (
                  <div className="aspect-square w-full rounded-lg bg-stone-200" />
                )}
                <p className="mt-2 font-semibold">{art.title}</p>
                <p className="text-sm text-stone-500">{art.artist}</p>
              </Link>
            ))}
          </div>

          {/* แบ่งหน้า */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              disabled={page <= 1}
              onClick={() => updateParam("page", String(page - 1))}
              className="rounded-lg border border-stone-300 px-4 py-2 disabled:opacity-40"
            >
              ← ก่อนหน้า
            </button>
            <span className="text-sm text-stone-600">
              หน้า {page} / {data.totalPages}
            </span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => updateParam("page", String(page + 1))}
              className="rounded-lg border border-stone-300 px-4 py-2 disabled:opacity-40"
            >
              ถัดไป →
            </button>
          </div>
        </>
      )}
    </main>
  );
}

export default HomePage;