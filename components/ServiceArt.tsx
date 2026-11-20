import Image from "next/image";
// REPLACE: generated illustrations with owner-supplied product/equipment photos.
export default function ServiceArt({index, alt}:{index:number;alt:string}) {
 return <div className="service-art"><Image src="/images/services-sheet.png" alt={`Illustrative image: ${alt}`} width={1086} height={1448} sizes="(max-width:700px) 270vw, 100vw" style={{width:"300%",maxWidth:"none",height:"400%",left:`-${(index%3)*100}%`,top:`-${Math.floor(index/3)*100}%`}} /><span>Illustrative image</span></div>;
}
