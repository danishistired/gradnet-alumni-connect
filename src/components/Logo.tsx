import { GraduationCap } from "lucide-react";

interface LogoProps {
  className?: string;
  animated?: boolean;
}

export const Logo = ({ className = "", animated = false }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className} ${animated ? 'animate-pulse-logo' : ''}`}>
      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
        <GraduationCap className="w-5 h-5 text-accent-foreground" />
      </div>
      <span className="text-2xl font-bold text-primary">GradNet</span>
    </div>
  );
};