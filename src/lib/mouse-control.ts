import {invoke} from "@tauri-apps/api/core";

let lastX = 0;
let lastY = 0;
let isSending = false;
const queue: {x: number, y: number}[] = [];

export async function sendMousePosition(x: number, y: number) {
    // Дебаунс и дедупликация координат
    if (Math.abs(x - lastX) < 2 && Math.abs(y - lastY) < 2) return;

    lastX = x;
    lastY = y;
    queue.push({x, y});

    if (!isSending) {
        isSending = true;
        await processQueue();
    }
}

async function processQueue() {
    if (queue.length === 0) {
        isSending = false;
        return;
    }

    const {x, y} = queue.shift()!;
    try {
        await invoke('mouse_move', { x, y });
    } catch (e) {
        console.error('Mouse move error:', e);
    }

    // Оптимальная частота обновления (~60 FPS)
    setTimeout(processQueue, 16);
}