'use client'

import { useEffect, useState } from 'react'

interface ConfettiProps {
  particleCount?: number
  colors?: string[]
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  color: string
  size: number
  shape: 'square' | 'circle'
}

export function Confetti({ 
  particleCount = 50, 
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'] 
}: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    
    // Initialize particles
    const initialParticles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: -10,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 3 + 2,
      gravity: 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 4,
      shape: Math.random() > 0.5 ? 'square' : 'circle'
    }))
    
    setParticles(initialParticles)
    
    const animate = () => {
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + particle.gravity
          }))
          .filter(particle => particle.y < window.innerHeight + 50)
      )
    }
    
    const animationId = setInterval(animate, 16) // ~60fps
    
    return () => clearInterval(animationId)
  }, [particleCount, colors])
  
  if (!mounted) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle, index) => (
        <div
          key={index}
          className="absolute transform-gpu"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: particle.shape === 'circle' ? '50%' : '0',
            transform: `rotate(${particle.x * 0.1}deg)`
          }}
        />
      ))}
    </div>
  )
}