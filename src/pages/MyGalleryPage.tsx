import { useState } from "react";
import { Link } from "react-router";
import { useGalleryStore } from "../store/galleryStore";

type Sort = "newest" | "oldest" | "title";

const chip = (active: boolean) =>
  active
    ? "inline-flex items-center rounded-full bg-stone-900 px-4 py-1.5 text-sm text-white"
    : "inline-flex items-center rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-600 hover:border-stone-900";

function MyGalleryPage() {
  const { items, rooms, remove, setNote, addRoom, removeRoom, moveToRoom } = useGalleryStore();

  const [roomFilter, setRoomFilter] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [newRoom, setNewRoom] = useState("");

  // กรองตามห้อง แล้วเรียงลำดับ
  const visible = items
    .filter((i) => roomFilter === "all" || i.roomId === roomFilter)
    .sort((a, b) => {
      if (sort === "newest") return b.savedAt - a.savedAt;
      if (sort === "oldest") return a.savedAt - b.savedAt;
      return a.title.localeCompare(b.title);
    });

  function handleExport() {
    const json = JSON.stringify({ items, rooms }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-gallery.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(file: File) {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.items) || !Array.isArray(data.rooms)) throw new Error();
      useGalleryStore.setState({ items: data.items, rooms: data.rooms });
      setRoomFilter("all");
    } catch {
      alert("ไฟล์ไม่ถูกต้อง");
    }
  }

  // ยังไม่มีงานที่บันทึก
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl p-8 text-center">
        <h1 className="text-3xl font-bold">My Gallery</h1>
        <p className="mt-4 text-stone-500">ยังไม่มีผลงานที่บันทึกไว้</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-red-700 px-5 py-2.5 text-white">
          ไปเลือกงานที่หน้า Explore →
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      {/* หัวข้อ + ปุ่ม Export/Import */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Gallery</h1>
          <p className="mt-1 text-stone-500">
            {items.length} ผลงาน · {rooms.length} ห้อง
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="rounded-lg border border-stone-300 px-4 py-2 text-sm">
            Export
          </button>
          <label className="cursor-pointer rounded-lg border border-stone-300 px-4 py-2 text-sm">
            Import
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {/* สร้างห้องใหม่ */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const name = newRoom.trim();
          if (!name) return;
          addRoom(name);
          setNewRoom("");
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="ชื่อห้องใหม่ เช่น โทนฟ้า, ทำรายงาน"
          className="flex-1 rounded-lg border border-stone-300 bg-white px-4 py-2"
        />
        <button className="rounded-lg bg-red-700 px-4 py-2 text-white">+ สร้างห้อง</button>
      </form>

      {/* ตัวกรองห้อง + เรียงลำดับ */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button onClick={() => setRoomFilter("all")} className={chip(roomFilter === "all")}>
          ทั้งหมด ({items.length})
        </button>
        {rooms.map((r) => (
          <span key={r.id} className={chip(roomFilter === r.id)}>
            <button onClick={() => setRoomFilter(r.id)}>
              {r.name} ({items.filter((i) => i.roomId === r.id).length})
            </button>
            <button
              onClick={() => {
                removeRoom(r.id);
                if (roomFilter === r.id) setRoomFilter("all");
              }}
              aria-label={`ลบห้อง ${r.name}`}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              ×
            </button>
          </span>
        ))}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="ml-auto rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
        >
          <option value="newest">บันทึกล่าสุด</option>
          <option value="oldest">บันทึกเก่าสุด</option>
          <option value="title">ชื่อ A–Z</option>
        </select>
      </div>

      {/* การ์ดผลงาน */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {visible.map((art) => (
          <div key={art.id} className="overflow-hidden rounded-lg border border-stone-200 bg-white">
            <Link to={`/artwork/${art.id}`}>
              {art.imageUrl ? (
                <img src={art.imageUrl} alt={art.title} loading="lazy" className="aspect-square w-full object-cover" />
              ) : (
                <div className="aspect-square w-full bg-stone-200" />
              )}
            </Link>
            <div className="space-y-2 p-3">
              <p className="font-semibold leading-tight">{art.title}</p>
              <p className="text-sm text-stone-500">{art.artist}</p>

              <select
                value={art.roomId ?? ""}
                onChange={(e) => moveToRoom(art.id, e.target.value || null)}
                className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
              >
                <option value="">— ไม่ได้จัดห้อง —</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>

              <textarea
                value={art.note}
                onChange={(e) => setNote(art.id, e.target.value)}
                placeholder="จดโน้ต..."
                rows={2}
                className="w-full rounded border border-stone-300 px-2 py-1 text-sm"
              />

              <button onClick={() => remove(art.id)} className="text-sm text-red-700 hover:underline">
                ลบออก
              </button>
            </div>
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="mt-8 text-center text-stone-500">ห้องนี้ยังไม่มีผลงาน</p>
      )}
    </main>
  );
}

export default MyGalleryPage;