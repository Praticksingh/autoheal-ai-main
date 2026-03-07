import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import App from "@/App";

export default function SmoothScrollApp() {
	useEffect(() => {
		const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const isMobileViewport = window.innerWidth < 768;

		if (prefersReducedMotion || isMobileViewport) {
			return;
		}

		const lenis = new Lenis({
			duration: 0.8,
			smooth: true,
			direction: "vertical",
			gestureDirection: "vertical",
			smoothTouch: false,
			touchMultiplier: 1.2,
			lerp: 0.12,
		});

		let rafId = 0;
		const raf = (time: number) => {
			lenis.raf(time);
			rafId = requestAnimationFrame(raf);
		};

		rafId = requestAnimationFrame(raf);

		return () => {
			cancelAnimationFrame(rafId);
			lenis.destroy();
		};
	}, []);

	return <App />;
}
