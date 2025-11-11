import React from 'react';
import type { Detection } from '../../../models/interfaces/Camera';
import '../ARCamera.css';

const DetectionOverlay: React.FC<{ detections: Detection[] }> = ({ detections }) => (
  <div className="detection-overlay">
    {detections.map((det, index) => {
      const [x1, y1, x2, y2] = det.bbox;
      return (
        <div
          key={index}
          className="bounding-box"
          style={{ left: x1, top: y1, width: x2 - x1, height: y2 - y1 }}
        >
          <div className="label">
            {det.class} ({Math.round(det.confidence * 100)}%)
          </div>
        </div>
      );
    })}
  </div>
);

export default DetectionOverlay;
