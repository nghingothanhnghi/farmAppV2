// components/common/Avatar.tsx
import React from "react";
import { getUserImageUrl } from "../../utils/getUserImageUrl";
import { DEFAULT_AVATAR, ERROR_AVATAR } from "../../constants/constants";

interface AvatarProps {
  imageUrl?: string | null;
  alt?: string;
  size?: number;   // px size (default 40)
  rounded?: "full" | "lg" | "md" | "none"; // control border radius
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  alt = "User avatar",
  size = 40,
  rounded = "full",
  className = "",
}) => {

  // ✅ Detect if it's a blob or data URL
  const isBlobOrDataUrl =
    typeof imageUrl === "string" &&
    (imageUrl.startsWith("blob:") || imageUrl.startsWith("data:"));

  // ✅ Only transform backend URLs
  const url = imageUrl
    ? isBlobOrDataUrl
      ? imageUrl
      : getUserImageUrl(imageUrl)
    : DEFAULT_AVATAR;

  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "lg"
        ? "rounded-lg"
        : rounded === "md"
          ? "rounded-md"
          : "rounded-none";

  return (
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      className={`p-1 object-cover ${roundedClass} ${className} bg-gradient-to-b from-white/90 to-black/20 shadow shadow-black/40`}
      style={{ width: size, height: size }}
      // onError={(e) => {
      //   (e.currentTarget as HTMLImageElement).src = "/default-avatar.png";
      // }}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        if (img.src !== ERROR_AVATAR) {
          img.src = ERROR_AVATAR;
        }
      }}
    />
  );
};

export default Avatar;
