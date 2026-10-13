import { type Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './execution/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "20px",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Syncopate", "sans-serif"],
        body: ["var(--font-body)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "monospace"],
      },
      boxShadow: {
        'retro-sm': '2px 2px 0 #0c141c',
        'retro': '4px 4px 0 #0c141c',
        'retro-lg': '6px 6px 0 #0c141c',
        'retro-xl': '8px 8px 0 #0c141c',
        'retro-btn': '0 5px 0 #0c141c',
        'retro-btn-active': '0 2px 0 #0c141c',
      },
      colors: {
        retroSand: "#dfbe9b",
        retroCream: "#fbf0e6",
        retroNavy: "#0c141c",
        retroNavyDark: "#08131d",
        retroOrange: "#dc5c1c",
        retroOrangeHover: "#e66627",
        retroTeal: "#0f756e",
        retroTealLight: "#27847a",
        retroYellow: "#eec85d",
        retroSlate: "#8faec4",
        retroMuted: "#63707c",

        base: "hsl(var(--base))",
        surface: "hsl(var(--surface))",
        border: "hsl(var(--border-val))",
        textPrimary: "hsl(var(--text-primary))",
        textSecondary: "hsl(var(--text-secondary))",
        accent1: "hsl(var(--accent-1))",
        accent2: "hsl(var(--accent-2))",
        signal: "hsl(var(--signal))",

        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
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
        'pill': '9999px',
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'synthwave-grid': 'linear-gradient(transparent 90%, hsl(var(--border-val)) 100%), linear-gradient(90deg, transparent 90%, hsl(var(--border-val)) 100%)',
        'retro-dot-grid': 'radial-gradient(circle, rgba(12, 20, 28, 0.16) 1.2px, transparent 1.2px)',
        'retro-dot-light': 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 1.2px, transparent 1.2px)',
      },
      backgroundSize: {
        'synthwave': '40px 40px',
        'retro-dot': '14px 14px',
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
