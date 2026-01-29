import React from "react";

interface PlaceholderImageProps {
  /** Width of the placeholder in pixels */
  width?: number;
  /** Height of the placeholder in pixels */
  height?: number;
  /** Text to display in the placeholder */
  text?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SVG placeholder image component
 * Renders a branded placeholder with optional text
 */
export function PlaceholderImage({
  width = 400,
  height = 300,
  text = "Image",
  className = "",
}: PlaceholderImageProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`rounded-lg ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width={width} height={height} fill="#0B132B" />

      {/* Grid pattern */}
      <defs>
        <pattern
          id="grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#1C6ED5"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#grid)" />

      {/* Icon */}
      <g transform={`translate(${width / 2 - 24}, ${height / 2 - 36})`}>
        <rect
          x="4"
          y="4"
          width="40"
          height="32"
          rx="4"
          fill="none"
          stroke="#1C6ED5"
          strokeWidth="2"
        />
        <circle cx="16" cy="16" r="4" fill="#1C6ED5" />
        <path
          d="M4 28 L16 20 L24 26 L36 16 L44 24"
          fill="none"
          stroke="#1C6ED5"
          strokeWidth="2"
        />
      </g>

      {/* Text */}
      <text
        x={width / 2}
        y={height / 2 + 32}
        textAnchor="middle"
        fill="#8A8F98"
        fontSize="14"
        fontFamily="system-ui, sans-serif"
      >
        {text}
      </text>
    </svg>
  );
}

export default PlaceholderImage;
