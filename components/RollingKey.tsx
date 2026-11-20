"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import KeyStage from "./KeyStage";
import type { Locale } from "@/lib/shop";
export default function RollingKey({locale}:{locale:Locale}) {
 const {scrollYProgress}=useScroll();
 const y=useTransform(scrollYProgress,[0,.25,.5,.75,1],[0,90,-35,75,0]);
 const reduce=useReducedMotion();
 if(reduce) return null;
 return <motion.div className="rolling-key" style={{y}} aria-hidden="true"><KeyStage rolling locale={locale} /></motion.div>;
}
