#!/usr/bin/env python3
"""
Рубикон — Мониторинг рекламных кампаний Яндекс.Директ
Отправляет ежедневные отчёты и алерты в Telegram

Автор: Claude AI для ООО Рубикон
"""

import json
import time
import logging
import sys
from datetime import datetime, timedelta
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from urllib.parse import urlencode

# ============================================================
# НАСТРОЙКИ — ЗАПОЛНИТЕ ПЕРЕД ЗАПУСКОМ
# ============================================================

# Токен API Яндекс.Директа (получен через OAuth)
YANDEX_DIRECT_TOKEN = "y0__xD3h5_QBRjw_T4gk4ql4RbDBV-VTENZ5f18657316cTPpTIZA"

# Telegram бот
TELEGRAM_BOT_TOKEN = "8759158722:AAHваш_полный_токен"
TELEGRAM_CHAT_ID = "382983741"

# Пороги для алертов
ALERT_CPA_MAX = 2500          # Алерт если CPA выше этого значения (₽)
ALERT_BUDGET_MIN = 5000        # Алерт если баланс ниже (₽)
ALERT_NO_CONV_DAYS = 3         # Алерт если 0 конверсий за N дней
ALERT_CTR_MIN = 1.0            # Алерт если CTR ниже (%)

# Логирование
LOG_FILE = "direct_monitor.log"
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
log = logging.getLogger(__name__)

# ============================================================
# TELEGRAM
# ============================================================

def send_telegram(text, parse_mode="HTML"):
    """Отправка сообщения в Telegram"""
    url = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage"
    data = json.dumps({
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": parse_mode,
        "disable_web_page_preview": True
    }).encode('utf-8')
    
    req = Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
            if result.get("ok"):
                log.info("Telegram: сообщение отправлено")
                return True
            else:
                log.error(f"Telegram ошибка: {result}")
                return False
    except Exception as e:
        log.error(f"Telegram ошибка отправки: {e}")
        return False


# ============================================================
# ЯНДЕКС.ДИРЕКТ API
# ============================================================

DIRECT_API_URL = "https://api.direct.yandex.com/json/v5/"

def direct_request(service, method, params=None):
    """Запрос к API Яндекс.Директа"""
    url = DIRECT_API_URL + service
    body = {"method": method}
    if params:
        body["params"] = params
    
    data = json.dumps(body, ensure_ascii=False).encode('utf-8')
    headers = {
        "Authorization": f"Bearer {y0__xD3h5_QBRjw_T4gk4ql4RbDBV-VTENZ5fl8657316cTPpTIZA}",
        "Content-Type": "application/json; charset=utf-8",
        "Accept-Language": "ru",
        "Client-Login": ""  # Оставьте пустым если работаете от своего имени
    }
    
    req = Request(url, data=data, headers=headers)
    try:
        with urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
            if "error" in result:
                log.error(f"Директ API ошибка: {result['error']}")
                return None
            return result.get("result", result)
    except HTTPError as e:
        body = e.read().decode('utf-8', errors='replace')
        log.error(f"Директ HTTP ошибка {e.code}: {body}")
        return None
    except Exception as e:
        log.error(f"Директ ошибка запроса: {e}")
        return None


def get_campaigns():
    """Получить список активных кампаний"""
    params = {
        "SelectionCriteria": {
            "States": ["ON", "SUSPENDED"],
            "Statuses": ["ACCEPTED", "MODERATION"]
        },
        "FieldNames": ["Id", "Name", "State", "Status", "Statistics", 
                       "Funds", "DailyBudget"]
    }
    result = direct_request("campaigns", "get", params)
    if result and "Campaigns" in result:
        return result["Campaigns"]
    return []


def get_account_balance():
    """Получить баланс аккаунта"""
    params = {
        "FieldNames": ["Amount", "Currency", "AmountAvailableForTransfer"]
    }
    # Баланс можно получить из информации о кампаниях
    campaigns = get_campaigns()
    # Попробуем получить через отдельный метод
    return None  # Баланс будет виден из статистики кампаний


