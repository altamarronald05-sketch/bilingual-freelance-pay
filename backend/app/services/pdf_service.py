import os
import hashlib
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_contract_pdf(project_title: str, client_name: str, freelancer_name: str, total_amount: float, currency: str, milestones_data: list, output_filepath: str) -> str:
    """Generate a bilingual legal contract PDF with digital SHA-256 signature hash."""
    doc = SimpleDocTemplate(output_filepath, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []

    # Custom Styles
    primary_color = colors.HexColor("#1e293b")
    accent_color = colors.HexColor("#0284c7")
    text_dark = colors.HexColor("#334155")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=primary_color,
        spaceAfter=10
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=accent_color,
        spaceAfter=20
    )

    h2_style = ParagraphStyle(
        'H2Title',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_dark,
        spaceAfter=8
    )

    # Document Header
    story.append(Paragraph("CONTRATO DE SERVICIOS INDEPENDIENTES / FREELANCE AGREEMENT", title_style))
    story.append(Paragraph("Gestor Bilingüe de Contratos y Pagos en Criptomonedas/FIAT", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_color, spaceAfter=15))

    # Parties Metadata Table
    parties_data = [
        [Paragraph("<b>Cliente / Client:</b>", body_style), Paragraph(client_name, body_style)],
        [Paragraph("<b>Freelancer / Contractor:</b>", body_style), Paragraph(freelancer_name, body_style)],
        [Paragraph("<b>Proyecto / Project Title:</b>", body_style), Paragraph(project_title, body_style)],
        [Paragraph("<b>Monto Total / Total Amount:</b>", body_style), Paragraph(f"{total_amount:,.2f} {currency}", body_style)],
        [Paragraph("<b>Fecha de Emisión / Date:</b>", body_style), Paragraph(datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"), body_style)],
    ]
    t = Table(parties_data, colWidths=[180, 350])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 15))

    # Scope & Terms
    story.append(Paragraph("1. ALCANCE Y HITOS / SCOPE & MILESTONES", h2_style))
    story.append(Paragraph("Las partes acuerdan la ejecución del proyecto dividido en los siguientes hitos de pago (milestones):", body_style))

    # Milestones Table
    table_headers = [Paragraph("<b>#</b>", body_style), Paragraph("<b>Hito / Milestone</b>", body_style), Paragraph("<b>Monto / Amount</b>", body_style), Paragraph("<b>Estado / Status</b>", body_style)]
    ms_rows = [table_headers]
    for idx, ms in enumerate(milestones_data, 1):
        ms_rows.append([
            Paragraph(str(idx), body_style),
            Paragraph(f"<b>{ms.get('title', '')}</b><br/>{ms.get('description', '') or ''}", body_style),
            Paragraph(f"{ms.get('amount', 0):,.2f} {ms.get('currency', currency)}", body_style),
            Paragraph(ms.get('status', 'pending').upper(), body_style)
        ])
    
    ms_table = Table(ms_rows, colWidths=[30, 260, 120, 120])
    ms_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0284c7")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(ms_table)
    story.append(Spacer(1, 15))

    # Digital Signature & Verification Hash
    raw_signature_payload = f"{project_title}|{client_name}|{freelancer_name}|{total_amount}|{datetime.now(timezone.utc).isoformat()}"
    digital_signature = hashlib.sha256(raw_signature_payload.encode('utf-8')).hexdigest()

    story.append(Paragraph("2. VERIFICACIÓN Y FIRMA DIGITAL SIMULADA / DIGITAL SIGNATURE", h2_style))
    story.append(Paragraph("Este documento ha sido sellado criptográficamente mediante un token de firma digital SHA-256 unico e inalterable.", body_style))

    sig_data = [
        [Paragraph("<b>Firma Digital Hash (SHA-256):</b>", body_style)],
        [Paragraph(f"<font fontName='Courier' size='8' color='#0284c7'>{digital_signature}</font>", body_style)],
        [Paragraph("<b>Estado de Firma:</b> VALIDO / VERIFIED", body_style)]
    ]
    sig_table = Table(sig_data, colWidths=[530])
    sig_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f0fdf4")),
        ('BORDER', (0,0), (-1,-1), 1, colors.HexColor("#bbf7d0")),
        ('PADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(sig_table)

    # Build Document
    os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
    doc.build(story)
    
    return digital_signature
