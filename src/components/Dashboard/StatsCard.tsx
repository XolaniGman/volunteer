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
      <CardContent className="p-6 bg-gradient-to-r from-cyan-200 to-blue-500 to-white  text-center ">
        <div className="text-3xl font-bold text-dark mb-1">
          {value}
        </div>
        <div className="text-dark font-large ">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-dark mt-1">
            {subtitle}
          </div>
        )}
      </CardContent>
    </Card>
  );
};