import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ORANGE = "#00c9a7"; // EV green
const BROWN = "#0b5e54"; // darker green for borders
const NUM_COLUMNS = 6;

function TickerNumbers({ onFinish }) {
  const [number, setNumber] = useState(0);
  useEffect(() => {
    let current = 0;
    const max = 100;
    const interval = setInterval(() => {
      current += 3;
      setNumber(current);
      if (current >= max) {
        clearInterval(interval);
        setTimeout(onFinish, 40);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [onFinish]);

  // Chuyển số thành chuỗi, padLeft để luôn có 3 chữ số
  const numStr = String(number > 100 ? 100 : number).padStart(3, "0").split("");

  return (
    <div style={{
      display: "flex",
      gap: "2vw",
      justifyContent: "center",
      alignItems: "center",
      width: "100vw",
    }}>
      {numStr.map((digit, idx) => (
        <div
          key={idx}
          style={{
            width: "13vw",
            height: "18vw",
            background: ORANGE,
            border: `4px solid ${BROWN}`,
            borderRadius: "2vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12vw",
            fontWeight: 900,
            color: "#23180f",
            boxShadow: "0 2px 12px #0002",
            fontFamily: "monospace, 'Roboto Mono', 'Montserrat', Arial",
            userSelect: "none",
            transition: "background 0.2s, border 0.2s"
          }}
        >
          {digit}
        </div>
      ))}
    </div>
  );
}

function SplitReveal({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 300); // split nhanh
    return () => clearTimeout(timer);
  }, [onFinish]);
  return (
    <div
      style={{
        position: "absolute", inset: 0, width: "100vw", height: "100vh",
        display: "flex", zIndex: 9999, pointerEvents: "none"
      }}
    >
      {Array.from({ length: NUM_COLUMNS }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0 }}
          animate={{
            x: i < NUM_COLUMNS / 2
              ? `-100vw`
              : `100vw`
          }}
          transition={{
            delay: 0.03 + Math.abs(i - NUM_COLUMNS / 2) * 0.03,
            duration: 0.3,
            ease: [0.77, 0, 0.175, 1]
          }}
          style={{
            flex: 1,
            background: ORANGE,
            height: "100%",
            margin: 0,
          }}
        />
      ))}
    </div>
  );
}

export default function Preloader({ onFinish }) {
  const [phase, setPhase] = useState("ticker");
  useEffect(() => {
    if (phase === "done" && onFinish) onFinish();
  }, [phase, onFinish]);
  return (
    <AnimatePresence>
      {phase !== "done" && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }} // Phủ kín trang, không hiệu ứng xuất hiện
          animate={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.38, ease: [0.77, 0, 0.175, 1] } }} // Kéo từ dưới lên để lộ trang
          style={{
            position: "fixed", inset: 0, width: "100vw", height: "100vh",
            background: ORANGE, zIndex: 9999, display: "flex",
            alignItems: "center", justifyContent: "center",
            flexDirection: "column"
          }}
        >
          {phase === "ticker" && (
            <TickerNumbers onFinish={() => setPhase("split")} />
          )}
          {phase === "split" && (
            <SplitReveal onFinish={() => setPhase("done")} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 