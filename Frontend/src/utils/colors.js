
export const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-100",
        hoverBg: "hover:bg-blue-200",
        border: "border-blue-300",
        text: "text-blue-800",
        badge: "bg-blue-200 text-blue-800",
        accent: "bg-blue-600"
      },
      green: {
        bg: "bg-green-100",
        hoverBg: "hover:bg-green-200",
        border: "border-green-300",
        text: "text-green-800",
        badge: "bg-green-200 text-green-800",
        accent: "bg-green-600"
      },
      red: {
        bg: "bg-red-100",
        hoverBg: "hover:bg-red-200",
        border: "border-red-300",
        text: "text-red-800",
        badge: "bg-red-200 text-red-800",
        accent: "bg-red-600"
      },
      purple: {
        bg: "bg-purple-100",
        hoverBg: "hover:bg-purple-200",
        border: "border-purple-300",
        text: "text-purple-800",
        badge: "bg-purple-200 text-purple-800",
        accent: "bg-purple-600"
      },
      amber: {
        bg: "bg-amber-100",
        hoverBg: "hover:bg-amber-200",
        border: "border-amber-300",
        text: "text-amber-800",
        badge: "bg-amber-200 text-amber-800",
        accent: "bg-amber-600"
      },
      teal: {
        bg: "bg-teal-100",
        hoverBg: "hover:bg-teal-200",
        border: "border-teal-300",
        text: "text-teal-800",
        badge: "bg-teal-200 text-teal-800",
        accent: "bg-teal-600"
      },
    };
    return colorMap[color] || colorMap.blue;
  };

export const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');