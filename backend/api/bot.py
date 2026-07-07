import urllib.request
import urllib.parse
from django.conf import settings
from django.utils import timezone
from django.utils.timezone import localtime
from .models import BotConfig


def get_chat_id():
    config = BotConfig.objects.first()
    if config and config.chat_id:
        return config.chat_id
    return settings.TELEGRAM_DEFAULT_CHAT_ID


def get_bot_token():
    config = BotConfig.objects.first()
    if config and config.bot_token:
        return config.bot_token
    return settings.TELEGRAM_BOT_TOKEN


def send_telegram_message(text):
    token = get_bot_token()
    chat_id = get_chat_id()
    url = f'https://api.telegram.org/bot{token}/sendMessage'
    data = urllib.parse.urlencode({
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
    }).encode()
    try:
        req = urllib.request.Request(url, data=data)
        urllib.request.urlopen(req, timeout=5)
    except Exception as e:
        print(f'Telegram bot error: {e}')


def notify_support_busy(support_name, student_name, topic):
    now_str = localtime(timezone.now()).strftime('%H:%M')
    msg = (
        f"\U0001F534 <b>Support dars boshladi!</b>\n\n"
        f"\U0001F4AA {support_name} dars boshladi\n"
        f"\U0001F393 Student: {student_name}\n"
        f"\U0001F4D6 Mavzu: {topic}\n"
        f"\U0001F552 Vaqt: {now_str}"
    )
    send_telegram_message(msg)


def notify_support_free(support_name, student_name, topic):
    now_str = localtime(timezone.now()).strftime('%H:%M')
    msg = (
        f"\U0001F514 <b>Support bosh!</b>\n\n"
        f"\U0001F44A {support_name} darsni tugatdi\n"
        f"\U0001F393 Student: {student_name}\n"
        f"\U0001F4D6 Mavzu: {topic}\n"
        f"\U0001F552 Vaqt: {now_str}"
    )
    send_telegram_message(msg)
