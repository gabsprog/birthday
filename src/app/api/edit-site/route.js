// src/app/api/edit-site/route.js
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Site from '@/models/Site';

export async function PUT(request) {
  // Marcar o início do processamento para monitorar o tempo
  const startTime = Date.now();
  console.log('Iniciando processo de edição do site:', new Date().toISOString());
  
  try {
    // Parse request body - com timeout de 5 segundos
    let data;
    try {
      const requestText = await request.text();
      data = JSON.parse(requestText);
      console.log('Request parsed, size:', requestText.length);
      console.log('Request processing time (parse):', Date.now() - startTime, 'ms');
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Formato de requisição inválido: ' + parseError.message },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!data.editHash || (!data.siteId && !data.slug)) {
      console.error('Missing required fields: editHash and (siteId or slug)');
      return NextResponse.json(
        { error: 'Dados de edição incompletos. É necessário fornecer o hash de edição e o ID ou slug do site.' },
        { status: 400 }
      );
    }
    
    // Connect to database
    console.log('Connecting to database...');
    try {
      await connectToDatabase();
      console.log('Database connection established');
      console.log('Request processing time (db-connect):', Date.now() - startTime, 'ms');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Falha na conexão com o banco de dados: ' + dbError.message },
        { status: 500 }
      );
    }
    
    // Find the site
    let site;
    try {
      if (data.siteId) {
        site = await Site.findById(data.siteId);
      } else if (data.slug) {
        site = await Site.findOne({ slug: data.slug });
      }
      
      if (!site) {
        console.error('Site not found');
        return NextResponse.json(
          { error: 'Site não encontrado' },
          { status: 404 }
        );
      }
      
      // Verify edit hash
      if (site.editHash !== data.editHash) {
        console.error('Invalid edit hash');
        return NextResponse.json(
          { error: 'Código de edição inválido' },
          { status: 403 }
        );
      }
      
      console.log(`Site found: ${site._id} (${site.slug})`);
      console.log('Request processing time (site-fetch):', Date.now() - startTime, 'ms');
    } catch (findError) {
      console.error('Error finding site:', findError);
      return NextResponse.json(
        { error: 'Erro ao buscar o site: ' + findError.message },
        { status: 500 }
      );
    }
    
    // Update allowed fields only
    const allowedFields = [
      'title',
      'message',
      'specialDate',
      'youtubeLink',
      'images'
    ];
    
    // Build update object with only allowed fields
    const updateData = {};
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });
    
    // Handle template-specific text updates
    if (site.templateType === 'birthday' && data.birthday) {
      updateData.birthdayTexts = { ...site.birthdayTexts, ...data.birthday };
    } else if (site.templateType === 'anniversary' && data.anniversary) {
      updateData.anniversaryTexts = { ...site.anniversaryTexts, ...data.anniversary };
    } else if (site.templateType === 'declaration' && data.declaration) {
      updateData.declarationTexts = { ...site.declarationTexts, ...data.declaration };
    }
    
    // Update site
    try {
      const updatedSite = await Site.findByIdAndUpdate(
        site._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      console.log(`Site updated successfully: ${updatedSite._id} (${updatedSite.slug})`);
      console.log('Request processing time (site-update):', Date.now() - startTime, 'ms');
      
      // Return success response
      return NextResponse.json({
        success: true,
        site: {
          id: updatedSite._id,
          slug: updatedSite.slug,
          title: updatedSite.title,
          templateType: updatedSite.templateType,
          message: updatedSite.message,
          specialDate: updatedSite.specialDate,
          youtubeLink: updatedSite.youtubeLink,
          images: updatedSite.images,
          paid: updatedSite.paid
        }
      });
    } catch (updateError) {
      console.error('Error updating site:', updateError);
      return NextResponse.json(
        { error: 'Erro ao atualizar o site: ' + updateError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unhandled error in edit-site route:', error);
    console.log('Request failed after:', Date.now() - startTime, 'ms');
    
    return NextResponse.json(
      { error: 'Falha ao editar o site: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    const editHash = url.searchParams.get('editHash');
    
    if (!slug || !editHash) {
      return NextResponse.json(
        { error: 'Parâmetros slug e editHash são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find the site
    const site = await Site.findOne({ slug, editHash });
    
    if (!site) {
      return NextResponse.json(
        { error: 'Site não encontrado ou código de edição inválido' },
        { status: 404 }
      );
    }
    
    // Check if site is paid
    if (!site.paid) {
      return NextResponse.json(
        { error: 'Este site ainda não foi pago e não pode ser editado' },
        { status: 403 }
      );
    }
    
    // Return site data for editing
    return NextResponse.json({
      success: true,
      site: {
        id: site._id,
        slug: site.slug,
        templateType: site.templateType,
        title: site.title,
        message: site.message,
        specialDate: site.specialDate,
        youtubeLink: site.youtubeLink,
        images: site.images,
        paid: site.paid,
        editHash: site.editHash,
        // Add template-specific data
        ...(site.templateType === 'birthday' && { birthday: site.birthdayTexts }),
        ...(site.templateType === 'anniversary' && { anniversary: site.anniversaryTexts }),
        ...(site.templateType === 'declaration' && { declaration: site.declarationTexts })
      }
    });
    
  } catch (error) {
    console.error('Error fetching site for editing:', error);
    return NextResponse.json(
      { error: 'Falha ao buscar o site para edição: ' + error.message },
      { status: 500 }
    );
  }
}