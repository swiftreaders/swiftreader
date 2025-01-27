// app/trainWebGazer.ts

export function trainWebGazer(): void {
    const wg = (window as any).webgazer;
    if (!wg) {
      console.warn("webgazer not available on window.");
      return;
    }
  
    const regression = wg.getCurrentRegression?.();
    if (regression && typeof regression.train === "function") {
      // Train the underlying regression model
      regression.train();
      console.log("WebGazer regression model trained!");
    } else {
      console.warn("No valid regression found, or train() is not a function.");
    }
  }
  