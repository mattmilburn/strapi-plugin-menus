import React, {useEffect, useState} from "react";

import {HEADER_HEIGHT} from "../constants";

const useStickyPosition = (ref) => {
  const [isSticky, setSticky] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) {
        return;
      }

      const destination = ref.current.parentNode.getBoundingClientRect().top;
      const isStickyPos = ref.current.style.position === "fixed";

      if (!isStickyPos && destination <= HEADER_HEIGHT) {
        setSticky(true);
      }

      if (isStickyPos && destination > HEADER_HEIGHT) {
        setSticky(false);
      }
    };

    // Run this function immediately.
    onScroll();

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [ref]);

  return isSticky;
};

export default useStickyPosition;
