// src/lib/mongodb.js - Solução completa e robusta
import mongoose from 'mongoose';

// Informações de estado para gerenciar conexão global 
let globalMongoConnection = {
  conn: null,
  promise: null,
  isConnecting: false,
  connectionAttempts: 0,
  lastConnectionTime: null
};

/**
 * Função avançada para conectar ao MongoDB com alta confiabilidade
 * Inclui gerenciamento completo de conexão, tentativas e manipulação de erros
 */
async function connectToDatabase(options = {}) {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI não está definido nas variáveis de ambiente');
  }
  
  const {
    maxRetries = 3,
    retryDelayMs = 1000,
    forceNewConnection = false,
    maxConnectionAge = 60000 // 1 minuto
  } = options;
  
  // Se já temos uma conexão ativa e não está sendo forçada uma nova conexão
  if (!forceNewConnection && 
      globalMongoConnection.conn && 
      mongoose.connection.readyState === 1 &&
      globalMongoConnection.lastConnectionTime && 
      (Date.now() - globalMongoConnection.lastConnectionTime < maxConnectionAge)) {
    
    console.log('Usando conexão MongoDB existente e válida');
    return globalMongoConnection.conn;
  }
  
  // Se uma conexão já está em andamento, aguarde-a
  if (globalMongoConnection.promise && globalMongoConnection.isConnecting) {
    console.log('Aguardando conexão MongoDB em andamento...');
    try {
      await globalMongoConnection.promise;
      console.log('Conexão pendente concluída com sucesso');
      return globalMongoConnection.conn;
    } catch (error) {
      console.error('Conexão pendente falhou, tentando nova conexão:', error.message);
      // Continua para criar uma nova conexão
    }
  }
  
  // Limpar conexão existente se necessário
  if (mongoose.connection.readyState !== 0) {
    try {
      console.log(`Fechando conexão MongoDB anterior (estado: ${mongoose.connection.readyState})`);
      await mongoose.disconnect();
      console.log('Conexão anterior fechada com sucesso');
    } catch (disconnectError) {
      console.error('Erro ao fechar conexão anterior:', disconnectError.message);
      // Continua mesmo que a desconexão falhe
    }
  }
  
  // Configurar nova tentativa de conexão
  globalMongoConnection.isConnecting = true;
  globalMongoConnection.connectionAttempts += 1;
  
  const mongooseOptions = {
    bufferCommands: true, // CRÍTICO: permite comandos antes da conexão estar pronta
    serverSelectionTimeoutMS: 30000, // 30 segundos para selecionar servidor
    socketTimeoutMS: 45000, // 45 segundos para timeout de socket
    connectTimeoutMS: 30000, // 30 segundos para timeout de conexão
    heartbeatFrequencyMS: 30000, // Verificação de heartbeat a cada 30 segundos
    family: 4, // Forçar IPv4
    maxPoolSize: 10, // Limitar número de conexões
    minPoolSize: 1, // Manter ao menos uma conexão
    autoIndex: false, // Desativar criação automática de índices em produção
    autoCreate: false, // Desativar criação automática de coleções
    maxIdleTimeMS: 45000, // Tempo máximo de inatividade
    retryWrites: true, // Tentar novamente escritas que falham
    w: 'majority' // Esperar confirmação da maioria dos servidores
  };
  
  console.log(`Iniciando nova conexão MongoDB (tentativa ${globalMongoConnection.connectionAttempts})...`);
  
  async function attemptConnection(retriesLeft) {
    try {
      console.log(`Tentativa de conexão ${maxRetries - retriesLeft + 1}/${maxRetries}`);
      const connection = await mongoose.connect(MONGODB_URI, mongooseOptions);
      
      // Verificar se a conexão está realmente pronta
      if (mongoose.connection.readyState !== 1) {
        throw new Error(`Conexão não está no estado pronto. Estado atual: ${mongoose.connection.readyState}`);
      }
      
      // Testar a conexão com uma consulta simples
      await mongoose.connection.db.admin().ping();
      
      console.log('Conexão MongoDB estabelecida e verificada com sucesso!');
      globalMongoConnection.conn = connection;
      globalMongoConnection.lastConnectionTime = Date.now();
      
      // Configurar listeners de eventos para reconexão automática
      setupConnectionMonitoring();
      
      return connection;
    } catch (error) {
      if (retriesLeft > 0) {
        console.log(`Tentativa de conexão falhou: ${error.message}. Tentando novamente em ${retryDelayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        return attemptConnection(retriesLeft - 1);
      } else {
        throw new Error(`Falha ao conectar ao MongoDB após ${maxRetries} tentativas: ${error.message}`);
      }
    }
  }
  
  try {
    globalMongoConnection.promise = attemptConnection(maxRetries);
    const connection = await globalMongoConnection.promise;
    return connection;
  } catch (error) {
    console.error('Todas as tentativas de conexão falharam:', error.message);
    globalMongoConnection.isConnecting = false;
    globalMongoConnection.promise = null;
    throw error;
  } finally {
    globalMongoConnection.isConnecting = false;
  }
}

/**
 * Configura monitoramento de conexão com eventos para controle de estado
 */
function setupConnectionMonitoring() {
  // Remover listeners existentes para evitar duplicação
  mongoose.connection.removeAllListeners('disconnected');
  mongoose.connection.removeAllListeners('error');
  mongoose.connection.removeAllListeners('connected');
  
  // Quando desconectado
  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB desconectado. Reconexão será necessária na próxima operação.');
    globalMongoConnection.conn = null;
    globalMongoConnection.promise = null;
  });
  
  // Quando ocorre erro de conexão
  mongoose.connection.on('error', (err) => {
    console.error('Erro na conexão MongoDB:', err.message);
    // Apenas reseta se for um erro grave de conexão
    if (err.name === 'MongoNetworkError' || err.name === 'MongoServerSelectionError') {
      globalMongoConnection.conn = null;
      globalMongoConnection.promise = null;
    }
  });
  
  // Quando reconectado após falha
  mongoose.connection.on('connected', () => {
    console.log('MongoDB reconectado após falha prévia');
    globalMongoConnection.lastConnectionTime = Date.now();
  });
}

export default connectToDatabase;