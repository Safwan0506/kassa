package com.kassa.api.service;

import com.kassa.api.entity.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PdfService {

    private static final Color BRAND_GREEN = new Color(18, 97, 79);
    private static final Color BRAND_OCHRE = new Color(185, 121, 31);
    private static final Color LIGHT_GRAY = new Color(245, 245, 240);
    private static final Color TABLE_HEADER_BG = new Color(18, 97, 79);

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Africa/Douala"));

    private static final DateTimeFormatter DATE_ONLY_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy").withZone(ZoneId.of("Africa/Douala"));

    private static final NumberFormat FCFA_FMT;
    static {
        FCFA_FMT = NumberFormat.getNumberInstance(Locale.FRANCE);
        FCFA_FMT.setMinimumFractionDigits(0);
        FCFA_FMT.setMaximumFractionDigits(0);
    }

    public byte[] generateInvoicePdf(Invoice invoice) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);

        try {
            PdfWriter writer = PdfWriter.getInstance(doc, baos);
            doc.open();

            Font titleFont = new Font(Font.HELVETICA, 22, Font.BOLD, BRAND_GREEN);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Font normalFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.BLACK);
            Font boldFont = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);
            Font smallFont = new Font(Font.HELVETICA, 8, Font.NORMAL, Color.GRAY);
            Font statusFont = new Font(Font.HELVETICA, 11, Font.BOLD);
            Font totalFont = new Font(Font.HELVETICA, 12, Font.BOLD, BRAND_GREEN);

            addHeader(doc, invoice, titleFont, normalFont, boldFont, smallFont, statusFont);

            doc.add(Chunk.NEWLINE);

            addCustomerAndShopInfo(doc, invoice, normalFont, boldFont);

            doc.add(Chunk.NEWLINE);

            addLinesTable(doc, invoice, headerFont, normalFont, boldFont);

            doc.add(Chunk.NEWLINE);

            addTotals(doc, invoice, normalFont, boldFont, totalFont);

            if (!invoice.getPayments().isEmpty()) {
                doc.add(Chunk.NEWLINE);
                addPayments(doc, invoice, headerFont, normalFont, boldFont);
            }

            if (invoice.getNotes() != null && !invoice.getNotes().isBlank()) {
                doc.add(Chunk.NEWLINE);
                Paragraph notesPara = new Paragraph("Notes : " + invoice.getNotes(), smallFont);
                doc.add(notesPara);
            }

            addFooter(writer, invoice, smallFont);

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed", e);
        }

        return baos.toByteArray();
    }

    public byte[] generateDeliveryNotePdf(Invoice invoice) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);

        try {
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Font titleFont = new Font(Font.HELVETICA, 22, Font.BOLD, BRAND_GREEN);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Font normalFont = new Font(Font.HELVETICA, 9, Font.NORMAL, Color.BLACK);
            Font boldFont = new Font(Font.HELVETICA, 9, Font.BOLD, Color.BLACK);
            Font smallFont = new Font(Font.HELVETICA, 8, Font.NORMAL, Color.GRAY);

            Paragraph title = new Paragraph("BON DE LIVRAISON", titleFont);
            title.setAlignment(Element.ALIGN_LEFT);
            doc.add(title);

            Paragraph ref = new Paragraph("Ref. Facture : " + invoice.getInvoiceNumber(), normalFont);
            doc.add(ref);

            Paragraph date = new Paragraph("Date : " + DATE_FMT.format(invoice.getCreatedAt()), normalFont);
            doc.add(date);

            doc.add(Chunk.NEWLINE);

            addCustomerAndShopInfo(doc, invoice, normalFont, boldFont);

            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(new float[]{5f, 45f, 15f, 15f});
            table.setWidthPercentage(100);

            addCell(table, "#", headerFont, TABLE_HEADER_BG, Element.ALIGN_CENTER);
            addCell(table, "Produit", headerFont, TABLE_HEADER_BG, Element.ALIGN_LEFT);
            addCell(table, "Quantite", headerFont, TABLE_HEADER_BG, Element.ALIGN_CENTER);
            addCell(table, "Unite", headerFont, TABLE_HEADER_BG, Element.ALIGN_CENTER);

            int row = 1;
            for (InvoiceLine line : invoice.getLines()) {
                Color bg = row % 2 == 0 ? LIGHT_GRAY : Color.WHITE;
                addCell(table, String.valueOf(row), normalFont, bg, Element.ALIGN_CENTER);
                addCell(table, line.getProductName(), normalFont, bg, Element.ALIGN_LEFT);
                addCell(table, String.valueOf(line.getQuantity()), normalFont, bg, Element.ALIGN_CENTER);
                addCell(table, line.getProduct().getUnit(), normalFont, bg, Element.ALIGN_CENTER);
                row++;
            }

            doc.add(table);

            doc.add(Chunk.NEWLINE);
            doc.add(Chunk.NEWLINE);

            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);

            PdfPCell deliveredCell = new PdfPCell(new Phrase("Livre par : ___________________", normalFont));
            deliveredCell.setBorder(Rectangle.NO_BORDER);
            deliveredCell.setPadding(8);

            PdfPCell receivedCell = new PdfPCell(new Phrase("Recu par : ___________________", normalFont));
            receivedCell.setBorder(Rectangle.NO_BORDER);
            receivedCell.setPadding(8);
            receivedCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

            sigTable.addCell(deliveredCell);
            sigTable.addCell(receivedCell);
            doc.add(sigTable);

            doc.add(Chunk.NEWLINE);
            Paragraph footer = new Paragraph(
                    "Document genere par Kassa — " + invoice.getOrganization().getName(),
                    smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("PDF generation failed", e);
        }

        return baos.toByteArray();
    }

    private void addHeader(Document doc, Invoice invoice,
                           Font titleFont, Font normalFont, Font boldFont,
                           Font smallFont, Font statusFont) throws DocumentException {
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{60f, 40f});

        PdfPCell leftCell = new PdfPCell();
        leftCell.setBorder(Rectangle.NO_BORDER);
        Paragraph orgName = new Paragraph(invoice.getOrganization().getName(), titleFont);
        leftCell.addElement(orgName);
        if (invoice.getShop().getAddress() != null) {
            leftCell.addElement(new Paragraph(invoice.getShop().getAddress(), smallFont));
        }
        headerTable.addCell(leftCell);

        PdfPCell rightCell = new PdfPCell();
        rightCell.setBorder(Rectangle.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph invoiceLabel = new Paragraph("FACTURE", new Font(Font.HELVETICA, 18, Font.BOLD, BRAND_GREEN));
        invoiceLabel.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(invoiceLabel);

        Paragraph invoiceNum = new Paragraph(invoice.getInvoiceNumber(), boldFont);
        invoiceNum.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(invoiceNum);

        Paragraph dateP = new Paragraph("Date : " + DATE_FMT.format(invoice.getCreatedAt()), normalFont);
        dateP.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(dateP);

        String statusText = translateStatus(invoice.getStatus());
        statusFont.setColor(getStatusColor(invoice.getStatus()));
        Paragraph statusP = new Paragraph(statusText, statusFont);
        statusP.setAlignment(Element.ALIGN_RIGHT);
        rightCell.addElement(statusP);

        headerTable.addCell(rightCell);
        doc.add(headerTable);

        LineSeparator sep = new LineSeparator();
        sep.setLineColor(BRAND_GREEN);
        sep.setLineWidth(1.5f);
        doc.add(new Chunk(sep));
    }

    private void addCustomerAndShopInfo(Document doc, Invoice invoice,
                                         Font normalFont, Font boldFont) throws DocumentException {
        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);

        PdfPCell shopCell = new PdfPCell();
        shopCell.setBorder(Rectangle.NO_BORDER);
        shopCell.addElement(new Paragraph("Boutique", boldFont));
        shopCell.addElement(new Paragraph(invoice.getShop().getName(), normalFont));
        if (invoice.getShop().getAddress() != null) {
            shopCell.addElement(new Paragraph(invoice.getShop().getAddress(), normalFont));
        }
        infoTable.addCell(shopCell);

        PdfPCell custCell = new PdfPCell();
        custCell.setBorder(Rectangle.NO_BORDER);
        if (invoice.getCustomer() != null) {
            custCell.addElement(new Paragraph("Client", boldFont));
            custCell.addElement(new Paragraph(invoice.getCustomer().getName(), normalFont));
            if (invoice.getCustomer().getPhone() != null) {
                custCell.addElement(new Paragraph("Tel : " + invoice.getCustomer().getPhone(), normalFont));
            }
            if (invoice.getCustomer().getEmail() != null) {
                custCell.addElement(new Paragraph(invoice.getCustomer().getEmail(), normalFont));
            }
            if (invoice.getCustomer().getAddress() != null) {
                custCell.addElement(new Paragraph(invoice.getCustomer().getAddress(), normalFont));
            }
        } else {
            custCell.addElement(new Paragraph("Client", boldFont));
            custCell.addElement(new Paragraph("Client comptoir", normalFont));
        }
        infoTable.addCell(custCell);

        doc.add(infoTable);
    }

    private void addLinesTable(Document doc, Invoice invoice,
                                Font headerFont, Font normalFont, Font boldFont) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[]{5f, 35f, 10f, 15f, 10f, 15f});
        table.setWidthPercentage(100);

        addCell(table, "#", headerFont, TABLE_HEADER_BG, Element.ALIGN_CENTER);
        addCell(table, "Produit", headerFont, TABLE_HEADER_BG, Element.ALIGN_LEFT);
        addCell(table, "Qte", headerFont, TABLE_HEADER_BG, Element.ALIGN_CENTER);
        addCell(table, "Prix Unit.", headerFont, TABLE_HEADER_BG, Element.ALIGN_RIGHT);
        addCell(table, "TVA", headerFont, TABLE_HEADER_BG, Element.ALIGN_CENTER);
        addCell(table, "Total HT", headerFont, TABLE_HEADER_BG, Element.ALIGN_RIGHT);

        int row = 1;
        for (InvoiceLine line : invoice.getLines()) {
            Color bg = row % 2 == 0 ? LIGHT_GRAY : Color.WHITE;
            addCell(table, String.valueOf(row), normalFont, bg, Element.ALIGN_CENTER);
            addCell(table, line.getProductName(), normalFont, bg, Element.ALIGN_LEFT);
            addCell(table, String.valueOf(line.getQuantity()), normalFont, bg, Element.ALIGN_CENTER);
            addCell(table, formatFcfa(line.getUnitPrice()), normalFont, bg, Element.ALIGN_RIGHT);
            addCell(table, line.getTvaRate().setScale(0, RoundingMode.HALF_UP) + "%", normalFont, bg, Element.ALIGN_CENTER);
            addCell(table, formatFcfa(line.getLineTotal()), normalFont, bg, Element.ALIGN_RIGHT);
            row++;
        }

        doc.add(table);
    }

    private void addTotals(Document doc, Invoice invoice,
                            Font normalFont, Font boldFont, Font totalFont) throws DocumentException {
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(50);
        totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

        addTotalRow(totalsTable, "Sous-total HT", formatFcfa(invoice.getSubtotal()), normalFont);
        addTotalRow(totalsTable, "TVA", formatFcfa(invoice.getTaxTotal()), normalFont);

        PdfPCell labelCell = new PdfPCell(new Phrase("TOTAL TTC", totalFont));
        labelCell.setBorder(Rectangle.TOP);
        labelCell.setBorderColor(BRAND_GREEN);
        labelCell.setBorderWidth(2f);
        labelCell.setPadding(6);
        totalsTable.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(formatFcfa(invoice.getTotal()) + " FCFA", totalFont));
        valueCell.setBorder(Rectangle.TOP);
        valueCell.setBorderColor(BRAND_GREEN);
        valueCell.setBorderWidth(2f);
        valueCell.setPadding(6);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalsTable.addCell(valueCell);

        if (invoice.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
            addTotalRow(totalsTable, "Deja paye", formatFcfa(invoice.getAmountPaid()), normalFont);
            Font dueFont = new Font(Font.HELVETICA, 10, Font.BOLD, BRAND_OCHRE);
            PdfPCell dueLbl = new PdfPCell(new Phrase("Reste a payer", dueFont));
            dueLbl.setBorder(Rectangle.NO_BORDER);
            dueLbl.setPadding(4);
            totalsTable.addCell(dueLbl);
            PdfPCell dueVal = new PdfPCell(new Phrase(formatFcfa(invoice.getAmountDue()) + " FCFA", dueFont));
            dueVal.setBorder(Rectangle.NO_BORDER);
            dueVal.setPadding(4);
            dueVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalsTable.addCell(dueVal);
        }

        doc.add(totalsTable);
    }

    private void addPayments(Document doc, Invoice invoice,
                              Font headerFont, Font normalFont, Font boldFont) throws DocumentException {
        Paragraph paymentsTitle = new Paragraph("Paiements", boldFont);
        doc.add(paymentsTitle);

        PdfPTable table = new PdfPTable(new float[]{25f, 25f, 25f, 25f});
        table.setWidthPercentage(100);
        table.setSpacingBefore(4);

        addCell(table, "Date", headerFont, TABLE_HEADER_BG, Element.ALIGN_LEFT);
        addCell(table, "Methode", headerFont, TABLE_HEADER_BG, Element.ALIGN_LEFT);
        addCell(table, "Reference", headerFont, TABLE_HEADER_BG, Element.ALIGN_LEFT);
        addCell(table, "Montant", headerFont, TABLE_HEADER_BG, Element.ALIGN_RIGHT);

        int row = 1;
        for (Payment p : invoice.getPayments()) {
            Color bg = row % 2 == 0 ? LIGHT_GRAY : Color.WHITE;
            addCell(table, DATE_ONLY_FMT.format(p.getCreatedAt()), normalFont, bg, Element.ALIGN_LEFT);
            addCell(table, translatePaymentMethod(p.getMethod()), normalFont, bg, Element.ALIGN_LEFT);
            addCell(table, p.getReference() != null ? p.getReference() : "-", normalFont, bg, Element.ALIGN_LEFT);
            addCell(table, formatFcfa(p.getAmount()) + " FCFA", normalFont, bg, Element.ALIGN_RIGHT);
            row++;
        }

        doc.add(table);
    }

    private void addFooter(PdfWriter writer, Invoice invoice, Font smallFont) {
        PdfContentByte cb = writer.getDirectContent();
        Phrase footer = new Phrase(
                "Kassa — " + invoice.getOrganization().getName()
                        + " | Genere le " + DATE_FMT.format(java.time.Instant.now()),
                smallFont);
        ColumnText.showTextAligned(cb, Element.ALIGN_CENTER, footer,
                (PageSize.A4.getLeft() + PageSize.A4.getRight()) / 2,
                PageSize.A4.getBottom() + 20, 0);
    }

    private void addCell(PdfPTable table, String text, Font font, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setHorizontalAlignment(align);
        cell.setPadding(6);
        cell.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value, Font font) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, font));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(4);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value + " FCFA", font));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(4);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    private String formatFcfa(BigDecimal amount) {
        return FCFA_FMT.format(amount.longValue());
    }

    private String translateStatus(InvoiceStatus status) {
        return switch (status) {
            case DRAFT -> "BROUILLON";
            case VALIDATED -> "VALIDEE";
            case PARTIALLY_PAID -> "PARTIELLEMENT PAYEE";
            case PAID -> "PAYEE";
            case CANCELLED -> "ANNULEE";
        };
    }

    private Color getStatusColor(InvoiceStatus status) {
        return switch (status) {
            case DRAFT -> Color.GRAY;
            case VALIDATED -> BRAND_GREEN;
            case PARTIALLY_PAID -> BRAND_OCHRE;
            case PAID -> new Color(46, 125, 79);
            case CANCELLED -> new Color(179, 38, 30);
        };
    }

    private String translatePaymentMethod(PaymentMethod method) {
        return switch (method) {
            case CASH -> "Especes";
            case MOBILE_MONEY -> "Mobile Money";
            case BANK_TRANSFER -> "Virement";
            case CARD -> "Carte";
            case OTHER -> "Autre";
        };
    }
}
