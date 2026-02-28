import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Djefrid Byli Fotue Kuate - Développeur Full-Stack | Support IT';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Barre accent en haut */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
          }}
        />

        {/* Badge disponible */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            color: '#86efac',
            padding: '6px 16px',
            borderRadius: '999px',
            fontSize: '16px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
            }}
          />
          Disponible pour travailler
        </div>

        {/* Nom */}
        <div
          style={{
            fontSize: '68px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          Djefrid Byli Fotue Kuate
        </div>

        {/* Titre */}
        <div
          style={{
            fontSize: '28px',
            color: '#94a3b8',
            marginBottom: '48px',
            textAlign: 'center',
          }}
        >
          Développeur Full-Stack | Support IT
        </div>

        {/* Tech stack pills */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {['Django', 'Vue.js', 'React', 'Next.js', 'TypeScript', 'PostgreSQL', 'Docker'].map(
            (tech) => (
              <div
                key={tech}
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.4)',
                  color: '#a5b4fc',
                  padding: '8px 20px',
                  borderRadius: '999px',
                  fontSize: '18px',
                }}
              >
                {tech}
              </div>
            )
          )}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            color: '#475569',
            fontSize: '20px',
          }}
        >
          portfolio.djefrid.ca
        </div>
      </div>
    ),
    { ...size }
  );
}
