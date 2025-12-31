import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
	src: string;
}

export function AudioPlayer({ src }: AudioPlayerProps) {
	const audioRef = useRef<HTMLAudioElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [playing, setPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const [duration, setDuration] = useState(0);
	const [waveform, setWaveform] = useState<number[]>([]);

	useEffect(() => {
		fetch(src)
			.then((r) => r.arrayBuffer())
			.then((buf) => new AudioContext().decodeAudioData(buf))
			.then((audio) => {
				const data = audio.getChannelData(0);
				const bars = 50;
				const step = Math.floor(data.length / bars);
				const wave: number[] = [];
				for (let i = 0; i < bars; i++) {
					let sum = 0;
					for (let j = 0; j < step; j++) {
						const idx = i * step + j;
						sum += Math.abs(data[idx] ?? 0);
					}
					wave.push(sum / step);
				}
				const max = Math.max(...wave) || 1;
				setWaveform(wave.map((v) => v / max));
			});
	}, [src]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;
		const onTime = () => setProgress(audio.currentTime);
		const onMeta = () => setDuration(audio.duration);
		const onEnd = () => setPlaying(false);
		audio.addEventListener("timeupdate", onTime);
		audio.addEventListener("loadedmetadata", onMeta);
		audio.addEventListener("ended", onEnd);
		return () => {
			audio.removeEventListener("timeupdate", onTime);
			audio.removeEventListener("loadedmetadata", onMeta);
			audio.removeEventListener("ended", onEnd);
		};
	}, []);

	const toggle = () => {
		if (playing) audioRef.current?.pause();
		else audioRef.current?.play();
		setPlaying(!playing);
	};

	const seek = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const pct = (e.clientX - rect.left) / rect.width;
		if (audioRef.current) audioRef.current.currentTime = pct * duration;
	};

	const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
	const pct = duration ? progress / duration : 0;

	return (
		<div className="my-4 flex items-center gap-2 p-2 bg-bg-secondary border border-border rounded">
			<audio ref={audioRef} src={src} preload="metadata" />
			<button onClick={toggle} className="w-8 h-8 flex items-center justify-center text-accent hover:text-accent-hover shrink-0">
				{playing ? (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<rect x="6" y="4" width="4" height="16" />
						<rect x="14" y="4" width="4" height="16" />
					</svg>
				) : (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M8 5v14l11-7z" />
					</svg>
				)}
			</button>
			<div ref={containerRef} className="flex-1 flex items-center gap-px h-8 cursor-pointer" onClick={seek}>
				{waveform.map((v, i) => (
					<div
						key={i}
						className="flex-1 transition-colors"
						style={{
							height: `${Math.max(15, v * 100)}%`,
							backgroundColor: i / waveform.length < pct ? "#4a7c59" : "#333",
						}}
					/>
				))}
			</div>
			<span className="text-xs text-text-muted shrink-0">{fmt(progress)}/{fmt(duration || 0)}</span>
		</div>
	);
}
