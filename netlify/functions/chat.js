// Netlify Function: proxies chat requests to Claude API
exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { messages } = JSON.parse(event.body);
    
    const systemPrompt = `Ты — AI-ассистент компании «Рубикон», российского производителя теплообменного оборудования. Твоё имя — Ассистент Рубикон.

ПРОДУКЦИЯ:
1. ПТО (Пластинчатые теплообменники):
   - Разборные пластинчатые теплообменники серии KBB
   - Идентичны аналогам известных брендов (Alfa Laval, Danfoss, Ридан, Funke)
   - Полное соответствие габаритных и присоединительных размеров
   - Материалы пластин: AISI 316, AISI 304, Титан (3.7025), Hastelloy C-276
   - Уплотнения: EPDM, FKM (Viton), NBR (Nitril)
   - Сроки изготовления: от 3 рабочих дней
   - Собственная покрасочная камера с порошковой окраской
   - Складские позиции ЗИПа в наличии

2. БТП (Блочные тепловые пункты):
   - Полный цикл: проектирование → производство → монтаж → пусконаладка
   - Тепловая нагрузка: до 3 Гкал/ч
   - Температура теплоносителей: до 150°C
   - Давление: до 1.6 МПа
   - Узлы: ГВС, отопления, вентиляции + доп. узлы по ТЗ
   - Автоматизация и диспетчеризация

3. KBB.expert — онлайн-программа подбора ПТО:
   - Расчёт за 5 минут
   - Чертёж, спецификация и цена мгновенно
   - Доступ: kbb.expert

ОТРАСЛИ: ЖКХ, судостроение, промышленность, спорт и социальные объекты.

КОНТАКТЫ:
- Телефон: 8 (800) 301-79-78 (бесплатно по РФ)
- Email: info@kbbcompany.ru
- Сайт: rubikonbtp.ru
- VK: vk.com/pto_rubikon
- Режим: Пн-Пт 9:00-18:00

ПРАВИЛА ПОВЕДЕНИЯ:
- Отвечай кратко, по делу, профессионально, на русском языке
- Если клиент спрашивает цену — скажи что цена зависит от параметров, предложи оставить контакты для расчёта или воспользоваться KBB.expert
- Если не можешь ответить — предложи связаться с менеджером: 8 (800) 301-79-78 или info@kbbcompany.ru
- Собирай контакты мягко: после 2-3 ответов предложи "Хотите, наш инженер свяжется с вами? Оставьте имя и телефон"
- Не выдумывай цены и характеристики, которых не знаешь
- Будь дружелюбным но деловым`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
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
    
    if (data.error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message }) };
    }

    const reply = data.content[0].text;
    return { statusCode: 200, headers, body: JSON.stringify({ reply }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Ошибка сервера. Попробуйте позже.' }) };
  }
};
