import { Link } from "react-router";

function NotFoundPage() {
    return (
        <main className="mx-auto max-w-6xl p-8 text-center">
            <h1 className="text-5xl font-bold">404</h1>
            <p className="mt-2 text-stone-500">ไม่พบหน้าที่คุณกำลังค้นหา</p>
            <Link to="/" className="mt-6 inline-block text-red-700 underline">
                กลับไปยังหน้าหลัก
            </Link>
        </main>
    )
}

export default NotFoundPage;