#!/bin/bash
echo "Starting simple load test against sentinel-gateway..."
for i in {1..100}; do
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/actuator/health
done
echo "Load test completed."