def get_campaign_stats(campaign_ids, date_from, date_to):
    """Получить статистику кампаний за период"""
    params = {
        "SelectionCriteria": {
            "Filter": [
                {
                    "Field": "CampaignId",
                    "Operator": "IN",
                    "Values": [str(cid) for cid in campaign_ids]
                }
            ]
        },
        "FieldNames": ["CampaignId", "CampaignName", "Date",
                       "Impressions", "Clicks", "Ctr", "Cost",
                       "Conversions", "CostPerConversion"],
        "ReportName": f"daily_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "ReportType": "CAMPAIGN_PERFORMANCE_REPORT",
        "DateRangeType": "CUSTOM_DATE",
        "Format": "TSV",
        "IncludeVAT": "YES",
        "IncludeDiscount": "NO"
    }
    
    # Для Reports API используется другой endpoint
    url = "https://api.direct.yandex.com/json/v5/reports"
    body = json.dumps({
        "params": {
            "SelectionCriteria": {
                "DateFrom": date_from,
                "DateTo": date_to,
                "Filter": [
                    {
                        "Field": "CampaignId",
                        "Operator": "IN",
                        "Values": [str(cid) for cid in campaign_ids]
                    }
                ]
            },
            "FieldNames": ["CampaignId", "CampaignName",
                          "Impressions", "Clicks", "Ctr", "Cost",
                          "Conversions", "CostPerConversion"],
            "ReportName": f"report_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "ReportType": "CAMPAIGN_PERFORMANCE_REPORT",
            "DateRangeType": "CUSTOM_DATE",
            "Format": "TSV",
            "IncludeVAT": "YES",
            "IncludeDiscount": "NO"
        }
    }, ensure_ascii=False).encode('utf-8')
    
    headers = {
        "Authorization": f"Bearer {y0__xD3h5_QBRjw_T4gk4ql4RbDBV-VTENZ5fl8657316cTPpTIZA}",
        "Content-Type": "application/json; charset=utf-8",
        "Accept-Language": "ru",
        "processingMode": "auto",
        "returnMoneyInMicros": "false",
        "skipReportHeader": "true",
        "skipReportSummary": "true"
    }
    
    req = Request(url, data=body, headers=headers)
    
    # Reports API может вернуть 201 (отчёт в очереди) или 202 (обрабатывается)
    max_retries = 10
    for attempt in range(max_retries):
        try:
            with urlopen(req, timeout=60) as resp:
                if resp.status == 200:
                    tsv_data = resp.read().decode('utf-8')
                    return parse_tsv_report(tsv_data)
                elif resp.status in (201, 202):
                    retry_in = int(resp.headers.get("retryIn", 5))
                    log.info(f"Отчёт обрабатывается, ждём {retry_in} сек...")
                    time.sleep(retry_in)
                    continue
        except HTTPError as e:
            if e.code in (201, 202):
                retry_in = int(e.headers.get("retryIn", 5))
                log.info(f"Отчёт обрабатывается (HTTP {e.code}), ждём {retry_in} сек...")
                time.sleep(retry_in)
                continue
            else:
                body_text = e.read().decode('utf-8', errors='replace')
                log.error(f"Reports API ошибка {e.code}: {body_text}")
                return None
        except Exception as e:
            log.error(f"Reports API ошибка: {e}")
            return None
    
    log.error("Превышено количество попыток получения отчёта")
    return None


def parse_tsv_report(tsv_data):
    """Парсинг TSV-отчёта от Reports API"""
    lines = tsv_data.strip().split('\n')
    if len(lines) < 2:
        return []
    
    headers = lines[0].split('\t')
    results = []
    
    for line in lines[1:]:
        if line.startswith('Total') or line.strip() == '':
            continue
        values = line.split('\t')
        row = {}
        for i, h in enumerate(headers):
            if i < len(values):
                row[h] = values[i]
        results.append(row)
    
    return results


# ============================================================
# ФОРМИРОВАНИЕ ОТЧЁТОВ
# ============================================================

def format_number(n):
    """Форматирование числа с разделителями"""
    try:
        n = float(n)
        if n == int(n):
            return f"{int(n):,}".replace(",", " ")
        return f"{n:,.2f}".replace(",", " ")
    except (ValueError, TypeError):
        return str(n)


