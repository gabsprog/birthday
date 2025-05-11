#!/bin/bash

# Criar estrutura de diretórios
mkdir -p src/app/api/create-site
mkdir -p src/app/api/get-site/\[slug\]
mkdir -p src/app/api/upload
mkdir -p src/app/api/webhook
mkdir -p src/app/\[slug\]
mkdir -p src/app/create
mkdir -p src/app/payment
mkdir -p src/app/success
mkdir -p src/components/templates
mkdir -p src/components/ui
mkdir -p src/lib
mkdir -p src/models
mkdir -p public/images/templates/birthday
mkdir -p public/images/templates/anniversary
mkdir -p public/images/templates/declaration

# Criar arquivo vazio para placeholder.jpg
touch public/images/templates/placeholder.jpg

echo "Estrutura de diretórios criada com sucesso!"
