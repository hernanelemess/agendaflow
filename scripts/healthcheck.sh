#!/bin/sh
# =============================================================================
# healthcheck.sh — Script de verificação de saúde dos serviços
# Uso: ./scripts/healthcheck.sh [api|front|db|all]
# ⚠️ ADAPTE: ajuste as portas se forem diferentes no seu ambiente
# =============================================================================

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="${API_URL:-http://localhost:3000}"
FRONT_URL="${FRONT_URL:-http://localhost:80}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"

# -----------------------------------------------------------------------------
# Função: checa a API Express
# -----------------------------------------------------------------------------
check_api() {
  echo "${YELLOW}Verificando API...${NC}"
  
  RESPONSE=$(curl -sf --max-time 5 "${API_URL}/health" 2>/dev/null)
  STATUS=$?
  
  if [ $STATUS -eq 0 ]; then
    echo "${GREEN}✓ API está saudável${NC}"
    echo "  Resposta: $RESPONSE"
    return 0
  else
    echo "${RED}✗ API não está respondendo em ${API_URL}/health${NC}"
    return 1
  fi
}

# -----------------------------------------------------------------------------
# Função: checa o front-end (Nginx)
# -----------------------------------------------------------------------------
check_front() {
  echo "${YELLOW}Verificando Front-end...${NC}"
  
  STATUS_CODE=$(curl -sf --max-time 5 -o /dev/null -w "%{http_code}" "${FRONT_URL}" 2>/dev/null)
  
  if [ "$STATUS_CODE" = "200" ]; then
    echo "${GREEN}✓ Front-end está saudável (HTTP $STATUS_CODE)${NC}"
    return 0
  else
    echo "${RED}✗ Front-end retornou HTTP $STATUS_CODE em ${FRONT_URL}${NC}"
    return 1
  fi
}

# -----------------------------------------------------------------------------
# Função: checa o MySQL
# -----------------------------------------------------------------------------
check_db() {
  echo "${YELLOW}Verificando Banco de dados...${NC}"
  
  # nc (netcat) verifica se a porta TCP está aberta
  if nc -z -w 3 "$DB_HOST" "$DB_PORT" 2>/dev/null; then
    echo "${GREEN}✓ MySQL está respondendo em ${DB_HOST}:${DB_PORT}${NC}"
    return 0
  else
    echo "${RED}✗ MySQL não está acessível em ${DB_HOST}:${DB_PORT}${NC}"
    return 1
  fi
}

# -----------------------------------------------------------------------------
# Função: checa todos os serviços via Docker
# -----------------------------------------------------------------------------
check_all_containers() {
  echo "${YELLOW}Status dos containers Docker:${NC}"
  echo ""
  
  # Lista containers do projeto com status de health
  docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Health}}"
  echo ""
  
  # Checa cada serviço
  FAILURES=0
  
  check_api   || FAILURES=$((FAILURES + 1))
  check_front || FAILURES=$((FAILURES + 1))
  check_db    || FAILURES=$((FAILURES + 1))
  
  echo ""
  if [ $FAILURES -eq 0 ]; then
    echo "${GREEN}✓ Todos os serviços estão saudáveis${NC}"
    return 0
  else
    echo "${RED}✗ $FAILURES serviço(s) com problema${NC}"
    return 1
  fi
}

# -----------------------------------------------------------------------------
# Main — processa o argumento passado
# -----------------------------------------------------------------------------
case "${1:-all}" in
  api)   check_api   ;;
  front) check_front ;;
  db)    check_db    ;;
  all)   check_all_containers ;;
  *)
    echo "Uso: $0 [api|front|db|all]"
    exit 1
    ;;
esac
