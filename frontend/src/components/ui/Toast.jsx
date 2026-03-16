import hotToast from 'react-hot-toast';

const baseStyle = {
  borderRadius: '8px',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  fontSize: '14px',
  padding: '12px 16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
};

export const toast = {
  success(message) {
    return hotToast.success(message, {
      style: {
        ...baseStyle,
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #bbf7d0',
      },
      iconTheme: {
        primary: '#16a34a',
        secondary: '#f0fdf4',
      },
    });
  },

  error(message) {
    return hotToast.error(message, {
      style: {
        ...baseStyle,
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #fecaca',
      },
      iconTheme: {
        primary: '#dc2626',
        secondary: '#fef2f2',
      },
    });
  },
};
