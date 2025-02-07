import { useEffect, useState } from "react";

export default function useLoadingDots(defaultCount: number = 3) {
  const [count, setCount] = useState<{ count: number; right: boolean }>({
    count: 0,
    right: true,
  });

  const update = () => {
    setCount((prevCount) => {
      let flipped = false;
      let newCount = 0;
      if (prevCount.right) {
        newCount = prevCount.count + 1;
        if (newCount >= defaultCount) {
          flipped = true;
        }
      } else {
        newCount = prevCount.count - 1;
        if (newCount <= 0) {
          flipped = true;
        }
      }

      return {
        count: newCount,
        right: flipped ? !prevCount.right : prevCount.right,
      };
    });
  };

  const renderDots = (extra?: boolean) => {
    const calculatedCount = count.count + (extra ? 1 : 0);
    if (calculatedCount < 0) {
      return "";
    }

    return ".".repeat(calculatedCount).split("").join(" ");
  };

  const renderWalkingEmpty = () => {
    const first = "."
      .repeat(count.count + 1)
      .split("")
      .join(" ");
    const seccond = "."
      .repeat(defaultCount - count.count + 1)
      .split("")
      .join(" ");

    return `${first}  ${seccond}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      update();
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    renderDots,
    renderWalkingEmpty,
  };
}
