import { Avatar } from '@/components/common/Avatar';

function SceneBackdrop() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 880 980" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="auth-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e7efe6" />
          <stop offset="48%" stopColor="#f3efe8" />
          <stop offset="100%" stopColor="#e4d3b8" />
        </linearGradient>
        <radialGradient id="auth-glow" cx="70%" cy="18%" r="42%">
          <stop offset="0%" stopColor="#fff8ef" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff8ef" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="880" height="980" fill="url(#auth-sky)" />
      <rect width="880" height="980" fill="url(#auth-glow)" />
      <ellipse cx="120" cy="860" rx="260" ry="120" fill="#d8e0d4" />
      <ellipse cx="720" cy="900" rx="300" ry="140" fill="#dcc9ae" />
      <path d="M0 640c90-40 180-20 240 18 70 44 140 20 210-8 80-32 170-10 250 24 70 30 130 18 180-10v316H0V640Z" fill="#24362e" opacity="0.08" />
      <circle cx="760" cy="120" r="86" fill="#24362e" opacity="0.06" />
      <circle cx="80" cy="210" r="48" fill="#8a6232" opacity="0.08" />
    </svg>
  );
}

export function SignInStory() {
  return (
    <figure className="auth-scene relative h-full min-h-[280px] w-full overflow-hidden">
      <SceneBackdrop />
      <figcaption className="sr-only">
        Before the call: who they are, what was last said, and when to phone.
      </figcaption>

      <div className="relative z-10 flex h-full flex-col justify-between px-8 py-8 lg:px-12 lg:py-10">
        <div className="auth-copy max-w-md">
          <p className="text-xs font-medium tracking-[0.08em] text-[#5c6b45]">BEFORE THE CALL</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-heading text-[#1f1a17]">
            Know what to say before you call.
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[#6f675f]">
            The next conversation sits next to the person, the last thing they said, and the time you promised to phone.
          </p>
        </div>

        <div className="relative mx-auto mt-8 h-[340px] w-full max-w-[540px] lg:h-[400px] lg:max-w-[580px]">
          <div className="auth-float auth-delay-2 absolute right-6 top-0 flex -space-x-3">
            {['Ritu Agarwal', 'Arvind Joshi', 'Ananya Shah'].map((name) => (
              <Avatar key={name} name={name} size={44} className="ring-2 ring-[#fffcf8]" />
            ))}
          </div>

          <article className="auth-float auth-delay-1 absolute left-0 top-10 w-[250px] rounded-[20px] border border-[#e5dfd6] bg-[#fffcf8] p-4 shadow-overlay">
            <div className="flex items-center gap-3">
              <Avatar name="Arjun Kumar" size={52} />
              <div>
                <p className="text-sm font-semibold text-[#1f1a17]">Arjun Kumar</p>
                <p className="text-xs text-[#6f675f]">Kumar Interiors</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#6f675f]">The person you are calling</p>
          </article>

          <article className="auth-float auth-delay-2 absolute right-0 top-[88px] w-[260px] rounded-[20px] border border-[#e5dfd6] bg-[#fffcf8] p-4 shadow-overlay">
            <p className="text-xs text-[#6f675f]">Last thing said</p>
            <p className="mt-2 font-serif text-[18px] leading-7 text-[#1f1a17]">“Quotation discussed.”</p>
            <p className="mt-3 text-xs text-[#6f675f]">Meeting, two days ago</p>
            <span className="mt-3 inline-flex rounded-full bg-[#f3e6d4] px-2 py-0.5 text-[11px] font-medium text-[#8a6232]">Proposal</span>
          </article>

          <article className="auth-float auth-delay-3 absolute bottom-2 left-[16%] w-[220px] rounded-[22px] bg-[#24362e] p-4 text-[#fffcf8] shadow-overlay">
            <p className="text-xs text-[#e4d3b8]">Today</p>
            <p className="mt-2 text-lg font-semibold tracking-heading">Call at 4:30 PM</p>
            <p className="mt-2 text-xs text-[#d8c4a8]">Check whether the quotation is acceptable</p>
          </article>
        </div>

        <p className="mt-8 text-xs text-[#6f675f]">For small businesses and individual salespeople.</p>
      </div>
    </figure>
  );
}
