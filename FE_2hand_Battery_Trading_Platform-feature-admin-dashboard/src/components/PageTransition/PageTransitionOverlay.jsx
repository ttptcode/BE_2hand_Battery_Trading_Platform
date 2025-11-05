import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const ORANGE = '#00c9a7';
const NUM_COLUMNS = 12; // Số cột chia overlay

export default function PageTransitionOverlay() {
  const location = useLocation();
  const [show, setShow] = useState(false);

  // Tạo delay ngẫu nhiên cho từng cột, memo theo location.pathname để mỗi lần chuyển trang sẽ random lại
  const randomDelays = useMemo(() => (
    Array.from({ length: NUM_COLUMNS }, () => 0.08 + Math.random() * 0.25)
  ), [location.pathname]);

  useEffect(() => {
    setShow(true);
    const timeout = setTimeout(() => setShow(false), 400); // thời gian overlay
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="overlay"
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          exit={{ y: 0 }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            zIndex: 9999, pointerEvents: 'none', display: 'flex', flexDirection: 'row',
          }}
        >
          {Array.from({ length: NUM_COLUMNS }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0 }}
              animate={{ y: 0 }}
              exit={{
                y: '-100vh',
                transition: {
                  duration: 0.38,
                  delay: randomDelays[i], // delay ngẫu nhiên cho từng cột
                  ease: [0.77, 0, 0.175, 1],
                },
              }}
              style={{
                flex: 1,
                height: '100%',
                background: ORANGE,
                opacity: 1,
                margin: 0,
                borderRight: i !== NUM_COLUMNS - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
} 