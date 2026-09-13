import { prisma } from '@/lib/prisma';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const certificateId = params.id;

  const certificate = await prisma.certificate.findUnique({
    where: { id: certificateId },
    include: { user: true, course: true },
  });

  if (!certificate) {
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
  }

  try {
    // A4 Landscape (842 × 595 pts)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]);
    const { width, height } = page.getSize();

    // ── Fonts ────────────────────────────────────────────────────────────────
    const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // ── Colours ──────────────────────────────────────────────────────────────
    const cInk = rgb(0.23, 0.165, 0.1);   // espresso #3B2A1A
    const cGold = rgb(0.659, 0.545, 0.412); // taupe/gold #A88B69
    const cWhite = rgb(1, 1, 1);
    const cCream = rgb(0.98, 0.969, 0.949); // #FAF7F2

    // ── Background ───────────────────────────────────────────────────────────
    const templatePath = path.join(process.cwd(), 'public', 'certificate_template.png');
    if (fs.existsSync(templatePath)) {
      const templateBytes = fs.readFileSync(templatePath);
      const templateImg = await pdfDoc.embedPng(templateBytes);
      page.drawImage(templateImg, { x: 0, y: 0, width, height });
    } else {
      // Fallback plain background
      page.drawRectangle({ x: 0, y: 0, width, height, color: cCream });
    }

    // ── OOW Logo (bottom-left) ───────────────────────────────────────────────
    const logoPath = path.join(process.cwd(), 'public', 'al_warqaa_logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImg = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImg, { x: 54, y: 54, width: 64, height: 64 });
    }

    // ── Top header bar ───────────────────────────────────────────────────────
    page.drawRectangle({ x: 32, y: height - 90, width: width - 64, height: 58, color: cInk });

    // AIWISE wordmark in header
    const aiText = 'AI';
    const wiseText = 'WISE';
    const aiW = fontBold.widthOfTextAtSize(aiText, 28);
    const wiseW = fontBold.widthOfTextAtSize(wiseText, 28);
    const logoX = 54;
    const logoY = height - 72;
    page.drawText(aiText, { x: logoX, y: logoY, size: 28, font: fontBold, color: cGold });
    page.drawText(wiseText, { x: logoX + aiW, y: logoY, size: 28, font: fontBold, color: cWhite });

    const schoolText = "GEMS Our Own High School, Al Warqa'a";
    page.drawText(schoolText, {
      x: width / 2 - fontReg.widthOfTextAtSize(schoolText, 11) / 2,
      y: logoY + 8,
      size: 11, font: fontReg, color: cWhite,
    });

    // ── Gold divider lines ───────────────────────────────────────────────────
    const bodyTop = height - 100;
    const margin = 54;
    page.drawLine({ start: { x: margin, y: bodyTop - 2 }, end: { x: width - margin, y: bodyTop - 2 }, thickness: 1.5, color: cGold });

    // ── THIS CERTIFICATE IS AWARDED TO ───────────────────────────────────────
    const awardedY = bodyTop - 50;
    const awardedText = 'THIS CERTIFICATE IS PROUDLY AWARDED TO';
    page.drawText(awardedText, {
      x: width / 2 - fontReg.widthOfTextAtSize(awardedText, 11) / 2,
      y: awardedY, size: 11, font: fontReg, color: cInk,
    });

    // ── Student Name ─────────────────────────────────────────────────────────
    const studentName = (certificate.user.name || certificate.user.email).toUpperCase();
    // Scale font down if name is too long
    const nameFontSize = Math.min(46, Math.max(24, 46 - Math.max(0, studentName.length - 16) * 1.5));
    const nameWidth = fontBold.widthOfTextAtSize(studentName, nameFontSize);
    const nameY = awardedY - 55;
    page.drawText(studentName, {
      x: width / 2 - nameWidth / 2,
      y: nameY, size: nameFontSize, font: fontBold, color: cInk,
    });

    // Gold underline under name
    const underlineW = Math.min(nameWidth + 60, width - margin * 2);
    page.drawLine({
      start: { x: width / 2 - underlineW / 2, y: nameY - 8 },
      end: { x: width / 2 + underlineW / 2, y: nameY - 8 },
      thickness: 2.5, color: cGold,
    });

    // ── Completion description ───────────────────────────────────────────────
    const descY = nameY - 38;
    const descLine1 = 'for successfully completing the curriculum and requirements of:';
    page.drawText(descLine1, {
      x: width / 2 - fontReg.widthOfTextAtSize(descLine1, 11) / 2,
      y: descY, size: 11, font: fontReg, color: cInk,
    });

    // ── Course Title ─────────────────────────────────────────────────────────
    const courseTitle = certificate.course.title;
    const ctFontSize = Math.min(22, Math.max(14, 22 - Math.max(0, courseTitle.length - 30) * 0.5));
    const courseY = descY - 38;
    const ctWidth = fontBold.widthOfTextAtSize(courseTitle, ctFontSize);
    page.drawText(courseTitle, {
      x: width / 2 - ctWidth / 2,
      y: courseY, size: ctFontSize, font: fontBold, color: cGold,
    });

    // ── Bottom divider ───────────────────────────────────────────────────────
    const footerTop = 150;
    page.drawLine({
      start: { x: margin, y: footerTop },
      end: { x: width - margin, y: footerTop },
      thickness: 1, color: cGold,
    });

    // ── Signature area ───────────────────────────────────────────────────────
    const sigY = footerTop - 20;
    // Left signature
    page.drawText('S. Thomas', { x: margin + 10, y: sigY, size: 18, font: fontItalic, color: cInk });
    page.drawLine({ start: { x: margin, y: sigY - 6 }, end: { x: margin + 140, y: sigY - 6 }, thickness: 1, color: cInk });
    page.drawText('Authorized By:', { x: margin, y: sigY - 22, size: 9, font: fontBold, color: cGold });
    page.drawText('Sanjeev Thomas, Principal', { x: margin, y: sigY - 34, size: 9, font: fontReg, color: cInk });

    // Center: date
    const dateStr = certificate.issuedAt.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    const dateLabel = 'Date of Issue';
    page.drawText(dateLabel, {
      x: width / 2 - fontBold.widthOfTextAtSize(dateLabel, 9) / 2,
      y: sigY - 22, size: 9, font: fontBold, color: cGold,
    });
    page.drawText(dateStr, {
      x: width / 2 - fontReg.widthOfTextAtSize(dateStr, 10) / 2,
      y: sigY - 34, size: 10, font: fontReg, color: cInk,
    });

    // Right: verification
    const verifyLabel = 'Verify this certificate at:';
    const verifyUrl = `aiwise.school/verify/${certificate.verificationToken.substring(0, 8)}...`;
    page.drawText(verifyLabel, { x: width - margin - 200, y: sigY - 22, size: 9, font: fontBold, color: cGold });
    page.drawText(verifyUrl, { x: width - margin - 200, y: sigY - 34, size: 9, font: fontReg, color: cInk });

    // ── Certificate ID watermark ─────────────────────────────────────────────
    const certIdText = `Certificate ID: ${certificate.id}`;
    page.drawText(certIdText, {
      x: width / 2 - fontReg.widthOfTextAtSize(certIdText, 7) / 2,
      y: 28, size: 7, font: fontReg, color: rgb(0.6, 0.6, 0.6),
    });

    // ── Outer border (4 lines each, avoids pdf-lib fill requirement) ──────────
    const drawBorder = (x: number, y: number, w: number, h: number, col: ReturnType<typeof rgb>, thickness: number) => {
      page.drawLine({ start: { x, y }, end: { x: x + w, y }, thickness, color: col });
      page.drawLine({ start: { x, y: y + h }, end: { x: x + w, y: y + h }, thickness, color: col });
      page.drawLine({ start: { x, y }, end: { x, y: y + h }, thickness, color: col });
      page.drawLine({ start: { x: x + w, y }, end: { x: x + w, y: y + h }, thickness, color: col });
    };
    drawBorder(18, 18, width - 36, height - 36, cInk, 2);
    drawBorder(26, 26, width - 52, height - 52, cGold, 1);

    // ── Render ───────────────────────────────────────────────────────────────
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AIWISE_Certificate_${certificate.id.substring(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
