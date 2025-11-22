/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
			fontFamily: {
        electrolize: ['var(--font-electrolize)', 'sans-serif'], 
        inter: ['var(--font-inter)', 'sans-serif'], 
      },
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
				'red-fp': {
          100: '#FADADA',
          200: '#F2A0A0',
          300: '#E86666',
          400: '#DF2C2C',
          500: '#B20000', // Base: #B20000
          600: '#8F0000',
          700: '#690000',
          800: '#4F0000',
          900: '#3A0000',
        },
        'black-fp': {
          100: '#5C5C5C',
          200: '#4D4D4D',
          300: '#3E3E3E',
          400: '#2F2F2F',
          500: '#0A0A0A', // Base: #0A0A0A
          600: '#080808',
          700: '#060606',
          800: '#040404',
          900: '#000000',
        },
        'white-fp': {
          100: '#FFFFFF', 
          200: '#F7F7F7',
          300: '#E6E6E6', // Base: #E6E6E6
          400: '#D4D4D4',
          500: '#C2C2C2',
          600: '#A3A3A3',
          700: '#858585',
          800: '#666666',
          900: '#4D4D4D',
        },
  		},
			rotate: {
        'y-180': '180deg', 
      },
  	}
  },
 plugins: [require("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        // Estas son las clases que usaremos en el JSX
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },
				 '.rotate-z-180': {
          transform: 'rotateZ(180deg)',
        }
      }
      addUtilities(newUtilities, ['responsive']);
    }
  ],
}

