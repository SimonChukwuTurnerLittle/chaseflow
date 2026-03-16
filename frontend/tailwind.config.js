/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#334155',
        cta: '#0369A1',
        surface: '#F8FAFC',
        'text-main': '#020617',
        temperature: {
          hot: '#DC2626',
          medium: '#D97706',
          cold: '#2563EB',
          dormant: '#6B7280',
        },
        status: {
          active: '#16A34A',
          pending: '#D97706',
          completed: '#6B7280',
        },
        channel: {
          email: '#2563EB',
          sms: '#16A34A',
          whatsapp: '#7C3AED',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      width: {
        sidebar: '240px',
      },
      spacing: {
        sidebar: '240px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 6px rgba(0,0,0,0.1)',
        modal: '0 20px 25px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
};
