import { useState, useEffect } from "react";

/**
 * Component hiệu ứng scramble text animation
 * @param {string} text - Text cần hiển thị
 * @param {any} triggerKey - Key để trigger animation lại
 * @param {number} duration - Thời gian animation (ms)
 * @param {number} interval - Khoảng thời gian giữa các frame (ms)
 * @param {string} className - CSS class names
 */
const ScrambleText = ({ 
  text, 
  triggerKey, 
  duration = 400, 
  interval = 30, 
  className = "" 
}) => {
  const [display, setDisplay] = useState(text);
  
  useEffect(() => {
    let mounted = true;
    let frame = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=<>?";
    const textArr = text.split("");
    let revealCount = 0;
    
    setDisplay(textArr.map(() => "").join(""));
    
    const totalFrames = Math.ceil(duration / interval);
    
    const scramble = () => {
      if (!mounted) return;
      
      if (frame < totalFrames) {
        revealCount = Math.floor((frame / totalFrames) * textArr.length);
        const scrambled = textArr.map((c, i) => {
          if (i < revealCount) return c;
          if (c === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        });
        setDisplay(scrambled.join(""));
        frame++;
        setTimeout(scramble, interval);
      } else {
        setDisplay(text);
      }
    };
    
    scramble();
    
    return () => { 
      mounted = false; 
    };
  }, [triggerKey, text, duration, interval]);
  
  return <span className={className}>{display}</span>;
};

export default ScrambleText;

