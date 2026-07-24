from datetime import datetime, timezone

def generate_payment_receipt_html(client_name: str, freelancer_name: str, project_title: str, milestone_title: str, amount: float, currency: str, tx_hash: str) -> str:
    """Generate a sleek HTML email template for payment receipts."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0f17; color: #f8fafc; margin: 0; padding: 20px; }}
        .card {{ background: #121826; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 30px; max-width: 600px; margin: 0 auto; }}
        .header {{ border-bottom: 2px solid #06b6d4; padding-bottom: 15px; margin-bottom: 20px; }}
        .title {{ font-size: 20px; font-weight: bold; color: #06b6d4; }}
        .amount {{ font-size: 32px; font-weight: 800; color: #10b981; margin: 15px 0; }}
        .details {{ background: #060911; padding: 15px; border-radius: 10px; font-size: 13px; line-height: 1.6; color: #94a3b8; }}
        .hash {{ font-family: monospace; color: #38bdf8; background: #000; padding: 6px 10px; border-radius: 6px; word-break: break-all; }}
        .footer {{ font-size: 11px; color: #64748b; margin-top: 25px; text-align: center; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="title">PayLance — Comprobante Digital de Pago</div>
        </div>
        <p>Hola <strong>{client_name}</strong>,</p>
        <p>Se ha liberado exitosamente el pago del hito asignado a <strong>{freelancer_name}</strong>.</p>
        
        <div class="amount">{amount:,.2f} {currency}</div>
        
        <div class="details">
          <div><strong>Proyecto:</strong> {project_title}</div>
          <div><strong>Hito:</strong> {milestone_title}</div>
          <div><strong>Fecha:</strong> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}</div>
          <div><strong>Transacción Hash:</strong></div>
          <div class="hash">{tx_hash}</div>
        </div>
        
        <div class="footer">
          Este correo fue generado automáticamente por PayLance Billing System. Certificado SHA-256.
        </div>
      </div>
    </body>
    </html>
    """
