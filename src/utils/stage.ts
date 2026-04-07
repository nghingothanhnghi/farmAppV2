// src/utils/stage.ts

export const getStageColor = (stage?: string | null) => {
  if (!stage) return "bg-gray-400";

  switch (stage.toLowerCase()) {
    case "seed":
    case "seedling":
      return "bg-yellow-400";

    case "growing":
    case "vegetative":
      return "bg-green-500";

    case "flowering":
      return "bg-pink-500";

    case "harvest":
      return "bg-purple-500";

    default:
      return "bg-gray-400";
  }
};