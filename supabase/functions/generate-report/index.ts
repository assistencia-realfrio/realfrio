// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract orderId from URL query parameters
    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId query parameter' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create a Supabase client with the service role key for backend operations
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch Service Order details
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('service_orders')
      .select(`
        *,
        clients (name, contact, email, store, locality, maps_link),
        equipments (name, brand, model, serial_number),
        profiles (first_name, last_name)
      `)
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;
    if (!orderData) {
      return new Response(JSON.stringify({ error: 'Service Order not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    // Fetch Notes for the Service Order
    const { data: notesData, error: notesError } = await supabaseAdmin
      .from('service_order_notes')
      .select(`
        content,
        created_at,
        profiles (first_name, last_name)
      `)
      .eq('service_order_id', orderId)
      .order('created_at', { ascending: true });

    if (notesError) throw notesError;

    const clientName = orderData.clients ? (Array.isArray(orderData.clients) ? orderData.clients[0]?.name : orderData.clients.name) : 'N/A';
    const clientContact = orderData.clients ? (Array.isArray(orderData.clients) ? orderData.clients[0]?.contact : orderData.clients.contact) : 'N/A';
    const clientEmail = orderData.clients ? (Array.isArray(orderData.clients) ? orderData.clients[0]?.email : orderData.clients.email) : 'N/A';
    const clientLocality = orderData.clients ? (Array.isArray(orderData.clients) ? orderData.clients[0]?.locality : orderData.clients.locality) : 'N/A';
    const clientMapsLink = orderData.clients ? (Array.isArray(orderData.clients) ? orderData.clients[0]?.maps_link : orderData.clients.maps_link) : 'N/A';

    const equipmentName = orderData.equipments ? (Array.isArray(orderData.equipments) ? orderData.equipments[0]?.name : orderData.equipments.name) : 'N/A';
    const equipmentBrand = orderData.equipments ? (Array.isArray(orderData.equipments) ? orderData.equipments[0]?.brand : orderData.equipments.brand) : 'N/A';
    const equipmentModel = orderData.equipments ? (Array.isArray(orderData.equipments) ? orderData.equipments[0]?.model : orderData.equipments.model) : 'N/A';
    const equipmentSerialNumber = orderData.equipments ? (Array.isArray(orderData.equipments) ? orderData.equipments[0]?.serial_number : orderData.equipments.serial_number) : 'N/A';

    const createdByFirstName = orderData.profiles ? (Array.isArray(orderData.profiles) ? orderData.profiles[0]?.first_name : orderData.profiles.first_name) : '';
    const createdByLastName = orderData.profiles ? (Array.isArray(orderData.profiles) ? orderData.profiles[0]?.last_name : orderData.profiles.last_name) : '';
    const createdByFullName = `${createdByFirstName} ${createdByLastName}`.trim() || 'Desconhecido';

    // Construct HTML for the report
    let reportHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Relatório de Ordem de Serviço - ${orderData.display_id}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              h1, h2, h3 { color: #333; }
              h1 { text-align: center; margin-bottom: 20px; }
              .section { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
              .section:last-child { border-bottom: none; }
              .detail-row { display: flex; margin-bottom: 5px; }
              .detail-label { font-weight: bold; width: 150px; flex-shrink: 0; }
              .detail-value { flex-grow: 1; }
              .notes-list { list-style: none; padding: 0; }
              .note-item { background: #f9f9f9; border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 5px; }
              .note-author { font-weight: bold; margin-bottom: 5px; }
              .note-date { font-size: 0.8em; color: #666; }
              .header-logo { text-align: center; margin-bottom: 20px; }
              .header-logo img { max-height: 80px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header-logo">
                  <img src="https://idjzzxirjcqkhmodweiu.supabase.co/storage/v1/object/public/reports/logo-REAL-FRIO.png" alt="Real Frio Logo">
              </div>
              <h1>Relatório de Ordem de Serviço</h1>
              <div class="section">
                  <h2>Detalhes da Ordem de Serviço</h2>
                  <div class="detail-row"><span class="detail-label">ID da OS:</span><span class="detail-value">${orderData.display_id}</span></div>
                  <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-value">${orderData.status}</span></div>
                  <div class="detail-row"><span class="detail-label">Loja:</span><span class="detail-value">${orderData.store}</span></div>
                  <div class="detail-row"><span class="detail-label">Criado em:</span><span class="detail-value">${new Date(orderData.created_at).toLocaleString('pt-BR')}</span></div>
                  <div class="detail-row"><span class="detail-label">Última Atualização:</span><span class="detail-value">${orderData.updated_at ? new Date(orderData.updated_at).toLocaleString('pt-BR') : 'N/A'}</span></div>
                  <div class="detail-row"><span class="detail-label">Criado por:</span><span class="detail-value">${createdByFullName}</span></div>
                  <div class="detail-row"><span class="detail-label">Descrição:</span><span class="detail-value">${orderData.description}</span></div>
              </div>

              <div class="section">
                  <h2>Detalhes do Cliente</h2>
                  <div class="detail-row"><span class="detail-label">Nome:</span><span class="detail-value">${clientName}</span></div>
                  <div class="detail-row"><span class="detail-label">Contato:</span><span class="detail-value">${clientContact}</span></div>
                  <div class="detail-row"><span class="detail-label">Email:</span><span class="detail-value">${clientEmail}</span></div>
                  <div class="detail-row"><span class="detail-label">Localidade:</span><span class="detail-value">${clientLocality}</span></div>
                  <div class="detail-row"><span class="detail-label">Maps Link:</span><span class="detail-value">${clientMapsLink}</span></div>
              </div>

              <div class="section">
                  <h2>Detalhes do Equipamento</h2>
                  <div class="detail-row"><span class="detail-label">Nome:</span><span class="detail-value">${equipmentName}</span></div>
                  <div class="detail-row"><span class="detail-label">Marca:</span><span class="detail-value">${equipmentBrand}</span></div>
                  <div class="detail-row"><span class="detail-label">Modelo:</span><span class="detail-value">${equipmentModel}</span></div>
                  <div class="detail-row"><span class="detail-label">Nº Série:</span><span class="detail-value">${equipmentSerialNumber}</span></div>
              </div>

              <div class="section">
                  <h2>Notas</h2>
                  ${notesData && notesData.length > 0 ? `
                      <ul class="notes-list">
                          ${notesData.map(note => {
                              const noteAuthorFirstName = note.profiles ? (Array.isArray(note.profiles) ? note.profiles[0]?.first_name : note.profiles.first_name) : '';
                              const noteAuthorLastName = note.profiles ? (Array.isArray(note.profiles) ? note.profiles[0]?.last_name : note.profiles.last_name) : '';
                              const noteAuthorFullName = `${noteAuthorFirstName} ${noteAuthorLastName}`.trim() || 'Desconhecido';
                              return `
                                  <li class="note-item">
                                      <div class="note-author">${noteAuthorFullName}</div>
                                      <div class="note-date">${new Date(note.created_at).toLocaleString('pt-BR')}</div>
                                      <p>${note.content}</p>
                                  </li>
                              `;
                          }).join('')}
                      </ul>
                  ` : '<p>Nenhuma nota adicionada.</p>'}
              </div>
          </div>
      </body>
      </html>
    `;

    // Instead of uploading to storage, return the HTML directly
    return new Response(reportHtml, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }, // Explicitly set charset
      status: 200,
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});