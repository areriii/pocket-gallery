import { Link } from "react-router";

const TEAM = [
  { initial: "N", name: "Natthanan Pinthong", role: "Project Lead · Frontend", color: "bg-red-700" },
  { initial: "D", name: "Dharupol Kornthavornwong", role: "UI/UX · Frontend", color: "bg-teal-800" },
  { initial: "A", name: "Anawin Oaksornthip", role: "Features · State", color: "bg-indigo-900" },
];

const HOW_TO = [
  { to: "/", title: "Explore", text: "ค้นหาและกรองงานศิลปะ กดที่การ์ดเพื่อดูรายละเอียด" },
  { to: "/my-gallery", title: "My Gallery", text: "บันทึกงานที่ชอบ จัดเป็นห้อง และจดโน้ตของตัวเอง" },
  { to: "/guess", title: "Guess the Year", text: "ทายปีที่สร้างผลงาน ยิ่งทายใกล้ยิ่งได้คะแนนมาก" },
];

const STACK = ["React", "TypeScript", "Vite", "Tailwind CSS", "React Router", "TanStack Query", "Zustand"];

function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="grid gap-12 md:grid-cols-[1fr_360px]">
        {/* ฝั่งซ้าย */}
        <div>
          <h1 className="text-3xl font-bold">เกี่ยวกับ Pocket Gallery</h1>
          <p className="mt-4 leading-relaxed text-stone-700">
            เว็บแอปที่ทำให้การชมงานศิลปะระดับโลกเป็นเรื่องง่ายและสนุก
            ค้นหา สะสม และเล่นเกมกับงานศิลปะจริงจากพิพิธภัณฑ์ได้ในที่เดียว
            พัฒนาเป็น Modern Decoupled SPA สำหรับวิชา CS319 Web Development
          </p>

          <h2 className="mt-10 text-xl font-semibold">ใช้งานยังไง</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {HOW_TO.map((h) => (
              <Link
                key={h.to}
                to={h.to}
                className="rounded-lg border border-stone-200 bg-white p-4 transition hover:border-stone-900"
              >
                <p className="font-semibold">{h.title} →</p>
                <p className="mt-1 text-sm text-stone-600">{h.text}</p>
              </Link>
            ))}
          </div>

          <h2 className="mt-10 text-xl font-semibold">ทีมผู้พัฒนา · GUTALOD</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {TEAM.map((m) => (
              <div key={m.name} className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${m.color}`}
                >
                  {m.initial}
                </div>
                <div>
                  <p className="font-semibold leading-tight">{m.name}</p>
                  <p className="text-sm text-stone-500">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ฝั่งขวา */}
        <aside className="space-y-6">
          <div className="rounded-lg bg-stone-100 p-5">
            <p className="text-sm font-semibold text-red-700">เครดิตข้อมูล</p>
            <p className="mt-1 font-semibold">Cleveland Museum of Art Open Access API</p>
            <p className="mt-1 text-sm text-stone-600">
              ข้อมูลและภาพผลงานเผยแพร่ภายใต้สัญญาอนุญาต CC0 (Public Domain)
            </p>
            <a
              href="https://openaccess-api.clevelandart.org/"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-red-700 underline"
            >
              เอกสาร API →
            </a>
          </div>

          <div>
            <p className="font-semibold">สร้างด้วย</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {STACK.map((s) => (
                <span key={s} className="rounded-full border border-stone-300 px-3 py-1 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <a
            href="https://github.com/areriii/pocket-gallery"
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg bg-stone-900 px-4 py-3 text-center font-semibold text-white"
          >
            ดูโค้ดบน GitHub →
          </a>
        </aside>
      </div>
    </main>
  );
}

export default AboutPage;