import type React from "react"
import { useState, useRef, useEffect } from "react"

interface ResizableProps {
  children: React.ReactNode
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  defaultWidth?: number
  defaultHeight?: number
  onResize?: (width: number, height: number) => void
}

export const Resizable: React.FC<ResizableProps> = ({
  children,
  minWidth = 300,
  minHeight = 200,
  maxWidth = 800,
  maxHeight = 600,
  defaultWidth = 384,
  defaultHeight = 512,
  onResize,
  ...props
}) => {
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight })
  const resizableRef = useRef<HTMLDivElement>(null)
  const resizerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const resizable = resizableRef.current
    const resizer = resizerRef.current

    if (!resizable || !resizer) return

    let startX: number, startY: number, startWidth: number, startHeight: number

    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX
      startY = e.clientY
      startWidth = resizable.offsetWidth
      startHeight = resizable.offsetHeight
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseup", onMouseUp)
    }

    const onMouseMove = (e: MouseEvent) => {
      const newWidth = Math.min(Math.max(startWidth + e.clientX - startX, minWidth), maxWidth)
      const newHeight = Math.min(Math.max(startHeight + e.clientY - startY, minHeight), maxHeight)
      setSize({ width: newWidth, height: newHeight })
      if (onResize) onResize(newWidth, newHeight)
    }

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
    }

    resizer.addEventListener("mousedown", onMouseDown)

    return () => {
      resizer.removeEventListener("mousedown", onMouseDown)
    }
  }, [minWidth, minHeight, maxWidth, maxHeight, onResize])

  return (
    <div
      ref={resizableRef}
      style={{
        position: "relative",
        width: size.width,
        height: size.height,
        overflow: "hidden",
        ...props,
      }}
    >
      {children}
      <div
        ref={resizerRef}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "10px",
          height: "10px",
          cursor: "nwse-resize",
        }}
      />
    </div>
  )
}

