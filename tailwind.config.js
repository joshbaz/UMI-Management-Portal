/** @type {import('tailwindcss').Config} */


export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			accent1: {
  				'100': '#ECF6FB',
  				'200': '#D9EDF7',
  				'300': '#C5E5F3',
  				'400': '#B2DCEF',
  				'500': '#9FD3EB',
  				'600': '#7FA9BC',
  				'700': '#5F7F8D',
  				'800': '#40545E',
  				'900': '#202A2F',
  				'1000': '#1A2226',
  				'1100': '#13191C'
  			},
  			accent2: {
  				'100': '#FEF0D7',
  				'200': '#FEE2AF',
  				'300': '#FDD388',
  				'400': '#FDC560',
  				'500': '#FCB638',
  				'600': '#CA922D',
  				'700': '#976D22',
  				'800': '#654916',
  				'900': '#32240B',
  				'1000': '#281D09',
  				'1100': '#1E1607'
  			},
  			primary: {
  				'100': '#D3D7E9',
  				'200': '#A7AFD2',
  				'300': '#7B88BC',
  				'400': '#23388F',
  				'500': '#23388F',
  				'600': '#1C2D72',
  				'700': '#152256',
  				'800': '#0E1639',
  				'900': '#070B1D',
  				'1000': '#060917',
  				'1100': '#040711',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'100': '#FDFDFE',
  				'200': '#FBFBFC',
  				'300': '#F9FAFB',
  				'400': '#F7F8F9',
  				'500': '#F5F6F8',
  				'600': '#C4C5C6',
  				'700': '#C4C5C6',
  				'800': '#626263',
  				'900': '#313132',
  				'1000': '#272728',
  				'1100': '#1D1D1E',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			semantic: {
  				error: '#B91C1C',
  				success: '#22C55E',
  				warning: '#F59E0B',
  				info: '#3B82F6',
  				text: {
  					primary: '#070B1D',
  					secondary: '#939495'
  				},
  				bg: {
  					success: '#CCFBF1',
  					border: '#E5E7EB'
  				},
  				fg: {
  					success: '#0F766E',
  					disabled: '#6B7280'
  				}
  			},
  			'semantic-border': {
  				border: '#E5E7EB',
  				inactive: '#D3D7E9'
  			},
  			global: {
  				gray: {
  					'100': '#F3F4F6'
  				}
  			},
  			status: {
  				active: {
  					text: '#065F46',
  					bg: '#D1FAE5'
  				},
  				inactive: {
  					text: '#991B1B',
  					bg: '#FEE2E2'
  				}
  			},
  			table: {
  				header: '#F9FAFB',
  				hover: '#F3F4F6'
  			},
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
  			}
  		},
  		fontFamily: {
  			roboto: [
  				'Roboto',
  				'sans-serif'
  			]
  		},
  		boxShadow: {
  			sm: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)'
  		},
  		width: {
  			hug63px: '140px',
  			hug74px: '85px',
  			hug112px: '130px'
  		},
  		height: {
  			hug24px: '28px'
  		},
  		padding: {
  			'4px': '4px',
  			'8px': '8px',
  			'9px': '9px'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    'bg-primary-500',
    'bg-primary-600',
    'bg-primary-700',
    'bg-primary-800',
    'bg-primary-900',
    'hover:bg-primary-600',
    'hover:bg-primary-800',
    'hover:bg-primary-900',
    'focus:ring-primary-500',
    'text-semantic-text-primary',
    'text-semantic-text-secondary',
    'bg-status-active-bg',
    'bg-status-inactive-bg',
    'text-status-active-text',
    'text-status-inactive-text',
    'text-semantic-error',
    'text-semantic-success',
    'text-semantic-warning',
    'text-semantic-info',
    'bg-table-header',
    'hover:bg-table-hover',
    'w-hug63px',
    'w-hug74px',
    'w-hug112px',
    'h-hug24px',
    'bg-accent2-300',
    'bg-semantic-bg-success',
    'bg-global-gray-100',
    'border-semantic-fg-success',
    'border-semantic-fg-disabled',
    'border-semantic-bg-border',
    'shadow-sm'
  ]
}