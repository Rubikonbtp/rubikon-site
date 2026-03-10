export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

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

3. KBB.expert — онлайн-программа подбора ПТО

КОНТАКТЫ:
- Телефон: 8 (800) 301-79-78 (бесплатно по РФ)
- Email: info@kbbcompany.ru
- Главный офис: г. Санкт-Петербург, ул. Ванеева д.10 лит Б
- Производство: г. Ростов-на-Дону, ул. Вавилова 78Е

ПРАВИЛА:
- Отвечай кратко, профессионально, на русском
- Если спрашивают цену — предложи оставить контакты или KBB.expert
- Если не можешь ответить — направь на 8 (800) 301-79-78
- После 2-3 ответов предложи оставить контакты
- Не выдумывай цены`;

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
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({ reply: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}
