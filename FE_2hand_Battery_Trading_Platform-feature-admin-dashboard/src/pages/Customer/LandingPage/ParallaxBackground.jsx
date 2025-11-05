import React, { useEffect, useRef, useState } from "react";

const GRID_COLS = 16;

function ParallaxBackground({ isDarkMode }) {
  const [gridHeight, setGridHeight] = useState(window.innerHeight);
  const gridRef = useRef();

  useEffect(() => {
    // Chỉ cập nhật gridHeight khi resize cửa sổ, không lấy scrollHeight nữa
    const updateHeight = () => {
      setGridHeight(window.innerHeight);
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const GRID_ROWS = Math.round(gridHeight / 75);

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100vw",
          height: "100vh",
          background: isDarkMode ? "#222" : "#d5d5d5",
          zIndex: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div
        ref={gridRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <svg
          width="100%"
          height={gridHeight}
          viewBox={`0 0 1600 ${gridHeight}`}
          style={{ position: "absolute", inset: 0, opacity: 0.18 }}
        >
          {/* Grid lines */}
          {Array.from({ length: GRID_ROWS + 1 }).map((_, i) => (
            <line
              key={"row-" + i}
              x1={0}
              y1={(gridHeight / GRID_ROWS) * i}
              x2={1600}
              y2={(gridHeight / GRID_ROWS) * i}
              stroke={isDarkMode ? "#444" : "#888888"}
              strokeWidth={2}
            />
          ))}
          {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
            <line
              key={"col-" + i}
              y1={0}
              x1={(1600 / GRID_COLS) * i}
              y2={gridHeight}
              x2={(1600 / GRID_COLS) * i}
              stroke={isDarkMode ? "#444" : "#888888"}
              strokeWidth={2}
            />
          ))}
        </svg>
      </div>
    </>
  );
}

export default ParallaxBackground; 