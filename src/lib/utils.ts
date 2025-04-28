import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import speciesData from "../data/speciesWatering.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface SpeciesData {
  species: string;
  commonName: string;
  wateringFrequency: string;
  wateringAmount: string;
  weatherAdjustments: {
    rainy: string;
    hot: string;
    winter: string;
    coldThreshold: number;
    hotThreshold: number;
  };
  additionalCare: string;
}

export const getSpeciesWateringData = (): SpeciesData[] => {
  return speciesData as SpeciesData[];
}




