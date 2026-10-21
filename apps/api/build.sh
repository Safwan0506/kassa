#!/bin/bash
set -e

echo "🔨 Building Kassa API..."
mvn clean package -DskipTests -q

echo "✓ Build completed!"
