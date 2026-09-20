// Netlify Function: retorna as avaliações salvas (mais recentes primeiro).
// Não filtra por nota — mostrar só avaliações boas e esconder as ruins
// seria enganoso, então tudo que os clientes mandarem aparece.

exports.handler = async function () {
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore("reviews");
    const reviews = (await store.get("all", { type: "json" })) || [];
    return {
      statusCode: 200,
      headers: { "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({ reviews }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Falha ao carregar avaliações.", details: String(err) }) };
  }
};