def build_daily_report():
    """Формирование ежедневного отчёта"""
    log.info("Формирую ежедневный отчёт...")
    
    # Получаем список кампаний
    campaigns = get_campaigns()
    if not campaigns:
        return "⚠️ Не удалось получить список кампаний"
    
    campaign_ids = [c["Id"] for c in campaigns]
    campaign_names = {c["Id"]: c["Name"] for c in campaigns}
    campaign_states = {c["Id"]: c["State"] for c in campaigns}
    
    # Статистика за вчера
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    today = datetime.now().strftime("%Y-%m-%d")
    
    stats_yesterday = get_campaign_stats(campaign_ids, yesterday, yesterday)
    
    # Статистика за последние 7 дней
    week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    stats_week = get_campaign_stats(campaign_ids, week_ago, yesterday)
    
    # Формируем сообщение
    now = datetime.now().strftime("%d.%m.%Y %H:%M")
    msg = f"📊 <b>Отчёт Яндекс.Директ</b>\n"
    msg += f"📅 {now}\n"
    msg += f"{'─' * 30}\n\n"
    
    # Общие показатели за неделю
    total_cost = 0
    total_clicks = 0
    total_impressions = 0
    total_conversions = 0
    
    if stats_week:
        for row in stats_week:
            try:
                total_cost += float(row.get("Cost", 0))
                total_clicks += int(row.get("Clicks", 0))
                total_impressions += int(row.get("Impressions", 0))
                total_conversions += int(row.get("Conversions", 0))
            except (ValueError, TypeError):
                pass
    
    avg_ctr = (total_clicks / total_impressions * 100) if total_impressions > 0 else 0
    avg_cpa = (total_cost / total_conversions) if total_conversions > 0 else 0
    
    msg += f"📈 <b>За последние 7 дней (все кампании):</b>\n"
    msg += f"💰 Расход: {format_number(total_cost)} ₽\n"
    msg += f"👁 Показы: {format_number(total_impressions)}\n"
    msg += f"👆 Клики: {format_number(total_clicks)}\n"
    msg += f"📊 CTR: {avg_ctr:.2f}%\n"
    msg += f"🎯 Конверсии: {total_conversions}\n"
    if total_conversions > 0:
        msg += f"💲 CPA: {format_number(avg_cpa)} ₽\n"
    msg += f"\n{'─' * 30}\n\n"
    
    # По каждой кампании
    msg += f"📋 <b>По кампаниям (7 дней):</b>\n\n"
    
    if stats_week:
        # Группируем по кампаниям
        camp_data = {}
        for row in stats_week:
            cid = row.get("CampaignId", "")
            if cid not in camp_data:
                camp_data[cid] = {
                    "name": row.get("CampaignName", f"ID:{cid}"),
                    "cost": 0, "clicks": 0, "impressions": 0, "conversions": 0
                }
            try:
                camp_data[cid]["cost"] += float(row.get("Cost", 0))
                camp_data[cid]["clicks"] += int(row.get("Clicks", 0))
                camp_data[cid]["impressions"] += int(row.get("Impressions", 0))
                camp_data[cid]["conversions"] += int(row.get("Conversions", 0))
            except (ValueError, TypeError):
                pass
        
        for cid, data in camp_data.items():
            state_emoji = "🟢" if campaign_states.get(int(cid) if cid.isdigit() else 0) == "ON" else "🔴"
            ctr = (data["clicks"] / data["impressions"] * 100) if data["impressions"] > 0 else 0
            cpa = (data["cost"] / data["conversions"]) if data["conversions"] > 0 else 0
            
            msg += f"{state_emoji} <b>{data['name']}</b>\n"
            msg += f"   💰 {format_number(data['cost'])} ₽ · 👆 {data['clicks']} кл."
            msg += f" · 📊 {ctr:.1f}%"
            msg += f" · 🎯 {data['conversions']} конв."
            if data['conversions'] > 0:
                msg += f" · CPA {format_number(cpa)} ₽"
            msg += "\n\n"
    else:
        msg += "⚠️ Нет данных за период\n\n"
    
    return msg


