import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export const StatsCard = ({ title, value, subtitle, className }: StatsCardProps) => {
  return (
    <Card className={cn(" shadow-card border", className)}>
      <CardContent className="p-6 bg-[#1b0f29]  text-center ">
        <div className="text-3xl font-bold text-white mb-1">
          {value}
        </div>
        <div className="text-white font-large ">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-white mt-1">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
};