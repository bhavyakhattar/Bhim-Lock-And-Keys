"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/lib/shop";
// The heavy R3F bundle is requested only after HTML has painted and this stage is visible.
const Scene = dynamic(() => import("./KeyScene"), {
  ssr: false,
  loading: () => null,
});
class Boundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
export default function KeyStage({
  story = false,
  rolling = false,
  locale,
}: {
  story?: boolean;
  rolling?: boolean;
  locale: Locale;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [eligible, setEligible] = useState(false);
  const [active, setActive] = useState(false);
  const [painted, setPainted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  const handleFail = useCallback(() => setFailed(true), []);
  const [gyro, setGyro] = useState(false);
  const [gyroStatus, setGyroStatus] = useState("");
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => {
      setEligible(!media.matches && (navigator.hardwareConcurrency || 8) > 4);
    };
    evaluate();
    media.addEventListener("change", evaluate);
    let first = 0,
      second = 0;
    first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setPainted(true));
    });
    return () => {
      media.removeEventListener("change", evaluate);
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);
  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    let visible = false;
    const sync = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.05 },
    );
    observer.observe(target);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (active && eligible && painted) setLoaded(true);
  }, [active, eligible, painted]);
  const enabled = loaded && eligible && !failed;
  async function enableGyro() {
    try {
      const ctor = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<string>;
      };
      if (
        ctor.requestPermission &&
        (await ctor.requestPermission()) !== "granted"
      ) {
        setGyroStatus(
          locale === "en"
            ? "Permission declined. Drag to rotate."
            : "अनुमति नहीं मिली। खींचकर घुमाएं।",
        );
        return;
      }
      setGyro(true);
      setGyroStatus("");
    } catch {
      setGyroStatus(
        locale === "en"
          ? "Motion unavailable. Drag to rotate."
          : "मोशन उपलब्ध नहीं। खींचकर घुमाएं।",
      );
    }
  }
  return (
    <div
      ref={ref}
      className="stage"
      aria-label={
        locale === "en" ? "Illustrative car key" : "कार की चाबी का नमूना"
      }
    >
      <Image
        className="stage-image"
        style={{ opacity: enabled && ready ? 0 : 1 }}
        src="/Bhim-Lock-And-Keys/images/key-hero.webp"
        alt={
          locale === "en"
            ? "Illustration of a dark car key fob with a brass metal rim"
            : "पीतल की किनारी वाला कार रिमोट का नमूना"
        }
        fill
        sizes="(max-width:700px) 90vw, 45vw"
        priority={!story}
      />
      {enabled && (
        <Boundary onError={handleFail}>
          <Scene
            active={active}
            story={story}
            rolling={rolling}
            gyro={gyro}
            onReady={handleReady}
            onFail={handleFail}
          />
        </Boundary>
      )}
      {enabled && ready && !rolling && (
        <>
          <span className="stage-hint">
            {gyroStatus ||
              (locale === "en" ? "Drag to explore" : "खींचकर घुमाएं")}
          </span>
          {!gyro && (
            <button type="button" className="gyro" onClick={enableGyro}>
              {locale === "en" ? "Enable motion" : "मोशन चालू करें"}
            </button>
          )}
        </>
      )}
    </div>
  );
}
