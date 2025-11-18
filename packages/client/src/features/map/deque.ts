/**
 * 双端队列 (Deque) - 用于高效的BFS
 *
 * 性能对比：
 * - Array.shift(): O(n) - 需要移动所有元素
 * - Deque.shift(): O(1) - 只需要移动头指针
 */

export class Deque<T> {
  private items: T[]
  private head: number
  private tail: number

  constructor() {
    this.items = []
    this.head = 0
    this.tail = 0
  }

  /**
   * 在队尾添加元素 - O(1)
   */
  push(item: T): void {
    this.items[this.tail] = item
    this.tail++
  }

  /**
   * 从队首移除并返回元素 - O(1)
   */
  shift(): T | undefined {
    if (this.isEmpty()) {
      return undefined
    }

    const item = this.items[this.head]
    delete this.items[this.head] // 释放内存
    this.head++

    // 当队列为空时，重置指针以释放内存
    if (this.head === this.tail) {
      this.clear()
    }
    // 当浪费的空间超过一半时，压缩数组
    else if (this.head > 1000 && this.head >= this.tail / 2) {
      this.compact()
    }

    return item
  }

  /**
   * 查看队首元素但不移除 - O(1)
   */
  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined
    }
    return this.items[this.head]
  }

  /**
   * 检查队列是否为空 - O(1)
   */
  isEmpty(): boolean {
    return this.head === this.tail
  }

  /**
   * 获取队列长度 - O(1)
   */
  get length(): number {
    return this.tail - this.head
  }

  /**
   * 清空队列 - O(1)
   */
  clear(): void {
    this.items = []
    this.head = 0
    this.tail = 0
  }

  /**
   * 压缩数组，移除空闲空间 - O(n)
   * 只在浪费空间过多时调用
   */
  private compact(): void {
    const newItems: T[] = []
    for (let i = this.head; i < this.tail; i++) {
      newItems.push(this.items[i])
    }
    this.items = newItems
    this.tail = newItems.length
    this.head = 0
  }

  /**
   * 转为数组（用于调试）
   */
  toArray(): T[] {
    const result: T[] = []
    for (let i = this.head; i < this.tail; i++) {
      result.push(this.items[i])
    }
    return result
  }
}
