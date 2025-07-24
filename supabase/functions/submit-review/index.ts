import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Gérer la requête preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Créer un client Supabase avec les droits d'administrateur
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Extraire les données de la requête
    const { productId, orderId, rating, comment, customerName } = await req.json()

    // 1. Insérer le nouvel avis
    const { error: reviewError } = await supabaseAdmin.from('reviews').insert({
      product_id: productId,
      order_id: orderId,
      rating: rating,
      comment: comment,
      customer_name: customerName,
    })

    if (reviewError) throw reviewError

    // 2. Mettre à jour la note moyenne et le nombre d'avis sur le produit
    const { data: productData, error: productError } = await supabaseAdmin
      .from('products')
      .select('rating, num_reviews')
      .eq('id', productId)
      .single()

    if (productError) throw productError

    const currentRating = productData.rating || 0
    const currentReviews = productData.num_reviews || 0
    const newNumReviews = currentReviews + 1
    const newRating = ((currentRating * currentReviews) + rating) / newNumReviews

    const { error: updateError } = await supabaseAdmin
      .from('products')
      .update({ rating: newRating.toFixed(1), num_reviews: newNumReviews })
      .eq('id', productId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ message: 'Review submitted successfully!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})