<script lang="ts">
  import { onMount } from "svelte";
  import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
  import { Camera } from "@mediapipe/camera_utils";
  import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
  import { sendMousePosition } from "$lib/mouse-control";
  let videoElement: HTMLVideoElement;
  let canvasElement: HTMLCanvasElement;
  let camera: Camera | null = null;
  let results: any = null;
  let lastSentTime = 0;
  const SEND_INTERVAL = 16; // ~60 FPS (в миллисекундах)

  let emoji = $state();
  // Конфигурация MediaPipe Hands
  const hands = new Hands({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    },
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  hands.onResults((handResults) => {
    results = handResults;
    drawResults(handResults);

    // Отправляем координаты указательного пальца
    if (handResults.multiHandLandmarks?.[0]) {
      const indexFinger = handResults.multiHandLandmarks[0][8]; // Кончик указательного пальца
      const now = performance.now();

      if (now - lastSentTime > SEND_INTERVAL) {
        const x = indexFinger.x * canvasElement.width;
        const y = indexFinger.y * canvasElement.height;
        sendMousePosition(~~x, ~~y);
        lastSentTime = now;
      }
    }
  });

  // Функция для отправки координат в Rust

  // Функция для отрисовки результатов
  const drawResults = (results: any) => {
    const canvasCtx = canvasElement.getContext("2d");
    if (!canvasCtx) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
      results.image,
      0,
      0,
      canvasElement.width,
      canvasElement.height,
    );

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 2,
        });
        drawLandmarks(canvasCtx, landmarks, {
          color: "#FF0000",
          lineWidth: 1,
          radius: 2,
        });
      }
    }
    canvasCtx.restore();
  };

  // Инициализация камеры
  onMount(() => {
    if (typeof window !== "undefined") {
      camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({ image: videoElement });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }

    return () => {
      if (camera) {
        camera.stop();
      }
    };
  });

  const getFingerInfo = (landmarks: any) => {
    if (!landmarks || landmarks.length === 0) return null;

    // Индексы кончиков пальцев в landmarks массиве
    const fingerTips = [4, 8, 12, 16, 20];
    const fingerNames = ["Thumb", "Index", "Middle", "Ring", "Pinky"];

    return fingerTips.map((tipIdx, i) => {
      const tip = landmarks[tipIdx];
      return {
        name: fingerNames[i],
        x: tip.x,
        y: tip.y,
        z: tip.z,
      };
    });
  };
</script>

<!--{#if results?.multiHandLandmarks}-->
<!--  <div class="finger-info">-->
<!--    <h3>Finger Positions</h3>-->
<!--    {#each results.multiHandLandmarks as landmarks, i}-->
<!--      <div class="hand">-->
<!--        <h4>Hand {i + 1}</h4>-->
<!--        {#each getFingerInfo(landmarks) as finger}-->
<!--          <div>-->
<!--            {finger.name}:-->
<!--            X: {finger.x.toFixed(2)},-->
<!--            Y: {finger.y.toFixed(2)},-->
<!--            Z: {finger.z.toFixed(2)}-->
<!--          </div>-->
<!--        {/each}-->
<!--      </div>-->
<!--    {/each}-->
<!--  </div>-->
<!--{/if}-->

<div class="hand-tracking-container">
  <h2>Hand Tracking with MediaPipe</h2>

  <video bind:this={videoElement} class="input_video" hidden></video>

  <canvas
    bind:this={canvasElement}
    class="output_canvas hamburger-menu pause-button fps-60"
    width="1920"
    height="1080"
  ></canvas>

  {#if results}
    <div class="results">
      <p>Hands detected: {results.multiHandLandmarks?.length || 0}</p>
    </div>
  {/if}
</div>

<style>
  .finger-info {
    margin-top: 1rem;
    padding: 1rem;
    background: #f0f0f0;
    border-radius: 4px;
    height: 250px;
  }

  .hand {
    margin-bottom: 1rem;
  }

  .hand-tracking-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin: 1rem;
  }

  .output_canvas {
    max-width: 100%;
    border: 2px solid #333;
    border-radius: 4px;
  }

  .results {
    margin-top: 1rem;
    font-size: 1.2rem;
  }
</style>
