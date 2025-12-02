'use client';

import React from 'react';

interface GradientButtonProps {
  text: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export default function GradientButton({
  text,
  href,
  onClick,
  className = '',
  target,
  rel,
  type = 'button',
  icon,
}: GradientButtonProps) {
  const baseClasses = 'inline-block text-white font-bold font-mono px-8 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden';
  
  const buttonContent = (
    <>
      <span className="uppercase inline-flex items-center gap-2 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-full">
        {text}
        {icon}
      </span>
      <span className="uppercase inline-flex items-center gap-2 absolute inset-0 justify-center opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 group-hover:animate-[fadeInUp_0.8s_ease-out]">
        {text}
        {icon}
      </span>
    </>
  );

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    target.style.boxShadow = '0 8px 30px rgba(68, 0, 209, 0.5), 0 4px 15px rgba(54, 195, 201, 0.4), 0 0 60px rgba(68, 0, 209, 0.3)';
    target.style.filter = 'brightness(1.15)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    target.style.boxShadow = '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)';
    target.style.filter = 'brightness(1)';
  };

  const style = {
    background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))',
    boxShadow: '0 4px 15px rgba(68, 0, 209, 0.3), 0 2px 5px rgba(0, 0, 0, 0.2)',
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={`${baseClasses} ${className}`}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {buttonContent}
    </button>
  );
}

