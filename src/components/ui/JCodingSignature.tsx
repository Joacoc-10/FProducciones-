import "./JCodingSignature.css";

type Variant = "signature" | "minimal" | "icon";

interface JCodingSignatureProps {
  variant?: Variant;
  theme?: "dark" | "light";
  language?: "es" | "en";
  animated?: boolean;
}

/**
 * Isotipo de JCoding: geometría idéntica a `jcoding-isotype.svg` del proyecto original
 * (florencia-biaturi). Se incrusta en línea (en lugar de importarlo como componente SVGR)
 * para no agregar dependencias; el grupo `.jcoding-signature__ring` es el aro que gira.
 */
function JCodingIsotype(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 108 108" fill="currentColor" {...props}>
      <g className="jcoding-signature__ring">
        <rect x="47.4" y="1.9" width="5.1" height="5.1" />
        <rect x="47.4" y="93.3" width="5.1" height="5.1" />
        <rect x="13.9" y="78.7" width="5.1" height="5.1" />
        <rect x="79.5" y="78.7" width="5.1" height="5.1" />
        <rect x="13.9" y="15.9" width="5.1" height="5.1" />
        <rect x="79.5" y="15.9" width="5.1" height="5.1" />
        <rect x="1.1" y="47.2" width="5.1" height="5.1" />
        <rect x="93.8" y="47.2" width="5.1" height="5.1" />
        <path d="M10.4,24.5c-3.8,5.8-6.2,12.2-7.1,19.1l-0.1,0.6h3l0.1-0.5c1-6.7,3.5-13.1,7.3-18.7l0.6-0.8h-3.5L10.4,24.5  z" />
        <path d="M6.1,55.8L6,55.3H3.1l0.1,0.6c0.9,7.1,3.2,13.6,7,19.6l0.2,0.2h3.5l-0.6-0.8C9.5,69.2,7,62.6,6.1,55.8z" />
        <path d="M93.7,43.8l0.1,0.5h3l-0.1-0.6c-1-6.9-3.4-13.3-7.1-19.1l-0.2-0.2h-3.5l0.6,0.8  C90.2,30.7,92.7,37.1,93.7,43.8z" />
        <path d="M93.9,55.3l-0.1,0.5c-0.9,6.8-3.4,13.5-7.2,19.1L86,75.7h3.5l0.2-0.2c3.8-5.9,6.2-12.5,7-19.6l0.1-0.6  L93.9,55.3L93.9,55.3z" />
        <path d="M74.1,13.2l0.1,0.1h5l-1.3-1C71.6,7.5,64,4.4,56.1,3.4l-0.6-0.1v3L56,6.4C62.5,7.3,68.6,9.5,74.1,13.2z" />
        <path d="M21.9,12.3l-1.3,1h5l0.1-0.1C31.3,9.5,37.4,7.3,44,6.4l0.5-0.1v-3l-0.6,0.1C35.9,4.4,28.3,7.5,21.9,12.3z" />
        <path d="M74.6,86.9c-5.6,3.7-12,6.2-18.7,7.1l-0.5,0.1v3L56,97c8.1-1.1,15.8-4.2,22.3-9.2l1.3-1L74.6,86.9  L74.6,86.9z" />
        <path d="M25.3,86.9l-0.2-0.1h-4.9l1.3,1c6.5,5,14.3,8.1,22.4,9.2l0.6,0.1v-3L44,94C37.3,93.1,30.8,90.6,25.3,86.9z" />
      </g>
      <g>
        <polygon points="36.7,59.6 24.3,49.6 36.8,40.6 39.7,44.7 32.6,49.8 39.8,55.7 " />
        <polygon points="63.2,59.6 60.1,55.7 67.3,49.8 60.2,44.7 63.1,40.6 75.6,49.6 " />
        <rect x="47.7" y="34" transform="matrix(0.9452 0.3264 -0.3264 0.9452 19.1192 -13.6479)" width="5" height="32.4" />
      </g>
    </svg>
  );
}

/** Crédito portable del desarrollador. Copiar este componente junto con su CSS. */
export default function JCodingSignature({
  variant = "signature",
  theme = "dark",
  language = "es",
  animated = true,
}: JCodingSignatureProps) {
  const intro = language === "en" ? "Designed and developed by" : "Diseñado y desarrollado por";

  return (
    <a
      className={`jcoding-signature jcoding-signature--${theme}${animated ? " jcoding-signature--animated" : ""}`}
      href="https://jcoding.vercel.app/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${intro} JCoding (${language === "en" ? "opens in a new tab" : "abre en una pestaña nueva"})`}
    >
      {variant === "signature" && <span className="jcoding-signature__intro">{intro}</span>}
      <span className="jcoding-signature__brand">
        <JCodingIsotype className="jcoding-signature__icon" aria-hidden="true" focusable="false" />
        {variant !== "icon" && (
          <>
            <span className="jcoding-signature__name">JCoding</span>
            <span aria-hidden="true">↗</span>
          </>
        )}
      </span>
    </a>
  );
}
