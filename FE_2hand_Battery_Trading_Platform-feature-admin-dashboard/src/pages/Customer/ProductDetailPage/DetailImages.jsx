import React, { useState, useMemo } from "react";
import { Image, Empty, Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { normalizeImageUrl, normalizeImageUrls } from "../../../utils/imageUrlHelper";

// Fallback image data URI (1x1 gray pixel)
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='380'%3E%3Crect width='800' height='380' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";
const FALLBACK_THUMB = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='70'%3E%3Crect width='100' height='70' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='10' fill='%236b7280'%3ENo Image%3C/text%3E%3C/svg%3E";

const DetailImages = ({ images = [], videoUrl = null, isDarkMode = false }) => {
  const [current, setCurrent] = useState(0);
  const [thumbStart, setThumbStart] = useState(0);
  const VISIBLE_COUNT = 4; // số thumbnail hiển thị

  // Normalize và combine images and video into media array
  const normalizedImages = useMemo(() => {
    return normalizeImageUrls(images);
  }, [images]);

  const normalizedVideoUrl = useMemo(() => {
    return videoUrl ? normalizeImageUrl(videoUrl) : null;
  }, [videoUrl]);

  const media = useMemo(() => {
    const mediaArray = normalizedImages.map(item => {
      if (typeof item === 'string') {
        return { type: 'image', url: item };
      }
      return {
        ...item,
        url: item.url ? normalizeImageUrl(item.url) : item.url,
      };
    });
    
    if (normalizedVideoUrl) {
      mediaArray.push({ type: 'video', url: normalizedVideoUrl });
    }
    
    return mediaArray;
  }, [normalizedImages, normalizedVideoUrl]);

  if (!media || media.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Empty description="Chưa có ảnh sản phẩm" />
      </div>
    );
  }

  const currentMedia = typeof media[current] === 'string' 
    ? { type: 'image', url: media[current] } 
    : media[current];

  const prevImage = () => {
    setCurrent((prev) => {
      let newIndex;
      if (prev === 0) {
        newIndex = media.length - 1;
        setThumbStart(Math.max(media.length - VISIBLE_COUNT, 0));
      } else {
        newIndex = prev - 1;
        if (newIndex < thumbStart) setThumbStart(newIndex);
      }
      return newIndex;
    });
  };

  const nextImage = () => {
    setCurrent((prev) => {
      let newIndex;
      if (prev === media.length - 1) {
        newIndex = 0;
        setThumbStart(0);
      } else {
        newIndex = prev + 1;
        if (newIndex >= thumbStart + VISIBLE_COUNT) {
          setThumbStart(newIndex - VISIBLE_COUNT + 1);
        }
      }
      return newIndex;
    });
  };

  const visibleThumbs = media.slice(thumbStart, thumbStart + VISIBLE_COUNT);

  return (
    <div className="car-gallery" style={{ position: "relative" }}>
      {/* Media chính (Ảnh hoặc Video) */}
      <div style={{ textAlign: "center", marginBottom: 16, position: "relative" }}>
        {currentMedia.type === 'video' ? (
          <video
            src={currentMedia.url}
            controls
            width="100%"
            height={380}
            style={{ objectFit: "cover", borderRadius: 8, backgroundColor: "#000" }}
          >
            Trình duyệt của bạn không hỗ trợ video.
          </video>
        ) : (
          <Image
            src={currentMedia.url || currentMedia}
            alt={`media-${current}`}
            width={"100%"}
            height={380}
            style={{ objectFit: "cover", borderRadius: 8 }}
            fallback={FALLBACK_IMAGE}
          />
        )}

        {/* Badge đếm vị trí: 1/4 */}
        <div
          aria-label={`${currentMedia.type === 'video' ? 'Video' : 'Ảnh'} ${current + 1} trên ${media.length}`}
          style={{
            position: "absolute",
            bottom: 15,
            right: 10,
            zIndex: 11,
            background: "rgba(120,120,120,0.55)",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 12,
            fontSize: 12,
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {current + 1} / {media.length}
        </div>

        {/* Nút Prev */}
        <Button
          shape="circle"
          icon={<LeftOutlined style={{ color: isDarkMode ? 'white' : 'inherit' }} />}
          onClick={prevImage}
          style={{
            width: "40px",
            height: "40px",
            position: "absolute",
            top: "50%",
            left: "5px",
            transform: "translateY(-50%)",
            zIndex: 10,
            backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'white',
            borderColor: isDarkMode ? '#4b5563' : '#d9d9d9',
          }}
        />

        {/* Nút Next */}
        <Button
          shape="circle"
          icon={<RightOutlined style={{ color: isDarkMode ? 'white' : 'inherit' }} />}
          onClick={nextImage}
          style={{
            width: "40px",
            height: "40px",
            position: "absolute",
            top: "50%",
            right: "5px",
            transform: "translateY(-50%)",
            zIndex: 10,
            backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'white',
            borderColor: isDarkMode ? '#4b5563' : '#d9d9d9',
          }}
        />
      </div>

      {/* Thumbnail bên dưới */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <Button
          shape="circle"
          icon={<LeftOutlined style={{ color: isDarkMode ? 'white' : 'inherit' }} />}
          onClick={() => {
            if (thumbStart > 0) setThumbStart(thumbStart - 1);
          }}
          disabled={thumbStart === 0}
          style={{
            backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'white',
            borderColor: isDarkMode ? '#4b5563' : '#d9d9d9',
          }}
        />

        <div className={`flex gap-2 justify-center w-min-${VISIBLE_COUNT * 120} overflow-hidden`}>
          {visibleThumbs.map((item, index) => {
            const realIndex = thumbStart + index;
            const thumbMedia = typeof item === 'string' 
              ? { type: 'image', url: item } 
              : item;
            
            return (
              <div
                key={realIndex}
                style={{
                  position: 'relative',
                  width: 100,
                  height: 70,
                  borderRadius: 4,
                  border: current === realIndex ? "3px solid #00C9A7" : "1px solid #ddd",
                  cursor: "pointer",
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}
                onClick={() => setCurrent(realIndex)}
              >
                {thumbMedia.type === 'video' ? (
                  <>
                    <video
                      src={thumbMedia.url}
                      width="100%"
                      height="100%"
                      style={{ objectFit: "cover", display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: 'white',
                      fontSize: '24px',
                      pointerEvents: 'none',
                    }}>
                      ▶
                    </div>
                  </>
                ) : (
                  <Image
                    src={thumbMedia.url || thumbMedia}
                    alt={`thumb-${realIndex}`}
                    width="100%"
                    height="100%"
                    preview={false}
                    style={{ objectFit: "cover", display: 'block' }}
                    fallback={FALLBACK_THUMB}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Button
          shape="circle"
          icon={<RightOutlined style={{ color: isDarkMode ? 'white' : 'inherit' }} />}
          onClick={() => {
            if (thumbStart + VISIBLE_COUNT < media.length) {
              setThumbStart(thumbStart + 1);
            }
          }}
          disabled={thumbStart + VISIBLE_COUNT >= media.length}
          style={{
            backgroundColor: isDarkMode ? 'rgba(55, 65, 81, 0.8)' : 'white',
            borderColor: isDarkMode ? '#4b5563' : '#d9d9d9',
          }}
        />
      </div>
    </div>
  );
};

export default DetailImages;
