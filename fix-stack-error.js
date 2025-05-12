// Salve este arquivo como fix-stack-error.js
// Execute com: node fix-stack-error.js

// Este script aumenta o limite da pilha de recursão do Node.js e fornece diagnóstico
// para ajudar a identificar problemas de "Maximum call stack size exceeded"

// Aumente o tamanho da pilha de chamadas para o processo Node.js
process.setMaxListeners(50);
require('events').EventEmitter.defaultMaxListeners = 50;

const fs = require('fs');
const path = require('path');
const util = require('util');

console.log('\n=== DIAGNÓSTICO DE ERRO "MAXIMUM CALL STACK SIZE EXCEEDED" ===\n');

// Detalhes do sistema
console.log('Informações do sistema:');
console.log(`- Node.js: ${process.version}`);
console.log(`- Memória total: ${Math.round(require('os').totalmem() / (1024 * 1024 * 1024))} GB`);
console.log(`- Memória livre: ${Math.round(require('os').freemem() / (1024 * 1024 * 1024))} GB`);
console.log(`- CPUs: ${require('os').cpus().length}`);

// Aumentar o limite da pilha do V8
console.log('\nAumentando o limite da pilha de execução...');
try {
  // Verificar o arquivo next.config.js
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    let configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Verifica se já tem configuração de experimental.nodeOptions
    if (!configContent.includes('nodeOptions')) {
      console.log('Adicionando configuração de nodeOptions ao next.config.js...');
      
      // Adicionar nodeOptions se não existir
      const experimentalConfig = `
  // Adicione estas configurações para aumentar o limite da pilha de execução
  experimental: {
    nodeOptions: ['--stack-size=4000'],
  },`;
      
      // Encontrar o objeto nextConfig
      if (configContent.includes('const nextConfig = {')) {
        // Adicionar no final do objeto nextConfig, antes de fechá-lo
        configContent = configContent.replace(
          /const nextConfig = \{([\s\S]*?)\};/,
          `const nextConfig = {$1\n${experimentalConfig}\n};`
        );
        
        // Salvar o arquivo modificado
        fs.writeFileSync(nextConfigPath, configContent);
        console.log('✅ next.config.js atualizado com sucesso! Configuração de nodeOptions adicionada.');
      } else {
        console.log('❌ Não foi possível encontrar o objeto nextConfig. Você precisará adicionar essa configuração manualmente.');
      }
    } else {
      console.log('✅ Configuração de nodeOptions já existe no next.config.js.');
    }
  } else {
    console.log('❌ Arquivo next.config.js não encontrado.');
  }
} catch (error) {
  console.error('Erro ao atualizar next.config.js:', error);
}

// Verificar problemas comuns nos componentes de template
console.log('\nVerificando componentes de template...');

const templateFiles = [
  path.join(process.cwd(), 'src/components/templates/BirthdayTemplate.js'),
  path.join(process.cwd(), 'src/components/templates/AnniversaryTemplate.js'),
  path.join(process.cwd(), 'src/components/templates/DeclarationTemplate.js')
];

let foundProblems = false;

templateFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Verificar problemas comuns que causam stack overflow
    if (content.includes('generateStars') && fileName === 'DeclarationTemplate.js') {
      console.log(`⚠️ Identificado potencial problema no arquivo ${fileName}:`);
      console.log('   A função generateStars() pode causar estouro de pilha ao manipular strings muito grandes.');
      console.log('   Solução: Refatorar a função para usar arrays e limitar o número de estrelas geradas.');
      foundProblems = true;
    }
    
    // Verificar renderização recursiva
    if ((content.match(/<BirthdayTemplate|<AnniversaryTemplate|<DeclarationTemplate/g) || []).length > 1) {
      console.log(`⚠️ O arquivo ${fileName} parece renderizar a si mesmo recursivamente!`);
      console.log('   Isso pode causar estouro de pilha. Verifique a lógica de renderização.');
      foundProblems = true;
    }
    
    // Verificar manipulação problemática de string
    if (content.includes('replace(') && content.includes('replace(') && content.includes('recursively')) {
      console.log(`⚠️ O arquivo ${fileName} contém operações de substituição recursivas potencialmente perigosas.`);
      foundProblems = true;
    }
  }
});

