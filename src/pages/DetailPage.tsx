import { useParams } from "react-router";

function DetailPage() {
    const { id } = useParams();

    return (
        <main className="mx-auto max-w-6xl p-8">
            <h1 className="text-3xl font-bold">Artwork #{id}</h1>
            <p className="mt-2 text-stone-500">ขั้นถัดไปจะดึงข้อมูลงานชิ้นนี้จาก API</p>
        </main>
    );
}

export default DetailPage;