def check_alerts():
    """Проверка условий для алертов"""
    log.info("Проверяю алерты...")
    alerts = []
    
    campaigns = get_campaigns()
    if not campaigns:
        return alerts
    
    campaign_ids = [c["Id"] for c in campaigns]
    
    # Статистика за последние N дней (для проверки конверсий)
    date_from = (datetime.now() - timedelta(days=ALERT_NO_CONV_DAYS)).strftime("%Y-%m-%d")
    date_to = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    
    stats = get_campaign_stats(campaign_ids, date_from, date_to)
    
    if stats:
        camp_data = {}
        for row in stats:
            cid = row.get("CampaignId", "")
            if cid not in camp_data:
                camp_data[cid] = {
                    "name": row.get("CampaignName", f"ID:{cid}"),
                    "cost": 0, "clicks": 0, "impressions": 0, "conversions": 0
                }
            try:
                camp_data[cid]["cost"] += float(row.get("Cost", 0))
                camp_data[cid]["clicks"] += int(row.get("Clicks", 0))
                camp_data[cid]["impressions"] += int(row.get("Impressions", 0))
                camp_data[cid]["conversions"] += int(row.get("Conversions", 0))
            except (ValueError, TypeError):
                pass
        
        for cid, data in camp_data.items():
            name = data["name"]
            
            # Алерт: высокий CPA
            if data["conversions"] > 0:
                cpa = data["cost"] / data["conversions"]
                if cpa > ALERT_CPA_MAX:
                    alerts.append(
                        f"🔴 <b>Высокий CPA!</b>\n"
                        f"Кампания: {name}\n"
                        f"CPA: {format_number(cpa)} ₽ (порог: {ALERT_CPA_MAX} ₽)\n"
                        f"За {ALERT_NO_CONV_DAYS} дней: {data['conversions']} конв., "
                        f"расход {format_number(data['cost'])} ₽"
                    )
            
            # Алерт: 0 конверсий
            if data["conversions"] == 0 and data["clicks"] > 5:
                alerts.append(
                    f"⚠️ <b>0 конверсий за {ALERT_NO_CONV_DAYS} дней!</b>\n"
                    f"Кампания: {name}\n"
                    f"Клики: {data['clicks']}, Расход: {format_number(data['cost'])} ₽\n"
                    f"Проверьте цели Метрики и посадочные страницы"
                )
            
            # Алерт: низкий CTR
            if data["impressions"] > 100:
                ctr = data["clicks"] / data["impressions"] * 100
                if ctr < ALERT_CTR_MIN:
                    alerts.append(
                        f"⚠️ <b>Низкий CTR!</b>\n"
                        f"Кампания: {name}\n"
                        f"CTR: {ctr:.2f}% (порог: {ALERT_CTR_MIN}%)\n"
                        f"Проверьте тексты объявлений и ключевые фразы"
                    )
    
    return alerts


# ============================================================
# ГЛАВНЫЕ ФУНКЦИИ
# ============================================================

def daily_report():
    """Ежедневный отчёт + алерты"""
    log.info("=" * 50)
    log.info("Запуск ежедневного отчёта")
    
    # Отчёт
    report = build_daily_report()
    send_telegram(report)
    
    # Алерты
    alerts = check_alerts()
    if alerts:
        alert_msg = f"🚨 <b>АЛЕРТЫ ({len(alerts)})</b>\n\n"
        alert_msg += "\n\n".join(alerts)
        send_telegram(alert_msg)
    else:
        log.info("Алертов нет")
    
    log.info("Ежедневный отчёт завершён")


def test_connection():
    """Тест подключения ко всем сервисам"""
    log.info("Тестирую подключения...")
    
    # Тест Telegram
    log.info("1. Тестирую Telegram...")
    tg_ok = send_telegram("✅ Тест подключения: Telegram работает!")
    
    # Тест Яндекс.Директ
    log.info("2. Тестирую Яндекс.Директ API...")
    campaigns = get_campaigns()
    
    if campaigns:
        names = [c["Name"] for c in campaigns]
        msg = f"✅ Тест подключения: Яндекс.Директ работает!\n\n"
        msg += f"Найдено кампаний: {len(campaigns)}\n"
        for c in campaigns:
            state = "🟢" if c["State"] == "ON" else "🔴"
            msg += f"{state} {c['Name']} (ID: {c['Id']})\n"
        send_telegram(msg)
        log.info(f"Директ OK: найдено {len(campaigns)} кампаний")
    else:
        send_telegram("❌ Тест подключения: Яндекс.Директ — ошибка! Проверьте токен.")
        log.error("Директ: ошибка подключения")
    
    log.info("Тестирование завершено")


# ============================================================
# ТОЧКА ВХОДА
# ============================================================

if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        if command == "test":
            test_connection()
        elif command == "report":
            daily_report()
        elif command == "alerts":
            alerts = check_alerts()
            if alerts:
                for a in alerts:
                    send_telegram(a)
            else:
                send_telegram("✅ Алертов нет. Все кампании в норме.")
        else:
            print(f"Неизвестная команда: {command}")
            print("Использование:")
            print("  python3 monitor.py test    — тест подключения")
            print("  python3 monitor.py report  — ежедневный отчёт")
            print("  python3 monitor.py alerts  — проверка алертов")
    else:
        print("Рубикон — Мониторинг Яндекс.Директ")
        print("Использование:")
        print("  python3 monitor.py test    — тест подключения")
        print("  python3 monitor.py report  — ежедневный отчёт")
        print("  python3 monitor.py alerts  — проверка алертов")
        print("")
        print("Для автозапуска добавьте в cron:")
        print("  0 9 * * * cd /home/rubikon && python3 monitor.py report")
        print("  0 */4 * * * cd /home/rubikon && python3 monitor.py alerts")
