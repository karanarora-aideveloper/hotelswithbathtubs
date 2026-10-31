'use client';

export default function CookieSettingsButton() {
  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cookie-settings'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-text-muted hover:text-accent font-medium transition-colors cursor-pointer"
    >
      Cookie settings
    </button>
  );
}
