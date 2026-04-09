import { useEffect } from "react";

type Options = {
    isDirty: boolean;
    onOpenModal: () => void; // 👈 trigger your Modal
};

export const useUnsavedChangesGuard = ({
    isDirty,
    onOpenModal,
}: Options) => {

    // 🔒 Browser-level protection (refresh, close tab, etc.)
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (!isDirty) return;

            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    // 🔹 Async confirm (NO window.confirm anymore)
    const confirmLeave = async () => {
        if (!isDirty) return true;

        onOpenModal(); // 👉 open your Modal
        return false;  // block navigation for now
    };

    return { confirmLeave };
};