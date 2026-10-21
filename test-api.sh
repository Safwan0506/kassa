#!/bin/bash

# Script de test de l'API Kassa
# Usage: bash test-api.sh

API_URL="http://localhost:8080"
COOKIE_FILE="/tmp/kassa_cookies.txt"

echo "=== Test API Kassa ==="
echo

# 1. Login
echo "1. Test Login..."
RESPONSE=$(curl -c $COOKIE_FILE -s -w "\n%{http_code}" "$API_URL/api/auth/login" \
  -X POST -H "Content-Type: application/json" \
  -d '{"email":"admin@kassa.com","password":"Kassa2024!"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "200" ]; then
  echo "✓ Login OK"
  SHOP_ID=$(echo "$BODY" | grep -o '"shopId":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "  Shop ID: $SHOP_ID"
else
  echo "✗ Login FAILED (HTTP $HTTP_CODE)"
  exit 1
fi
echo

# 2. Dashboard Stats
echo "2. Test Dashboard Stats..."
RESPONSE=$(curl -b $COOKIE_FILE -s -w "\n%{http_code}" "$API_URL/api/dashboard/stats/$SHOP_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" == "200" ]; then
  echo "✓ Dashboard Stats OK"
  echo "$RESPONSE" | head -n -1 | head -3
else
  echo "✗ Dashboard Stats FAILED (HTTP $HTTP_CODE)"
fi
echo

# 3. Alerts
echo "3. Test Alerts..."
RESPONSE=$(curl -b $COOKIE_FILE -s -w "\n%{http_code}" "$API_URL/api/dashboard/alerts/$SHOP_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" == "200" ]; then
  echo "✓ Alerts OK"
else
  echo "✗ Alerts FAILED (HTTP $HTTP_CODE)"
fi
echo

# 4. Products
echo "4. Test Products List..."
RESPONSE=$(curl -b $COOKIE_FILE -s -w "\n%{http_code}" "$API_URL/api/products")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" == "200" ]; then
  echo "✓ Products OK"
else
  echo "✗ Products FAILED (HTTP $HTTP_CODE)"
fi
echo

# 5. Stock Levels
echo "5. Test Stock Levels..."
RESPONSE=$(curl -b $COOKIE_FILE -s -w "\n%{http_code}" "$API_URL/api/stock/levels/$SHOP_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" == "200" ]; then
  echo "✓ Stock Levels OK"
else
  echo "✗ Stock Levels FAILED (HTTP $HTTP_CODE)"
fi
echo

echo "=== Tests terminés ==="
