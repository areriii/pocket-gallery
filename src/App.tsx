import { Routes, Route } from "react-router";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import DetailPage from "./pages/DetailPage";
import MyGalleryPage from "./pages/MyGalleryPage";
import GuessPage from "./pages/GuessPage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/artwork/:id" element={<DetailPage />} />
        <Route path="/my-gallery" element={<MyGalleryPage />} />
        <Route path="/guess" element={<GuessPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;