import { marqueeWords } from '../data/sections'

interface MarqueeProps {
  dark?: boolean
}

export default function Marquee({ dark = false }: MarqueeProps) {
  const row = [...marqueeWords, ...marqueeWords, ...marqueeWords]
  return (
    <div
      className={`relative w-full overflow-hidden py-4 md:py-5 select-none ${
        dark ? 'bg-[#E63946] text-[#FFF8E7]' : 'bg-[#F7C948] text-[#2A1208]'
      }`}
      aria-hidden="true"
    >
      <div className="marquee flex w-max items-center gap-8 md:gap-12 whitespace-nowrap font-display text-2xl md:text-4xl uppercase tracking-[0.08em]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-8 md:gap-12">
            {row.map((word, i) => (
              <span key={`${copy}-${i}`} className="flex items-center gap-8 md:gap-12">
                {word}
                <span className="text-lg md:text-2xl opacity-70">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
