// Minimal shape of gaze data
interface GazeData {
    x: number;
    y: number;
    // add additional fields if needed
  }
  
  interface WebGazer {
    setGazeListener(
      listener: (data: GazeData | null, elapsedTime: number) => void
    ): this;
    begin(): Promise<void>;
    end(): this;
    pause(): this;
    resume(): this;
    clearData(): this;
    showVideo(show: boolean): this;
    showPredictionPoints(show: boolean): this;
    params: {
      useMouseData: boolean;
      predictionInterval: number;
      videoViewerWidth?: number;
      videoViewerHeight?: number;
      [key: string]: any;
    };
  }
  
  declare module "webgazer" {
    const webgazer: WebGazer;
    export = webgazer;
  }
  