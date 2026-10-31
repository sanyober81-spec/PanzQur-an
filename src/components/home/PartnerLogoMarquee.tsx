import React from 'react';

interface Partner {
  id: string;
  name: string;
  role: string;
  logoUrl: string;
  altText: string;
}

const PARTNERS: Partner[] = [
  {
    id: 'bbpvp-bekasi',
    name: 'BBPVP Bekasi',
    role: 'Balai Besar Pelatihan Vokasi & Produktivitas',
    logoUrl: '/assets/partners/bbpvp-bekasi.svg',
    altText: 'Logo BBPVP Bekasi',
  },
  {
    id: 'embi-tech',
    name: 'Embi Tech Computindo',
    role: 'IT Training, Solution & Development',
    logoUrl: '/assets/partners/embi-tech.svg',
    altText: 'Logo Embi Tech Computindo',
  },
  {
    id: 'karya-pondok-mandiri',
    name: 'Yayasan Karya Pondok Mandiri',
    role: 'Pemberdayaan Sosial & Pendidikan',
    logoUrl: '/assets/partners/yayasan-karya-pondok-mandiri.svg',
    altText: 'Logo Yayasan Karya Pondok Mandiri',
  },
];

export const PartnerLogoMarquee: React.FC = () => {
  // We duplicate the partner items to create an unbroken seamless infinite loop
  const repeatedPartners = [...PARTNERS, ...PARTNERS, ...PARTNERS];

  return (
    <section
      aria-label="Mitra & Pendukung PanzQur'an"
      className="mt-10 sm:mt-12 pt-8 sm:pt-10 border-t border-[#E5E1D5]/70"
    >
      {/* Elegant & Minimalist Heading */}
      <div className="text-center mb-6">
        <span className="text-[11px] font-bold tracking-widest text-[#126B50] uppercase">
          Kemitraan & Kolaborasi
        </span>
        <h3 className="text-base sm:text-lg font-bold text-[#24352B] tracking-tight mt-1">
          Didukung Oleh
        </h3>
        <p className="text-xs text-[#576B60] max-w-md mx-auto mt-1 leading-relaxed">
          Sinergi vokasi, teknologi, dan kemandirian umat bersama PanzQur'an.
        </p>
      </div>

      {/* Marquee Wrapper with soft edge masks to avoid hard clipping */}
      <div className="relative w-full overflow-hidden py-3">
        {/* Left & Right subtle gradient masks */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-[#FAF9F4] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-[#FAF9F4] to-transparent"
        />

        {/* Marquee Animated Track */}
        <div className="animate-marquee flex items-center gap-4 sm:gap-6">
          {/* First loop segment */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {repeatedPartners.map((partner, idx) => (
              <div
                key={`track-1-${partner.id}-${idx}`}
                className="flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 bg-white rounded-2xl border border-[#E5E1D5] shadow-2xs transition-all hover:border-[#126B50]/40 shrink-0"
              >
                <div className="w-14 sm:w-20 h-10 sm:h-12 flex items-center justify-center shrink-0">
                  <img
                    src={partner.logoUrl}
                    alt={partner.altText}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="text-left select-none pr-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#24352B] whitespace-nowrap leading-snug">
                    {partner.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#576B60] whitespace-nowrap leading-none mt-0.5">
                    {partner.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Duplicate loop segment (ensures zero-gap infinite translation) */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0" aria-hidden="true">
            {repeatedPartners.map((partner, idx) => (
              <div
                key={`track-2-${partner.id}-${idx}`}
                className="flex items-center gap-3.5 px-4 py-3 sm:px-5 sm:py-3.5 bg-white rounded-2xl border border-[#E5E1D5] shadow-2xs transition-all hover:border-[#126B50]/40 shrink-0"
              >
                <div className="w-14 sm:w-20 h-10 sm:h-12 flex items-center justify-center shrink-0">
                  <img
                    src={partner.logoUrl}
                    alt={partner.altText}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="text-left select-none pr-1">
                  <h4 className="text-xs sm:text-sm font-bold text-[#24352B] whitespace-nowrap leading-snug">
                    {partner.name}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#576B60] whitespace-nowrap leading-none mt-0.5">
                    {partner.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
