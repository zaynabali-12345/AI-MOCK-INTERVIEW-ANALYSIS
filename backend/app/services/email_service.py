import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List

from ..core.config import settings

def create_welcome_email_template(username: str) -> str:
    """Creates a simple HTML email template for new user signup."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }}
            .header {{ font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 20px; text-align: center; }}
            .content p {{ margin-bottom: 15px; }}
            .footer {{ margin-top: 20px; font-size: 12px; color: #777; text-align: center; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">Welcome to AI Mock Interview!</div>
            <div class="content">
                <p>Hi {username},</p>
                <p>Thank you for joining our platform. We're excited to help you practice and ace your next interview.</p>
                <p>You can now log in and start using our features, including resume analysis and realistic AI-powered mock interviews.</p>
                <p>Best of luck!</p>
                <p>The AI Mock Interview Team</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 AI Mock Interview. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def send_email(to_email: str, subject: str, html_content: str):
    """Sends an email using configured SMTP settings."""
    # Ensure all required settings are present
    assert settings.EMAILS_FROM_EMAIL, "EMAILS_FROM_EMAIL must be set"
    assert settings.SMTP_HOST, "SMTP_HOST must be set"
    assert settings.SMTP_USER, "SMTP_USER must be set"
    assert settings.SMTP_PASSWORD, "SMTP_PASSWORD must be set"

    msg = MIMEMultipart()
    msg["From"] = settings.EMAILS_FROM_EMAIL
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(html_content, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()  # Secure the connection
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)

def send_signup_welcome_email(to_email: str, username: str):
    """Constructs and sends the welcome email to a new user."""
    subject = "Welcome to AI Mock Interview!"
    html_content = create_welcome_email_template(username=username)
    send_email(to_email=to_email, subject=subject, html_content=html_content)