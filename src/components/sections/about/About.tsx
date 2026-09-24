"use client";
import { defaultHomeContent, type HomeContent } from "@/lib/home-content";
import { useAnimation } from "@/lib/use-animation";

import { animateAbout } from "./about.animation";

import "./_about.scss";

type AboutProps = {
  instagramUrl?: string;
  content?: HomeContent;
};

export default function About({
  instagramUrl,
  content = defaultHomeContent,
}: AboutProps) {
  const animationRef = useAnimation<HTMLElement>(animateAbout);
  return (
    <section
      ref={animationRef}
      className="aboutContent"
      aria-labelledby="aboutTitle"
    >
      <h2 id="aboutTitle" className="aboutTitle">
        {content.aboutTitle}
      </h2>
      <p className="aboutDescription">{content.aboutDescription}</p>
      {instagramUrl && (
        <a
          href={instagramUrl}
          className="aboutInstagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          {content.aboutButton}
        </a>
      )}
    </section>
  );
}
