CREATE TABLE IF NOT EXISTS websites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  urls JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS performance_metrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  url_id INT NOT NULL,
  performance_score FLOAT NOT NULL,
  fcp VARCHAR(50),
  lcp VARCHAR(50),
  tbt VARCHAR(50),
  cls VARCHAR(50),
  interactive VARCHAR(50),
  speed_index VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;