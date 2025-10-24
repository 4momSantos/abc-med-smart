import { 
  mean, 
  median, 
  mode, 
  standardDeviation, 
  variance,
  quantile,
  sampleSkewness,
  sampleKurtosis
} from "simple-statistics";
import { MedicineItem } from "@/components/MedicineForm";

export interface DescriptiveStats {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number | null;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
    iqr: number;
  };
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
  };
  skewness: number;
  kurtosis: number;
  coefficientOfVariation: number;
  outliers: {
    lower: number[];
    upper: number[];
    count: number;
  };
}

export const calculateDescriptiveStats = (items: MedicineItem[]): DescriptiveStats => {
  if (items.length === 0) {
    return {
      count: 0,
      sum: 0,
      mean: 0,
      median: 0,
      mode: null,
      stdDev: 0,
      variance: 0,
      min: 0,
      max: 0,
      range: 0,
      quartiles: { q1: 0, q2: 0, q3: 0, iqr: 0 },
      percentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
      skewness: 0,
      kurtosis: 0,
      coefficientOfVariation: 0,
      outliers: { lower: [], upper: [], count: 0 }
    };
  }

  const values = items.map(i => i.totalValue);
  
  const meanValue = mean(values);
  const medianValue = median(values);
  const modeValue = values.length > 1 ? mode(values) : values[0];
  const stdDev = values.length > 1 ? standardDeviation(values) : 0;
  const varianceValue = values.length > 1 ? variance(values) : 0;
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  
  const q1 = quantile(values, 0.25);
  const q2 = quantile(values, 0.5);
  const q3 = quantile(values, 0.75);
  const iqr = q3 - q1;
  
  const skewnessValue = values.length > 2 ? sampleSkewness(values) : 0;
  const kurtosisValue = values.length > 3 ? sampleKurtosis(values) : 0;
  
  const { lower, upper } = detectOutliers(values, q1, q3, iqr);
  
  return {
    count: items.length,
    sum: values.reduce((a, b) => a + b, 0),
    mean: meanValue,
    median: medianValue,
    mode: modeValue,
    stdDev,
    variance: varianceValue,
    min: minValue,
    max: maxValue,
    range: maxValue - minValue,
    quartiles: {
      q1,
      q2,
      q3,
      iqr
    },
    percentiles: {
      p10: quantile(values, 0.1),
      p25: q1,
      p50: q2,
      p75: q3,
      p90: quantile(values, 0.9)
    },
    skewness: skewnessValue,
    kurtosis: kurtosisValue,
    coefficientOfVariation: meanValue !== 0 ? (stdDev / meanValue) * 100 : 0,
    outliers: {
      lower,
      upper,
      count: lower.length + upper.length
    }
  };
};

const detectOutliers = (
  values: number[], 
  q1: number, 
  q3: number, 
  iqr: number
): { lower: number[]; upper: number[] } => {
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  const lower = values.filter(v => v < lowerBound);
  const upper = values.filter(v => v > upperBound);
  
  return { lower, upper };
};
