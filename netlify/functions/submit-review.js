// Netlify Function: recebe uma avaliação pós-compra e salva.
// Usa Netlify Blobs (armazenamento chave-valor incluso no Netlify, sem
// precisar de banco de dados externo).

const { getStore } = require("@netlify/blobs");

const MAX_COMMENT_LENGTH = 400;
const MAX_NAME_LENGTH = 60;
const MAX_REVIEWS_STORED = 200;

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Método não permitido." }) };
  }

  let name, rating, comment;
  try {
    const body = JSON.parse(event.body || "{}");
    name = (body.name || "Cliente KeyVault").toString().trim().slice(0, MAX_NAME_LENGTH);
    rating = parseInt(body.rating, 10);
    comment = (body.comment || "").toString().trim().slice(0, MAX_COMMENT_LENGTH);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Corpo da requisição inválido." }) };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { statusCode: 400, body: JSON.stringify({ error: "Avaliação precisa ser de 1 a 5 estrelas." }) };
  }
  if (!name) name = "Cliente KeyVault";

  try {
    const store = getStore("reviews");
    const existingRaw = await store.get("all", { type: "json" });
    const reviews = Array.isArray(existingRaw) ? existingRaw : [];

    reviews.unshift({
      name,
      rating,
      comment,
      date: new Date().toISOString(),
    });

    // Mantém só as mais recentes, pra não crescer indefinidamente.
    const trimmed = reviews.slice(0, MAX_REVIEWS_STORED);

    await store.setJSON("all", trimmed);

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Falha ao salvar avaliação.", details: String(err) }) };
  }
};
