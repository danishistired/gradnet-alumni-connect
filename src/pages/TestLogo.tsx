import MetallicPaint, { parseLogoImage } from "../components/MetallicPaint";
import { useState, useEffect } from 'react';

// Using the existing logo from assets
import logo from '../assets/new logo.svg';

const TestLogo = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);

  useEffect(() => {
    async function loadDefaultImage() {
      try {
        const response = await fetch(logo);
        const blob = await response.blob();
        const file = new File([blob], "logo.svg", { type: blob.type });

        const parsedData = await parseLogoImage(file);
        setImageData(parsedData?.imageData ?? null);

      } catch (err) {
        console.error("Error loading default image:", err);
      }
    }

    loadDefaultImage();
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: '#000' }}>
      <MetallicPaint 
        imageData={imageData ?? new ImageData(1, 1)} 
        params={{ edge: 2, patternBlur: 0.005, patternScale: 2, refraction: 0.015, speed: 0.3, liquid: 0.07 }} 
      />
    </div>
  );
};

export default TestLogo;