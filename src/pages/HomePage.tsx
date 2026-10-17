import { useQuery } from "@tanstack/react-query";
import { searchArtworks } from "../api/cma";
import { Link } from "react-router";

function HomePage() {
    const { data, isPending, isError, error } = useQuery({
        queryKey: ["artworks", "monet", 1],
        queryFn: () => searchArtworks("monet", 1),
    })

  if (isPending) return <p className="p-8">กำลังโหลด...</p>;
  if (isError) return <p className="p-8 text-red-600">เกิดข้อผิดพลาด: {error.message}</p>;

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Art Gallery</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
    </main>
  );
}

export default HomePage;
