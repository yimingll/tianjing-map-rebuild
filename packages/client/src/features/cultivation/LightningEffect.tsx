import React, { useRef, useEffect, useCallback } from 'react';

export interface LightningEffectProps {
  width: number;
  height: number;
  onStrike?: () => void;
}

interface LightningBolt {
  points: { x: number; y: number }[];
  opacity: number;
  branches: { x: number; y: number }[][];
}

export const LightningEffect: React.FC<LightningEffectProps> = ({
  width,
  height,
  onStrike,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const currentBoltRef = useRef<LightningBolt | null>(null);

  // 生成闪电路径
  const generateLightningBolt = useCallback((): LightningBolt => {
    const points: { x: number; y: number }[] = [];
    const branches: { x: number; y: number }[][] = [];

    // 起点（屏幕顶部随机位置）
    const startX = width / 2 + (Math.random() - 0.5) * (width * 0.3);
    const startY = 0;

    // 终点（屏幕底部随机位置）
    const endX = width / 2 + (Math.random() - 0.5) * (width * 0.2);
    const endY = height;

    points.push({ x: startX, y: startY });

    // 生成主干路径
    const segments = 15 + Math.floor(Math.random() * 10);
    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      const x = startX + (endX - startX) * progress + (Math.random() - 0.5) * 60;
      const y = startY + (endY - startY) * progress;
      points.push({ x, y });

      // 随机生成分支
      if (Math.random() > 0.7 && i > 3 && i < segments - 3) {
        const branch: { x: number; y: number }[] = [];
        const branchLength = 3 + Math.floor(Math.random() * 5);
        let branchX = x;
        let branchY = y;

        branch.push({ x: branchX, y: branchY });

        for (let j = 0; j < branchLength; j++) {
          branchX += (Math.random() - 0.5) * 40;
          branchY += 30 + Math.random() * 30;
          branch.push({ x: branchX, y: branchY });
        }

        branches.push(branch);
      }
    }

    points.push({ x: endX, y: endY });

    return { points, opacity: 1, branches };
  }, [width, height]);

  // 绘制闪电
  const drawLightning = useCallback(
    (ctx: CanvasRenderingContext2D, bolt: LightningBolt) => {
      ctx.clearRect(0, 0, width, height);

      // 绘制发光效果
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#fff';

      // 绘制主干
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.opacity})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      bolt.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();

      // 绘制内部更亮的核心
      ctx.beginPath();
      ctx.strokeStyle = `rgba(200, 220, 255, ${bolt.opacity})`;
      ctx.lineWidth = 2;

      bolt.points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.stroke();

      // 绘制分支
      bolt.branches.forEach((branch) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${bolt.opacity * 0.7})`;
        ctx.lineWidth = 2;

        branch.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      });

      ctx.shadowBlur = 0;
    },
    [width, height]
  );

  // 动画循环
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (currentBoltRef.current) {
      // 淡出效果
      currentBoltRef.current.opacity -= 0.05;

      if (currentBoltRef.current.opacity <= 0) {
        currentBoltRef.current = null;
        ctx.clearRect(0, 0, width, height);
      } else {
        drawLightning(ctx, currentBoltRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }
  }, [width, height, drawLightning]);

  // 触发闪电
  const triggerLightning = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 生成新的闪电
    currentBoltRef.current = generateLightningBolt();

    // 播放音效（可选）
    if (onStrike) {
      onStrike();
    }

    // 开始动画
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animate();
  }, [generateLightningBolt, animate, onStrike]);

  // 暴露触发方法给父组件
  useEffect(() => {
    // 可通过 ref 访问 triggerLightning 方法
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

// Hook 用于控制闪电效果
export const useLightningEffect = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const triggerLightning = useCallback(() => {
    // 此实现需要通过自定义事件或其他方式与 LightningEffect 组件通信
    // 简化版本直接在此处绘制
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 生成闪电路径（简化版）
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#FFF';

    const startX = width / 2;
    const startY = 0;
    const endX = width / 2 + (Math.random() - 0.5) * 100;
    const endY = height;

    ctx.moveTo(startX, startY);
    for (let i = 0; i < 8; i++) {
      const x = startX + (Math.random() - 0.5) * 50;
      const y = (endY / 8) * (i + 1);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // 闪电闪烁动画
    setTimeout(() => {
      ctx.clearRect(0, 0, width, height);
    }, 150);
  }, [canvasRef]);

  return { triggerLightning };
};

export default LightningEffect;
