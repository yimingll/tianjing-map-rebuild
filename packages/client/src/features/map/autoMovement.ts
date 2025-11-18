/**
 * 自动移动控制器 - 执行路径移动
 */

interface AutoMovementCallbacks {
  sendCommand: (command: string) => void
  onProgress?: (current: number, total: number, direction: string) => void
  onComplete?: () => void
  onError?: (error: string) => void
}

class AutoMovementController {
  private path: string[] = []
  private currentIndex: number = 0
  private isMoving: boolean = false
  private callbacks: AutoMovementCallbacks | null = null
  private moveDelay: number = 800 // 每步移动延迟(ms)
  private timeoutId: number | null = null

  /**
   * 开始自动移动
   * @param path 移动路径，如 ['north', 'east', 'south']
   * @param callbacks 回调函数
   */
  startMoving(path: string[], callbacks: AutoMovementCallbacks) {
    if (this.isMoving) {
      return
    }

    if (!path || path.length === 0) {
      callbacks.onError?.('路径为空')
      return
    }

    this.path = path
    this.currentIndex = 0
    this.isMoving = true
    this.callbacks = callbacks

    this.executeNextMove()
  }

  /**
   * 执行下一步移动
   */
  private executeNextMove() {
    if (!this.isMoving || !this.callbacks) {
      return
    }

    if (this.currentIndex >= this.path.length) {
      // 移动完成
      this.isMoving = false
      this.callbacks.onComplete?.()
      this.cleanup()
      return
    }

    const direction = this.path[this.currentIndex]

    // 发送移动命令
    this.callbacks.sendCommand(direction)

    // 触发进度回调
    this.callbacks.onProgress?.(
      this.currentIndex + 1,
      this.path.length,
      direction
    )

    // 延迟后执行下一步
    this.currentIndex++
    this.timeoutId = window.setTimeout(() => {
      this.executeNextMove()
    }, this.moveDelay)
  }

  /**
   * 停止移动
   */
  stop() {
    if (!this.isMoving) {
      return
    }

    this.isMoving = false
    this.callbacks?.onError?.('移动已中断')
    this.cleanup()
  }

  /**
   * 清理资源
   */
  private cleanup() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.path = []
    this.currentIndex = 0
    this.callbacks = null
  }

  /**
   * 检查是否正在移动
   */
  isActive(): boolean {
    return this.isMoving
  }

  /**
   * 获取当前进度
   */
  getProgress(): { current: number; total: number } {
    return {
      current: this.currentIndex,
      total: this.path.length
    }
  }
}

// 导出单例
export const autoMovementController = new AutoMovementController()
