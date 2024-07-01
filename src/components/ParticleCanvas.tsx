import { useRef, useEffect } from 'react';

interface Mouse {
  x: number,
  y: number,
  radius: number
}

class Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  pushForce: number;
  color: string;

  constructor(
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    radius: number,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.radius = radius;
    this.color = color;
    this.pushForce = this.radius/2;
  }

  tick(canvas: HTMLCanvasElement, mouse: Mouse, pushRadius: number = 10) {
    // Bounding box collision detection
    if (this.x + this.radius >= canvas.width || this.x - this.radius <= 0) {
      this.velocityX = -this.velocityX;
    }
    if (this.y + this.radius >= canvas.height || this.y - this.radius <= 0) {
      this.velocityY = -this.velocityY;
    }

    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius + this.radius) {
      if (mouse.x < this.x && this.x < canvas.width - this.radius * pushRadius) {
        this.x += this.pushForce;
        this.velocityX = -this.velocityX;
      }
      if (mouse.x > this.x && this.x > this.radius * pushRadius) {
        this.x -= this.pushForce;
        this.velocityX = -this.velocityX;
      }
      if (mouse.y < this.y && this.y < canvas.height - this.radius * pushRadius) {
        this.y += this.pushForce;
        this.velocityY = -this.velocityY;
      }
      if (mouse.y > this.y && this.y > this.radius * pushRadius) {
        this.y -= this.pushForce;
        this.velocityY = -this.velocityY;
      }
    }

    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  render(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
  }

  randomVelocity() {
    let velocityX = Math.random() * 0.5 + 0.5;
    let velocityY = Math.random() * 0.5 + 0.5;
    const negateX = Math.random() < 0.5;
    const negateY = Math.random() < 0.5;

    if (negateX) {
      velocityX = -velocityX;
    }
    if (negateY) {
      velocityY = -velocityY;
    }

    this.velocityX = velocityX;
    this.velocityY = velocityY;
  }

  randomPosition(maxX: number, maxY: number) {
    this.x = Math.random() * (maxX - this.radius * 2) + this.radius;
    this.y = Math.random() * (maxY - this.radius * 2) + this.radius;
  }
}

const initParticleArray = (maxX: number, maxY: number): Particle[] => {
  let particles: Particle[] = [];

  const numParticles = 20;
  const radius = 4;
  const color = "rgb(108, 250, 132)";

  for (let i = 0; i < numParticles; i++) {
    const particle = new Particle(0, 0, 0, 0, radius, color);

    particle.randomVelocity();
    particle.randomPosition(maxX, maxY);
    particles.push(particle);
  }

  return particles;
};

// TODO: Implement spatial hashing instead of brute force O(n^2) approach
const connectParticles = (
  particles: Particle[],
  context: CanvasRenderingContext2D,
  minDistance: number
) => {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = dx*dx + dy*dy;
      const opacity = 1 - distance / minDistance;

      if (distance <= minDistance) {
        context.strokeStyle = `rgba(108, 250, 132, ${opacity})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(particles[i].x, particles[i].y);
        context.lineTo(particles[j].x, particles[j].y);
        context.stroke();
      }
    }
  }
}

const MOUSE_PUSH_RADIUS = 5;

interface PropTypes {
  className?: string;
}

const ParticleCanvas = ({ className }: PropTypes) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;

      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      particles.forEach(p => {
        if (p.x >= canvas.width || p.y >= canvas.height) {
          p.randomPosition(canvas.width, canvas.height);
        }
      });
    };

    const particles = initParticleArray(canvas.width, canvas.height);
    const minConnectDistance = (canvas.width/4) * (canvas.height/4);
    const mouse: Mouse = {
      x: 0,
      y: 0,
      radius: (canvas.height/80) * (canvas.width/80)
    }
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.tick(canvas, mouse, MOUSE_PUSH_RADIUS);
        p.render(context);
      });
      
      connectParticles(particles, context, minConnectDistance);
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);

      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className={className} />
  )
};

export default ParticleCanvas;
