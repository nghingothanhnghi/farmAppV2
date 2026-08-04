// src/utils/id.ts

export const generateDraftId = () =>
    `draft_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;