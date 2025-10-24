import { MedicineItem } from "@/components/MedicineForm";
import { ClusterResult, ClusteringSummary } from "@/types/ml";

export class KMeansClustering {
  private centroids: number[][] = [];
  
  fit(items: MedicineItem[], k: number = 3, maxIterations: number = 100): { results: ClusterResult[]; summary: ClusteringSummary } {
    if (items.length === 0) {
      return {
        results: [],
        summary: { totalClusters: 0, clusterSizes: [], silhouetteScore: 0 }
      };
    }

    // Extrair e normalizar features
    const features = this.extractFeatures(items);
    
    // Inicializar centroides usando k-means++
    this.centroids = this.initializeCentroids(features, k);
    
    let assignments: number[] = [];
    
    // Iterações do K-Means
    for (let iter = 0; iter < maxIterations; iter++) {
      // Atribuir pontos aos centroides mais próximos
      const newAssignments = features.map(feature => 
        this.findNearestCentroid(feature)
      );
      
      // Verificar convergência
      if (JSON.stringify(newAssignments) === JSON.stringify(assignments)) {
        break;
      }
      
      assignments = newAssignments;
      
      // Atualizar centroides
      this.updateCentroids(features, assignments, k);
    }
    
    // Calcular resultados
    const results: ClusterResult[] = items.map((item, idx) => {
      const distance = this.euclideanDistance(features[idx], this.centroids[assignments[idx]]);
      return {
        itemId: item.id,
        itemName: item.name,
        cluster: assignments[idx],
        features: features[idx],
        distance
      };
    });
    
    // Calcular silhouette score
    const silhouetteScore = this.calculateSilhouetteScore(features, assignments);
    
    // Calcular tamanhos dos clusters
    const clusterSizes = Array(k).fill(0);
    assignments.forEach(cluster => clusterSizes[cluster]++);
    
    return {
      results,
      summary: {
        totalClusters: k,
        clusterSizes,
        silhouetteScore
      }
    };
  }
  
  private extractFeatures(items: MedicineItem[]): number[][] {
    const maxValue = Math.max(...items.map(i => i.totalValue), 1);
    const maxQty = Math.max(...items.map(i => i.quantity), 1);
    
    return items.map(item => {
      const criticalityScore = 
        item.clinicalCriticality === 'alta' ? 1 : 
        item.clinicalCriticality === 'média' ? 0.5 : 0;
      
      return [
        item.totalValue / maxValue,
        item.quantity / maxQty,
        criticalityScore
      ];
    });
  }
  
  private initializeCentroids(features: number[][], k: number): number[][] {
    const centroids: number[][] = [];
    
    // Primeiro centroide aleatório
    const firstIdx = Math.floor(Math.random() * features.length);
    centroids.push([...features[firstIdx]]);
    
    // k-means++ para os outros
    for (let i = 1; i < k; i++) {
      const distances = features.map(feature => {
        const minDist = Math.min(...centroids.map(c => this.euclideanDistance(feature, c)));
        return minDist * minDist;
      });
      
      const totalDist = distances.reduce((a, b) => a + b, 0);
      let random = Math.random() * totalDist;
      
      for (let j = 0; j < distances.length; j++) {
        random -= distances[j];
        if (random <= 0) {
          centroids.push([...features[j]]);
          break;
        }
      }
    }
    
    return centroids;
  }
  
  private findNearestCentroid(feature: number[]): number {
    let minDist = Infinity;
    let nearest = 0;
    
    this.centroids.forEach((centroid, idx) => {
      const dist = this.euclideanDistance(feature, centroid);
      if (dist < minDist) {
        minDist = dist;
        nearest = idx;
      }
    });
    
    return nearest;
  }
  
  private updateCentroids(features: number[][], assignments: number[], k: number) {
    const newCentroids: number[][] = Array(k).fill(null).map(() => [0, 0, 0]);
    const counts = Array(k).fill(0);
    
    features.forEach((feature, idx) => {
      const cluster = assignments[idx];
      counts[cluster]++;
      feature.forEach((value, dim) => {
        newCentroids[cluster][dim] += value;
      });
    });
    
    newCentroids.forEach((centroid, idx) => {
      if (counts[idx] > 0) {
        centroid.forEach((_, dim) => {
          centroid[dim] /= counts[idx];
        });
      }
    });
    
    this.centroids = newCentroids;
  }
  
  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, idx) => sum + Math.pow(val - b[idx], 2), 0)
    );
  }
  
  private calculateSilhouetteScore(features: number[][], assignments: number[]): number {
    if (features.length === 0) return 0;
    
    const silhouettes = features.map((feature, i) => {
      const cluster = assignments[i];
      
      // Calcular a(i): distância média para pontos no mesmo cluster
      const sameCluster = features.filter((_, idx) => assignments[idx] === cluster && idx !== i);
      const a = sameCluster.length > 0
        ? sameCluster.reduce((sum, f) => sum + this.euclideanDistance(feature, f), 0) / sameCluster.length
        : 0;
      
      // Calcular b(i): menor distância média para outros clusters
      const otherClusters = [...new Set(assignments)].filter(c => c !== cluster);
      const b = Math.min(...otherClusters.map(c => {
        const clusterPoints = features.filter((_, idx) => assignments[idx] === c);
        return clusterPoints.reduce((sum, f) => sum + this.euclideanDistance(feature, f), 0) / clusterPoints.length;
      }));
      
      return (b - a) / Math.max(a, b);
    });
    
    return silhouettes.reduce((sum, s) => sum + s, 0) / silhouettes.length;
  }
}
