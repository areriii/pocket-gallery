import { useEffect, useState } from "react";
import { searchArtworks, type Artwork } from "../api/cma";
import { Link } from "react-router";

function HomePage() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError ]= useState<string | null>(null);

  useEffect(() => {
    searchArtworks("monet")
      .then((res) => setArtworks(res.artworks))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-8">กำลังโหลด...</p>;
  if (error) return <p className="p-8 text-red-600">เกิดข้อผิดพลาด: {error}</p>;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Art Gallery</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {artworks.map((art) => (
          <Link key={art.id} to={`/artwork/${art.id}`} className="group">
            {art.imageUrl ? (
              <img
                src={art.imageUrl}
                alt={art.title}
                loading="lazy"
                className="aspect-square w-full rounded-lg object-cover" 
              />
            ) : (
              <div className="aspect-square w-full rounded-lg bg-stone-200" />
            )}
            <p className="mt-2 font-semibold">{art.title}</p>
            <p className="text-sm text-stone-500">{art.artist}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default HomePage;
