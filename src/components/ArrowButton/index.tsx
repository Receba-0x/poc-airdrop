export function ArrowButton() {
  return (
    <div className="p-2 bg-primary-3 border border-primary-10 rounded-md w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-primary-4 transition-all duration-300 active:bg-primary-5 active:scale-95">
      <svg
        width="6"
        height="10"
        viewBox="0 0 6 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1L5 5L1 9"
          stroke="#FF801F"
          strokeWidth="1.28571"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