if (!foundProblems) {
  console.log('✓ Nenhum problema óbvio encontrado nos arquivos de template.');
}

// Verificar a importação de componentes na página [slug]
console.log('\nVerificando importação de componentes na página [slug]...');
const slugPagePath = path.join(process.cwd(), 'src/app/[slug]/page.js');

if (fs.existsSync(slugPagePath)) {
  const content = fs.readFileSync(slugPagePath, 'utf8');
  
  // Verificar se está usando dynamic imports
  if (!content.includes('dynamic(')) {
    console.log('⚠️ A página [slug] não está usando importação dinâmica para os componentes de template.');
    console.log('   Solução: Use dynamic imports com { ssr: false } para evitar problemas de hidratação.');
    
    // Criar backup
    fs.writeFileSync(`${slugPagePath}.bak`, content);
    console.log('   Backup do arquivo original criado em src/app/[slug]/page.js.bak');
    
    // Atualizar o arquivo para usar dynamic imports
    const updatedContent = content
      .replace(
        /import BirthdayTemplate from '[@/]components\/templates\/BirthdayTemplate';/,
        "import dynamic from 'next/dynamic';\n\n// Importação dinâmica dos templates para evitar problemas de renderização\nconst BirthdayTemplate = dynamic(() => import('@/components/templates/BirthdayTemplate'), { ssr: false });"
      )
      .replace(
        /import AnniversaryTemplate from '[@/]components\/templates\/AnniversaryTemplate';/,
        "const AnniversaryTemplate = dynamic(() => import('@/components/templates/AnniversaryTemplate'), { ssr: false });"
      )
      .replace(
        /import DeclarationTemplate from '[@/]components\/templates\/DeclarationTemplate';/,
        "const DeclarationTemplate = dynamic(() => import('@/components/templates/DeclarationTemplate'), { ssr: false });"
      );
    
    fs.writeFileSync(slugPagePath, updatedContent);
    console.log('✅ Página [slug] atualizada para usar importação dinâmica de componentes!');
  } else {
    console.log('✓ A página [slug] já está usando importação dinâmica de componentes.');
  }
} else {
  console.log('❌ Arquivo src/app/[slug]/page.js não encontrado.');
}

// Verificar problemas nos dados passados para os templates
console.log('\nVerificando tratamento de dados na página [slug]...');

if (fs.existsSync(slugPagePath)) {
  const content = fs.readFileSync(slugPagePath, 'utf8');
  
  // Verificar se está sanitizando os dados
  if (!content.includes('safeProps')) {
    console.log('⚠️ A página [slug] pode não estar sanitizando adequadamente os dados passados para os templates.');
    console.log('   Solução: Crie um objeto safeProps com valores simples e sanitizados para evitar erros de serialização.');
  } else {
    console.log('✓ A página [slug] parece estar tratando os dados corretamente.');
  }
}

// Instruções finais
console.log('\n=== INSTRUÇÕES PARA RESOLVER O ERRO ===\n');
console.log('1. Execute o aplicativo com limitação de recursão aumentada:');
console.log('   NODE_OPTIONS="--stack-size=4000" npm run dev');
console.log('\n2. Se o erro persistir, verifique os logs do servidor Next.js para identificar o componente específico');
console.log('   que está causando o problema e adicione console.logs para rastrear o fluxo de renderização.');
console.log('\n3. Certifique-se de que todas as funções recursivas tenham condições de saída adequadas.');
console.log('\n4. Considere aplicar as correções sugeridas acima ou usar o código corrigido fornecido.');

console.log('\nBoa sorte! Se o problema persistir, pode ser necessário debugar mais a fundo.');