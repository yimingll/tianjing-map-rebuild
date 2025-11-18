import { useEffect, useRef } from 'react'
import './InkWashEffect.css'

interface Particle {
  x: number
  y: number
  radius: number
  opacity: number
  vx: number
  vy: number
  life: number
}

function InkWashEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置画布尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 粒子数组
    const particles: Particle[] = []
    const maxParticles = 30

    // 创建粒子
    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 50 + 10,
        opacity: Math.random() * 0.05 + 0.02,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        life: Math.random() * 100 + 100
      }
    }

    // 初始化粒子
    for (let i = 0; i < maxParticles; i++) {
      particles.push(createParticle())
    }

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        // 更新位置
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life--

        // 边界检测
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // 重生粒子
        if (particle.life <= 0) {
          particles[index] = createParticle()
          return
        }

        // 绘制粒子
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius
        )
        gradient.addColorStop(0, `rgba(139, 69, 19, ${particle.opacity})`)
        gradient.addColorStop(1, 'rgba(139, 69, 19, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="ink-wash-canvas" />
}

export default InkWashEffect
