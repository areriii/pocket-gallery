import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { getGuessArtworks } from "../api/cma";
import { useGalleryStore } from "../store/galleryStore";
import { useGameStore } from "../store/gameStore";

const ROUNDS = 5;
const MIN_YEAR = 1400;
const MAX_YEAR = 2000;
const START_GUESS = 1700;

// ห่างจากช่วงปีจริงกี่ปี (ถ้าทายอยู่ในช่วง = 0)
function yearDiff(guess: number, start: number, end: number) {
  if (guess < start) return start - guess;
  if (guess > end) return guess - end;
  return 0;
}

// ตรงเป๊ะได้ 1000, ห่าง 1 ปีหัก 10 คะแนน, ห่าง 100 ปีขึ้นไปได้ 0
function scoreFor(diff: number) {
  return Math.max(0, 1000 - diff * 10);
}

function GuessPage() {
  // ===== hooks ทั้งหมดต้องอยู่ตรงนี้ ก่อน return ใดๆ =====
  const [gameId, setGameId] = useState(1);
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState(START_GUESS);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const { bestScore, recordGame } = useGameStore();
  const items = useGalleryStore((s) => s.items);
  const save = useGalleryStore((s) => s.save);

  const { data: artworks, isPending, isError, error, refetch } = useQuery({
    queryKey: ["guess", gameId],
    queryFn: () => getGuessArtworks(ROUNDS),
    staleTime: Infinity,
  });

  const total = scores.reduce((sum, s) => sum + s, 0);

  function newGame() {
    setGameId((n) => n + 1);
    setRound(0);
    setGuess(START_GUESS);
    setRevealed(false);
    setScores([]);
    setFinished(false);
  }

  // ===== สถานะโหลด / error =====
  if (isPending) return <p className="p-8">กำลังสุ่มภาพ...</p>;
  if (isError) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <p className="text-red-600">เกิดข้อผิดพลาด: {error.message}</p>
        <button onClick={() => refetch()} className="mt-4 underline">ลองใหม่</button>
      </main>
    );
  }
  if (artworks.length === 0) {
    return (
      <main className="mx-auto max-w-6xl p-8">
        <p>ไม่พบภาพที่ระบุปีชัดเจนในรอบนี้</p>
        <button onClick={newGame} className="mt-4 underline">สุ่มใหม่</button>
      </main>
    );
  }

  // ===== หน้าสรุปผล =====
  if (finished) {
    return (
      <main className="mx-auto max-w-3xl p-8 text-center">
        <h1 className="text-3xl font-bold">จบเกม!</h1>
        <p className="mt-6 text-6xl font-bold text-red-700">{total.toLocaleString()}</p>
        <p className="text-stone-500">จากเต็ม {(artworks.length * 1000).toLocaleString()} คะแนน</p>
        <p className="mt-2">สถิติสูงสุดของคุณ: {bestScore.toLocaleString()} คะแนน</p>

        <ul className="mt-8 space-y-2 text-left">
          {artworks.map((a, i) => (
            <li key={a.id} className="flex justify-between gap-4 border-b border-stone-200 py-2">
              <span>
                {a.title} <span className="text-stone-500">({a.date})</span>
              </span>
              <span className="font-semibold">+{scores[i]}</span>
            </li>
          ))}
        </ul>

        <button onClick={newGame} className="mt-8 rounded-lg bg-red-700 px-6 py-3 font-semibold text-white">
          เล่นอีกครั้ง
        </button>
      </main>
    );
  }

  // ===== ระหว่างเล่น =====
  const art = artworks[round];
  const diff = yearDiff(guess, art.yearStart, art.yearEnd);
  const isSaved = items.some((i) => i.id === art.id);
  const isLastRound = round + 1 >= artworks.length;

  function handleConfirm() {
    setScores((prev) => [...prev, scoreFor(diff)]);
    setRevealed(true);
  }

  function handleNext() {
    if (isLastRound) {
      recordGame(total);
      setFinished(true);
      return;
    }
    setRound(round + 1);
    setGuess(START_GUESS);
    setRevealed(false);
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">Guess the Year</h1>
        <p className="text-stone-600">
          รอบ {round + 1} / {artworks.length} · คะแนน {total.toLocaleString()}
        </p>
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        {/* รูป */}
        <div className="rounded-lg bg-white p-4 shadow">
          <img src={art.imageUrl ?? ""} alt="ผลงานปริศนา" className="w-full rounded" />
        </div>

        {/* คำถาม / เฉลย */}
        <div>
          {!revealed ? (
            <>
              <p className="text-xl font-semibold">งานชิ้นนี้สร้างขึ้นในปีใด?</p>
              <p className="mt-4 text-6xl font-bold text-red-700">ค.ศ. {guess}</p>
              <input
                type="range"
                min={MIN_YEAR}
                max={MAX_YEAR}
                value={guess}
                onChange={(e) => setGuess(Number(e.target.value))}
                className="mt-6 w-full accent-red-700"
              />
              <div className="flex justify-between text-sm text-stone-500">
                <span>{MIN_YEAR}</span>
                <span>{MAX_YEAR}</span>
              </div>
              <button
                onClick={handleConfirm}
                className="mt-6 w-full rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white"
              >
                ยืนยันคำตอบ
              </button>
            </>
          ) : (
            <>
              <p className="text-sm text-stone-500">คุณทาย ค.ศ. {guess} · ปีจริงคือ</p>
              <p className="mt-1 text-5xl font-bold">{art.date}</p>
              <p className="mt-3 text-lg">
                {diff === 0 ? "🎯 ตรงเป๊ะ!" : `ห่าง ${diff} ปี`} ·{" "}
                <span className="font-semibold text-red-700">+{scores[round]} คะแนน</span>
              </p>

              <div className="mt-6 border-t border-stone-200 pt-4">
                <p className="font-semibold">{art.title}</p>
                <p className="text-sm text-stone-500">{art.artist}</p>
                <Link
                  to={`/artwork/${art.id}`}
                  target="_blank"
                  className="mt-1 inline-block text-sm text-red-700 underline"
                >
                  ดูรายละเอียด (แท็บใหม่)
                </Link>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => save(art)}
                  disabled={isSaved}
                  className="flex-1 rounded-lg border-2 border-red-700 px-4 py-3 font-semibold text-red-700 disabled:opacity-50"
                >
                  {isSaved ? "★ บันทึกแล้ว" : "☆ บันทึกลง My Gallery"}
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white"
                >
                  {isLastRound ? "ดูผลรวม" : "ภาพถัดไป →"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default GuessPage;