import { Button } from "../../ui/button";
import { Play } from "lucide-react";

interface CoursePreviewProps {
  imageUrl?: string;
  title: string;
}

export const CoursePreview = ({ imageUrl, title }: CoursePreviewProps) => {
  if (!imageUrl) return null;

  return (
    <div className="animate-slide-in-right">
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-900 relative group">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            className="rounded-full w-16 h-16 group-hover:scale-110 transition-transform"
          >
            <Play className="h-6 w-6 ml-1" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-sm opacity-80">Preview do curso</p>
          <p className="font-medium">Veja uma prévia gratuita</p>
        </div>
      </div>
    </div>
  );
};
