// components/layout/PageLayout.tsx
import { Outlet } from "react-router";

const PageLayout = () => {
    return (
        <main className="min-h-screen bg-mesh text-zinc-900 dark:text-white">
            <Outlet />
        </main>
    );
};

export default PageLayout;