// Salve como fix-expired-site.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const SITE_SLUG = 'f8cbe86b'; // Substitua pelo slug real da URL

if (!MONGODB_URI) {
  console.error('MONGODB_URI não está definido nas variáveis de ambiente');
  process.exit(1);
}

// Modelo simplificado do site
const SiteSchema = new mongoose.Schema({
  slug: String,
  paid: Boolean,
  expiresAt: Date
});

async function fixExpiredSite() {
  try {
    console.log('Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado ao MongoDB!');

    // Obter a coleção de sites
    const Site = mongoose.model('Site', SiteSchema);
    
    // Encontrar o site pelo slug
    const site = await Site.findOne({ slug: SITE_SLUG });
    
    if (!site) {
      console.error(`Site com slug ${SITE_SLUG} não encontrado`);
      process.exit(1);
    }
    
    console.log('Site encontrado:');
    console.log(`- Slug: ${site.slug}`);
    console.log(`- Pago: ${site.paid}`);
    console.log(`- Expira em: ${site.expiresAt}`);
    
    // Atualizar o site para marcá-lo como pago e remover a data de expiração
    const result = await Site.updateOne(
      { slug: SITE_SLUG },
      { $set: { paid: true, expiresAt: null } }
    );
    
    console.log('Site atualizado com sucesso!');
    console.log(`Documentos modificados: ${result.modifiedCount}`);
    
  } catch (error) {
    console.error('Erro ao corrigir o site:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
    process.exit(0);
  }
}

fixExpiredSite();