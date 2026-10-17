import { NavLink, Outlet } from "react-router";

const links = [
    { to: "/", label: "Explore" },
    { to: "/my-gallery", label: "My Gallery" },
    { to: "/guess", label: "Guess" },
    { to: "/about", label: "About" },
];

function Layout() {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-900">
            <header className="border-b border-stone-200 bg-white">
                <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
                    <NavLink to="/" className="text-xl font-bold"> 
                        Pocket Gallery
                    </NavLink>
                    <div className="flex gap-6">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.to === "/"}
                                className={({ isActive }) =>
                                    isActive
                                        ? "font-semibold text-stone-700"
                                        : "text-stone-500 hover:text-stone-900"
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>
                </nav>
            </header>
            <Outlet />
        </div>
    );
}

export default Layout;
