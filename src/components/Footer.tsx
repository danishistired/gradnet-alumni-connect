import { Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="text-center text-gray-600">
          Made with <Heart className="inline h-4 w-4 text-red-500 fill-current" /> by Danish
        </div>
      </div>
    </footer>
  );
};
