#!/usr/bin/env python3
"""
BabichFit Lead Handler
Receives form submissions, sends email via SMTP and Telegram notification.
Run: python3 leads_server.py
Port: 8891 (behind nginx reverse proxy)
"""

import json
import smtplib
import urllib.request
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# ============ CONFIG ============
SMTP_HOST = "localhost"
SMTP_PORT = 25
EMAIL_FROM = "noreply@babichfit.pro"
EMAIL_TO = "fitgirl2812@gmail.com"

TG_BOT_TOKEN = "8055512273:AAFZQKt4A_Rp5lKl3jTSOVIb-Id5R1HR_EQ"
TG_CHAT_ID = "408519663"

SERVER_PORT = 8891
# ================================

def send_telegram(text):
    """Send message to Telegram bot"""
    try:
        url = "https://api.telegram.org/bot" + TG_BOT_TOKEN + "/sendMessage"
        data = urllib.parse.urlencode({
            "chat_id": TG_CHAT_ID,
            "text": text,
            "parse_mode": "HTML"
        }).encode("utf-8")
        req = urllib.request.Request(url, data=data)
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200
    except Exception as e:
        print("TG error: " + str(e))
        return False


def send_email(name, phone, fmt, comment):
    """Send email notification"""
    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL_FROM
        msg["To"] = EMAIL_TO
        msg["Subject"] = "Новая заявка с babichfit.pro - " + name

        body = (
            "<h2>Новая заявка с сайта babichfit.pro</h2>"
            "<table style='border-collapse:collapse;'>"
            "<tr><td style='padding:8px;font-weight:bold;'>Имя:</td><td style='padding:8px;'>" + name + "</td></tr>"
            "<tr><td style='padding:8px;font-weight:bold;'>Телефон:</td><td style='padding:8px;'>" + phone + "</td></tr>"
            "<tr><td style='padding:8px;font-weight:bold;'>Формат:</td><td style='padding:8px;'>" + fmt + "</td></tr>"
            "<tr><td style='padding:8px;font-weight:bold;'>Комментарий:</td><td style='padding:8px;'>" + comment + "</td></tr>"
            "<tr><td style='padding:8px;font-weight:bold;'>Дата:</td><td style='padding:8px;'>" + datetime.now().strftime("%d.%m.%Y %H:%M") + "</td></tr>"
            "</table>"
        )
        msg.attach(MIMEText(body, "html", "utf-8"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.sendmail(EMAIL_FROM, EMAIL_TO, msg.as_string())
        return True
    except Exception as e:
        print("Email error: " + str(e))
        return False


class LeadHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self):
        if self.path != "/api/lead":
            self.send_response(404)
            self.end_headers()
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(length)
            data = json.loads(raw.decode("utf-8"))

            name = data.get("name", "").strip()
            phone = data.get("phone", "").strip()
            fmt = data.get("format", "").strip()
            comment = data.get("comment", "").strip()

            if not name or not phone:
                self.send_response(400)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": False, "error": "name and phone required"}).encode())
                return

            # Telegram notification
            tg_text = (
                "<b>Новая заявка с babichfit.pro</b>\n\n"
                "Имя: " + name + "\n"
                "Телефон: " + phone + "\n"
                "Формат: " + fmt + "\n"
                "Комментарий: " + comment + "\n"
                "Дата: " + datetime.now().strftime("%d.%m.%Y %H:%M")
            )
            tg_ok = send_telegram(tg_text)

            # Email notification
            email_ok = send_email(name, phone, fmt, comment)

            print(datetime.now().strftime("%Y-%m-%d %H:%M:%S") + " | Lead: " + name + " | " + phone + " | TG:" + str(tg_ok) + " | Email:" + str(email_ok))

            self.send_response(200)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True, "tg": tg_ok, "email": email_ok}).encode())

        except Exception as e:
            print("Error: " + str(e))
            self.send_response(500)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": False, "error": str(e)}).encode())

    def log_message(self, format, *args):
        pass  # Suppress default logging


if __name__ == "__main__":
    server = HTTPServer(("127.0.0.1", SERVER_PORT), LeadHandler)
    print("BabichFit Lead Server running on port " + str(SERVER_PORT))
    server.serve_forever()
