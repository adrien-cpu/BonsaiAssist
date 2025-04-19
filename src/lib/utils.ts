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
  weatherAdjustments: object;
  additionalCare: string;
}

export const getSpeciesData = (): SpeciesData[] => {
  return speciesData as SpeciesData[];
}
