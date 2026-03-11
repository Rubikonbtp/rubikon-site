const http = require('http');

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';

async function handleChat(body) {
  const { messages } = JSON.parse(body);
  
  const systemPrompt = `Ты — AI-ассистент компании «Рубикон», российского производителя теплообменного оборудования. Твоё имя — Ассистент Рубикон.

ПРОДУКЦИЯ:
1. ПТО (Пластинчатые теплообменники) серии KBB — идентичны Alfa Laval, Danfoss, Funke. Материалы: AISI 316/304, Титан, Hastelloy. Уплотнения: EPDM, FKM, NBR. Сроки: от 3 дней.
2. БТП (Блочные тепловые пункты) — полный цикл от проекта до монтажа. До 3 Гкал/ч, 150°C, 1.6 МПа.
3. KBB.expert — онлайн-программа подбора ПТО за 5 минут.

КОНТАКТЫ: 8 (800) 301-79-78, info@kbbcompany.ru
Офис: СПб, ул. Ванеева д.10 лит Б. Производство: Ростов-на-Дону, ул. Вавилова 78Е.

ПРАВИЛА: Отвечай кратко, на русском. Не выдумывай цены. После 2-3 ответов предложи оставить контакты.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return { reply: data.content[0].text };
}

async function handleContact(body) {
  const data = JSON.parse(body);
  console.log('=== NEW LEAD ===', new Date().toISOString(), data);
  return { success: true };
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }
  
  if (req.method !== 'POST') { res.writeHead(405); res.end('{"error":"Method not allowed"}'); return; }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    try {
      let result;
      if (req.url === '/api/chat') result = await handleChat(body);
      else if (req.url === '/api/contact') result = await handleContact(body);
      else { res.writeHead(404); res.end('{"error":"Not found"}'); return; }
      res.writeHead(200);
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: err.message || 'Server error' }));
    }
  });
});

server.listen(3001, () => console.log('API running on :3001'));
