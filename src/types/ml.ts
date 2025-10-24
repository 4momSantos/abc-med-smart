import { MedicineItem } from "@/components/MedicineForm";

export interface ClusterResult {
  itemId: string;
  itemName: string;
  cluster: number;
  features: number[];
  distance: number;
}

export interface AnomalyResult {
  itemId: string;
  itemName: string;
  anomalyScore: number;
  isAnomaly: boolean;
  reasons: string[];
}

export interface ClusteringSummary {
  totalClusters: number;
  clusterSizes: number[];
  silhouetteScore: number;
}

export interface MLAnalysisResult {
  clustering?: {
    results: ClusterResult[];
    summary: ClusteringSummary;
  };
  anomalies?: AnomalyResult[];
}
