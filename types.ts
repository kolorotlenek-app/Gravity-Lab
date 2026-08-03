
export interface OrientationData {
  beta: number;  // Pitch (X-axis) [-180, 180]
  gamma: number; // Roll (Y-axis) [-90, 90]
  alpha: number; // Yaw (Z-axis) [0, 360]
}

export interface CalibrationOffset {
  beta: number;
  gamma: number;
}
