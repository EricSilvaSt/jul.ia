import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  bgColor: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  bgColor,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {change && (
            <p
              className={`text-sm mt-2 ${
                change.type === 'increase'
                  ? 'text-green-600'
                  : change.type === 'decrease'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
              {change.value}%{' '}
              <span className="text-gray-500">from last month</span>
            </p>
          )}
        </div>
        <div className={`${bgColor} ${iconColor} p-3 rounded-full`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;