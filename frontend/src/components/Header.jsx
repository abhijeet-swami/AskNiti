export function Header({ onThemeToggle, isDark }) {
  return (
    <header
      className="sticky top-0 z-20 px-4 h-[60px] flex items-center justify-between border-b"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center gap-3">
        <img
          src="https://i.pinimg.com/236x/ab/84/8e/ab848eed97e19478ca11f40b9586cb0c.jpg"
          alt="AskNiti"
          className="w-9 h-9 rounded-lg object-cover"
        />
        <h1
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          AskNiti
        </h1>
      </div>
      <button
        onClick={onThemeToggle}
        className="p-2 rounded-lg hover:bg-black/5"
        style={{ color: "var(--text-secondary)" }}
      >
        {isDark ? (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        )}
      </button>
    </header>
  );
}
