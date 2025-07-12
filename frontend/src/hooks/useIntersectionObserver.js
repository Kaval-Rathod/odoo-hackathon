import { useState, useEffect, useRef } from 'react';

const useIntersectionObserver = (options) => {
  const [node, setNode] = useState(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observer = useRef(null);
  const lastY = useRef(window.scrollY);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new window.IntersectionObserver(([entry]) => {
      const currentY = window.scrollY;
      const isScrollingDown = currentY > lastY.current;
      lastY.current = currentY;

      // Only animate when scrolling down.
      if (entry.isIntersecting && isScrollingDown) {
        setIsIntersecting(true);
      } else if (!entry.isIntersecting) {
        // Reset when it goes out of view
        setIsIntersecting(false);
      }
    }, options);

    const { current: currentObserver } = observer;

    if (node) {
      currentObserver.observe(node);
    }

    return () => {
      currentObserver.disconnect();
    };
  }, [node, options]);

  return [setNode, isIntersecting];
};

export default useIntersectionObserver; 