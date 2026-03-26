import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2D5E4C",
          hover: "#244D3F",
          light: "#EEF5F1",
          muted: "#3A7D66",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#B8860B",
          light: "#FAF0D6",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
        },
        danger: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#D97706",
          foreground: "#FFFFFF",
        },
        "bg-app": "#FAF8F5",
        depth: "#EDE8E1",
        surface: "#FFFFFF",
        text: {
          primary: "#1C1917",
          main: "#1C1917",
          strong: "#44403C",
          secondary: "#78716C",
          tertiary: "#A8A29E",
        },
        sidebar: {
          bg: "#1C1917",
          text: "#D6D3D1",
          active: "#292524",
        },
        /* shadcn/ui HSL-variable-based colours — keep for component compat */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 24px rgba(0, 0, 0, 0.03)",
        "card-hover":
          "0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.08)",
        "card-elevated":
          "0 1px 3px rgba(0, 0, 0, 0.06), 0 8px 24px -4px rgba(0, 0, 0, 0.08)",
        "btn-primary": "0 1px 2px rgba(45, 94, 76, 0.08)",
        "btn-primary-hover": "0 2px 8px rgba(45, 94, 76, 0.15)",
        "nav-float": "0 -4px 20px rgba(0, 0, 0, 0.03)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
