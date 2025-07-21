import { Injectable } from '@nestjs/common';
import { ActivityType } from './schemas/activity.schema';
import { SensorData } from './activity.service';

export interface ClassificationFeatures {
  avgSpeed: number;
  maxSpeed: number;
  speedVariance: number;
  accelerationVariance: number;
  altitudeChange: number;
  duration: number;
}

@Injectable()
export class ActivityClassifierService {
  /**
   * Enhanced activity classification using multiple features
   * This can be replaced with Brain.js neural network later
   */
  classifyActivity(sensorData: SensorData[]): {
    type: ActivityType;
    confidence: number;
    features: ClassificationFeatures;
  } {
    const features = this.extractFeatures(sensorData);

    // Enhanced classification logic
    let type: ActivityType;
    let confidence: number;

    // Driving detection (high speed, consistent movement)
    if (features.avgSpeed >= 40 && features.speedVariance < 10) {
      type = ActivityType.DRIVING;
      confidence = 0.95;
    }
    // Biking detection (moderate speed, some variance)
    else if (
      features.avgSpeed >= 10 &&
      features.avgSpeed <= 35 &&
      features.speedVariance < 15
    ) {
      type = ActivityType.BIKING;
      confidence = 0.85;
    }
    // Walking detection (low speed, high variance)
    else if (features.avgSpeed >= 2 && features.avgSpeed <= 8) {
      type = ActivityType.WALKING;
      confidence = 0.8;
    }
    // Public transport (variable speed, stops)
    else if (
      features.avgSpeed >= 5 &&
      features.avgSpeed <= 50 &&
      features.speedVariance > 20
    ) {
      type = ActivityType.BUS;
      confidence = 0.7;
    }
    // Default to walking
    else {
      type = ActivityType.WALKING;
      confidence = 0.6;
    }

    return {
      type,
      confidence,
      features,
    };
  }

  /**
   * Extract features from sensor data for classification
   */
  private extractFeatures(sensorData: SensorData[]): ClassificationFeatures {
    const speeds = sensorData.map((data) => data.speed);
    const accelerations = sensorData.map((data) => data.acceleration || 0);
    const altitudes = sensorData.map((data) => data.altitude || 0);

    const avgSpeed =
      speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);

    // Calculate speed variance
    const speedVariance =
      speeds.reduce((sum, speed) => {
        return sum + Math.pow(speed - avgSpeed, 2);
      }, 0) / speeds.length;

    // Calculate acceleration variance
    const avgAcceleration =
      accelerations.reduce((sum, acc) => sum + acc, 0) / accelerations.length;
    const accelerationVariance =
      accelerations.reduce((sum, acc) => {
        return sum + Math.pow(acc - avgAcceleration, 2);
      }, 0) / accelerations.length;

    // Calculate altitude change
    const altitudeChange = Math.abs(
      altitudes[altitudes.length - 1] - altitudes[0],
    );

    // Calculate duration in minutes
    const duration =
      (sensorData[sensorData.length - 1].timestamp.getTime() -
        sensorData[0].timestamp.getTime()) /
      (1000 * 60);

    return {
      avgSpeed,
      maxSpeed,
      speedVariance,
      accelerationVariance,
      altitudeChange,
      duration,
    };
  }

  /**
   * Future method for Brain.js integration
   */
  async classifyWithNeuralNetwork(features: ClassificationFeatures): Promise<{
    type: ActivityType;
    confidence: number;
  }> {
    // TODO: Implement Brain.js neural network classification
    // This will replace the rule-based classification above

    // For now, return a placeholder
    return {
      type: ActivityType.WALKING,
      confidence: 0.5,
    };
  }
}
