"use client";

import { PortfolioProvider } from '@/context/PortfolioContext';
import { Hero, About, Projects, Skills, Contact } from '@/components/sections';

export default function PortfolioWrapper() {
  return (
    <PortfolioProvider>
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Contact />
    </PortfolioProvider>
  );
}
