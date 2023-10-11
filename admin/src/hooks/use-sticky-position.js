import { useCallback, useEffect, useState } from 'react';

import { STRAPI_HEADER_HEIGHT } from '../constants';

const useStickyPosition = (ref, enabled = true) => {
  const [isSticky, setSticky] = useState(false);
  const [stickyWidth, setStickyWidth] = useState(null);

  const onResize = useCallback(() => {
    if (!ref.current) {
      return;
    }

    setStickyWidth(ref.current.parentNode.getBoundingClientRect().width);
  }, [ref, setStickyWidth]);

  const onScroll = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const destination = ref.current.parentNode.getBoundingClientRect().top;
    const isStickyPos = ref.current.style.position === 'fixed';

    if (!isStickyPos && destination <= STRAPI_HEADER_HEIGHT) {
      setSticky(true);
    }

    if (isStickyPos && destination > STRAPI_HEADER_HEIGHT) {
      setSticky(false);
    }
  }, [ref, setSticky]);

  useEffect(() => {
    if (isSticky) {
      window.addEventListener('resize', onResize);

      onResize();
    } else {
      window.removeEventListener('resize', onResize);
    }

    return () => window.removeEventListener('resize', onResize);
  }, [isSticky, onResize]);

  useEffect(() => {
    if (enabled) {
      window.addEventListener('scroll', onScroll);

      onScroll();
    } else {
      window.removeEventListener('scroll', onScroll);
    }

    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled, onScroll]);

  return {
    isSticky,
    stickyWidth,
  };
};

export default useStickyPosition;
