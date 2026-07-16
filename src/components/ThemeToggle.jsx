import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon } from 'lucide-react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const getPositionCoords = (position) => {
  switch (position) {
    case "top-left": return { cx: "0", cy: "0" };
    case "top-right": return { cx: "40", cy: "0" };
    case "bottom-left": return { cx: "0", cy: "40" };
    case "bottom-right": return { cx: "40", cy: "40" };
    case "top-center": return { cx: "20", cy: "0" };
    case "bottom-center": return { cx: "20", cy: "40" };
    default: return { cx: "20", cy: "20" };
  }
};

const generateSVG = (variant, start) => {
  if (start === "center") return;
  const positionCoords = getPositionCoords(start);
  const { cx, cy } = positionCoords;

  if (variant === "circle") {
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="${cx}" cy="${cy}" r="20" fill="white"/></svg>`;
  }
  return "";
};

const getTransformOrigin = (start) => {
  switch (start) {
    case "top-left": return "top left";
    case "top-right": return "top right";
    case "bottom-left": return "bottom left";
    case "bottom-right": return "bottom right";
    case "top-center": return "top center";
    case "bottom-center": return "bottom center";
    default: return "center";
  }
};

export const createAnimation = (variant, start = "center") => {
  if (variant === "circle" && start == "center") {
    return {
      name: `${variant}-${start}`,
      css: `
      ::view-transition-group(root) {
        animation-duration: 0.7s;
        animation-timing-function: var(--expo-out);
      }
      ::view-transition-new(root) {
        animation-name: reveal-light;
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark;
      }
      @keyframes reveal-dark {
        from { clip-path: circle(0% at 50% 50%); }
        to { clip-path: circle(100.0% at 50% 50%); }
      }
      @keyframes reveal-light {
        from { clip-path: circle(0% at 50% 50%); }
        to { clip-path: circle(100.0% at 50% 50%); }
      }
      `,
    };
  }

  const svg = generateSVG(variant, start);
  const transformOrigin = getTransformOrigin(start);
  const clipPosition = start === "top-right" ? "100% 0%" : "50% 50%";

  return {
    name: `${variant}-${start}`,
    css: `
      ::view-transition-group(root) {
        animation-duration: 1s;
        animation-timing-function: var(--expo-out);
      }
      ::view-transition-new(root) {
        animation-name: reveal-light-${start};
      }
      ::view-transition-old(root),
      .dark::view-transition-old(root) {
        animation: none;
        z-index: -1;
      }
      .dark::view-transition-new(root) {
        animation-name: reveal-dark-${start};
      }
      @keyframes reveal-dark-${start} {
        from { clip-path: circle(0% at ${clipPosition}); }
        to { clip-path: circle(150.0% at ${clipPosition}); }
      }
      @keyframes reveal-light-${start} {
        from { clip-path: circle(0% at ${clipPosition}); }
        to { clip-path: circle(150.0% at ${clipPosition}); }
      }
    `,
  };
};

export const useThemeToggle = ({ variant = "circle", start = "top-right" } = {}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const styleId = "theme-transition-styles";

  const updateStyles = useCallback((css, name) => {
    if (typeof window === "undefined") return;

    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = css;
  }, []);

  const toggleTheme = useCallback(() => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    const animation = createAnimation(variant, start);
    updateStyles(animation.css, animation.name);

    if (typeof window === "undefined") return;

    const switchTheme = () => {
      if (newIsDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    if (!document.startViewTransition) {
      switchTheme();
      return;
    }

    document.startViewTransition(switchTheme);
  }, [variant, start, updateStyles, isDark]);

  return { isDark, toggleTheme };
};

const ThemeToggleButton = ({ className = "", variant = "circle", start = "top-right" }) => {
  const { isDark, toggleTheme } = useThemeToggle({ variant, start });

  return (
    <button
      type="button"
      style={{ 
        width: '40px', 
        height: '40px',
        borderRadius: '50%',
        cursor: 'pointer',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDark ? 'var(--color-white)' : 'var(--color-charcoal)',
        color: isDark ? 'var(--color-charcoal)' : 'var(--color-white)',
        transition: 'all 0.3s ease',
        padding: 0,
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 1 : 0,
          rotate: isDark ? 0 : -90,
          opacity: isDark ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute' }}
      >
        <Sun size={20} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: isDark ? 0 : 1,
          rotate: isDark ? 90 : 0,
          opacity: isDark ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
        style={{ position: 'absolute' }}
      >
        <Moon size={20} />
      </motion.div>
    </button>
  );
};

export default ThemeToggleButton;
