'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { BRANDS } from '@/lib/brands';
import { cn } from '@/lib/utils';

export function LogoStrip() {
  const t = useTranslations('stats');

  return (
    <div aria-label={t('logoStripLabel')} className="py-8 md:py-9 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-center md:justify-between gap-y-5 gap-x-7">
        {BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            href={`/marcas/${brand.slug}`}
            className="flex-[0_0_28%] md:flex-1 md:max-w-[170px] h-12 md:h-[60px] flex items-center justify-center group"
          >
            <Image
              src={brand.logo}
              alt={brand.name}
              width={200}
              height={80}
              className={cn(
                'w-auto h-auto max-h-[46px] md:max-h-[60px] max-w-full object-contain opacity-90 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:scale-[1.04]',
                brand.logoColor === 'dark' && 'logo-invert',
              )}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
