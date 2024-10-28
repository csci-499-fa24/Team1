import { useState, useRef, useEffect } from 'react';

export const useDraggableCard = (initialPosition) => {
  const [cardPosition, setCardPosition] = useState(initialPosition);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    isDragging.current = true;
    dragStart.current = { x: clientX - cardPosition.x, y: clientY - cardPosition.y };
  };

  const handleDragMove = (e) => {
    if (!isDragging.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setCardPosition({ x: clientX - dragStart.current.x, y: clientY - dragStart.current.y });
  };

  const handleDragEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleDragMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleDragMove);
    window.addEventListener("touchend", handleDragEnd);

    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, []);

  return { cardPosition, setCardPosition, handleDragStart };
};
