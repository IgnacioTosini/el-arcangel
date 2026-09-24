"use client";
import Image from "next/image";
import Link from "next/link";

import { defaultHomeContent, type HomeContent } from "@/lib/home-content";
import { useAnimation } from "@/lib/use-animation";

import { animateHero } from "./hero.animation";

import "./_hero.scss";

export default function Hero({
  content = defaultHomeContent,
}: {
  content?: HomeContent;
}) {
  const animationRef = useAnimation<HTMLElement>(animateHero);
  return (
    <section
      ref={animationRef}
      className="heroContent"
      aria-labelledby="heroTitle"
    >
      <div className="heroInner">
        <h1 id="heroTitle" className="heroTitle">
          {content.heroTitle}
        </h1>
        <p className="heroSubtitle">{content.heroSubtitle}</p>
        <div className="heroButtons">
          <Link href="/catalogo" className="heroButton">
            {content.heroCatalogButton}
          </Link>
          <Link href="/mayoristas" className="heroButton heroButtonSecondary">
            {content.heroWholesaleButton}
          </Link>
        </div>
      </div>
      <picture className="heroPicture">
        <Image
          src={content.heroImageUrl}
          alt={content.heroImageAlt}
          className="heroImage"
          width={600}
          height={400}
          sizes="(max-width: 768px) calc(100vw - 32px), (max-width: 1280px) 48vw, 596px"
          priority
        />
      </picture>
    </section>
  );
}
