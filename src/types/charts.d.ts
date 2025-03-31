declare module '@ant-design/charts' {
  export interface ChartConfig {
    data: any[];
    xField: string;
    yField: string;
    smooth?: boolean;
    animation?: {
      appear?: {
        animation?: string;
        duration?: number;
      };
    };
    label?: {
      position?: string;
      style?: {
        fill?: string;
      };
    };
  }

  export const Line: React.FC<ChartConfig>;
  export const Bar: React.FC<ChartConfig>;
} 