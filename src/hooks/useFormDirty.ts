import { useMemo } from "react";

export function useFormDirty<T>(
    form: Partial<T>,
    original: Partial<T> | null | undefined
) {
    return useMemo(() => {
        if (!original) return false;

        return Object.keys(form).some((key) => {
            const formValue = form[key as keyof T];
            const originalValue = original[key as keyof T];

            // normalize null/undefined/string number
            return String(formValue ?? "") !== String(originalValue ?? "");
        });
    }, [form, original]);
}