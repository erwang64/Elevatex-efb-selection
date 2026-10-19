import { useRef, useEffect } from 'react'

export function useDragScroll<T extends HTMLElement>() {
  const scrollRef = useRef<T | null>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let isMouseDown = false
    let startY = 0
    let startScrollTop = 0
    let isDragging = false

    const handleMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return
      const target = event.target as HTMLElement | null
      if (target && target.closest('button, input, a, textarea')) {
        return
      }

      isMouseDown = true
      isDragging = false
      startY = event.clientY
      startScrollTop = container.scrollTop
      container.style.userSelect = 'none'
      container.style.cursor = 'grab'
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!isMouseDown) return
      const deltaY = event.clientY - startY

      if (Math.abs(deltaY) > 4) {
        isDragging = true
        container.style.cursor = 'grabbing'
      }

      container.scrollTop = startScrollTop - deltaY
    }

    const handleMouseUp = () => {
      isMouseDown = false
      container.style.userSelect = ''
      container.style.cursor = ''
      setTimeout(() => {
        isDragging = false
      }, 50)
    }

    const handleClickCapture = (event: MouseEvent) => {
      if (isDragging) {
        event.stopPropagation()
        event.preventDefault()
      }
    }

    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('click', handleClickCapture, true)

    return () => {
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('click', handleClickCapture, true)
    }
  }, [])

  return scrollRef
}
