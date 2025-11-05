import { forwardRef } from "react";
import EmojiPicker from 'emoji-picker-react';

const EmojiPickerComponent = forwardRef(({ onEmojiSelect, onClose }, ref) => {
  const onEmojiClick = (emojiData, event) => {
    onEmojiSelect(emojiData.emoji);
  };

  return (
    <div 
      ref={ref}
      className="absolute bottom-12 left-0 z-50"
    >
      <EmojiPicker 
        onEmojiClick={onEmojiClick}
        width={320}
        height={300}
        searchDisabled={false}
        skinTonesDisabled={false}
        previewConfig={{
          showPreview: true,
          defaultEmoji: '1f60a',
          defaultCaption: 'Chọn emoji'
        }}
        theme="light"
        lazyLoadEmojis={true}
      />
    </div>
  );
});

EmojiPickerComponent.displayName = "EmojiPicker";

export default EmojiPickerComponent;
