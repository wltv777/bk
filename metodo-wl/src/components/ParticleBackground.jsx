import { useEffect, useRef } from 'react'

export default function ParticleBackground({ count = 30 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const particles = []
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      const size = Math.random() * 3 + 1
      const x = Math.random() * 100
      const duration = Math.random() * 15 + 10
      const delay = Math.random() * 10
      const opacity = Math.random() * 0.4 + 0.1
      const colors = ['#0066ff', '#7c3aed', '#00d4ff', '#f59e0b']
      const color = colors[Math.floor(Math.random() * colors.length)]

      p.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        left: ${x}%;
        bottom: -10px;
        opacity: 0;
        animation: particleFloat ${duration}s ${delay}s linear infinite;
        box-shadow: 0 0 ${size * 2}px ${color};
      `
      container.appendChild(p)
      particles.push(p)
    }

    return () => particles.forEach(p => p.remove())
  }, [count])

  return (
    <>
      <style>{`
        @keyframes particleFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: var(--op, 0.3); }
          90% { opacity: var(--op, 0.3); }
          100% { transform: translateY(-100vh) translateX(${Math.random() > 0.5 ? '+' : '-'}${Math.random() * 100}px); opacity: 0; }
        }
      `}</style>
      <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" />
    </>
  )
}
