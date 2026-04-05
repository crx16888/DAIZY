// import Image from "next/image";
// import centerImage from "@/PG-2.png";
import { WaveBackground } from "@/components/wave-background";

export default function HomePage() {
  return (
    <>
      <WaveBackground />
      <main className="page-shell">
        <div className="topbar">
          <div className="brand-chip">DAIZY</div>
        </div>
        {/* <div className="center-stage">
          <Image
            alt="Project DAIZY centerpiece"
            className="center-image"
            priority
            src={centerImage}
          />
        </div> */}
      </main>
    </>
  );
}
