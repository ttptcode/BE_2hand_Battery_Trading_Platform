import { motion } from "framer-motion";
import ScrambleText from "./ScrambleText";

/**
 * Component hiển thị navigation text với animation khi active
 * @param {boolean} isActive - Trạng thái active
 * @param {string} text - Text cần hiển thị
 * @param {string} triggerKey - Key để trigger animation
 * @param {string} className - CSS class names cho text
 */
const AnimatedNavText = ({ isActive, text, triggerKey, className = "text-xs" }) => {
  const animationConfig = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
    transition: { duration: 0.25 },
  };

  const cornerStyle = { 
    fontWeight: 900, 
    fontSize: '2rem' 
  };

  if (!isActive) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className="relative">
      {/* Top-left corner */}
      <motion.span
        {...animationConfig}
        className="absolute -left-2 -top-1 text-[#00c9a7] font-extrabold"
        style={cornerStyle}
      >
        ⌜
      </motion.span>
      
      {/* Main text with scramble effect */}
      <span className={`relative z-10 inline-block ${className}`}>
        <ScrambleText text={text} triggerKey={triggerKey} className="inline-block" />
      </span>
      
      {/* Bottom-right corner */}
      <motion.span
        {...animationConfig}
        className="absolute -right-2 -bottom-1 text-[#00c9a7] font-extrabold"
        style={cornerStyle}
      >
        ⌟
      </motion.span>
    </span>
  );
};

export default AnimatedNavText;

