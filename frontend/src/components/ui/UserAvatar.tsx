import React from "react";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = "md",
  className = "",
}) => {
  const getInitials = (fullName: string): string => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const getColorFromName = (name: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ];

    const hash = name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg",
  };

  const bgColor = getColorFromName(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-medium user-avatar ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
};
