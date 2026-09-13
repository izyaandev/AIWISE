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
      // Detect actual format by magic bytes (image may be JPEG despite .png extension)
      const isJpeg = templateBytes[0] === 0xff && templateBytes[1] === 0xd8;
      const templateImg = isJpeg
        ? await pdfDoc.embedJpg(templateBytes)
        : await pdfDoc.embedPng(templateBytes);
      page.drawImage(templateImg, { x: 0, y: 0, width, height });
    } else {
      // Fallback plain background
      page.drawRectangle({ x: 0, y: 0, width, height, color: cCream });
    }

    // ── Student Name ─────────────────────────────────────────────────────────
    const studentName = (certificate.user.name || certificate.user.email).toUpperCase();
    const nameFontSize = Math.min(48, Math.max(28, 48 - Math.max(0, studentName.length - 16) * 1.5));
    const nameWidth = fontBold.widthOfTextAtSize(studentName, nameFontSize);
    page.drawText(studentName, {
      x: width / 2 - nameWidth / 2,
      y: height / 2, // Centered vertically
      size: nameFontSize, font: fontBold, color: cInk,
    });

    // ── Course Title ─────────────────────────────────────────────────────────
    const courseTitle = certificate.course.title;
    const ctFontSize = Math.min(24, Math.max(16, 24 - Math.max(0, courseTitle.length - 30) * 0.5));
    const ctWidth = fontBold.widthOfTextAtSize(courseTitle, ctFontSize);
    page.drawText(courseTitle, {
      x: width / 2 - ctWidth / 2,
      y: height / 2 - 60, // Below name
      size: ctFontSize, font: fontBold, color: cGold,
    });

    // ── Date ─────────────────────────────────────────────────────────────────
    const dateStr = certificate.issuedAt.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    const dateWidth = fontReg.widthOfTextAtSize(dateStr, 14);
    page.drawText(dateStr, {
      x: width / 2 - dateWidth / 2,
      y: height / 2 - 120, // Below course
      size: 14, font: fontReg, color: cInk,
    });

    // ── Certificate ID watermark ─────────────────────────────────────────────
    const certIdText = `Certificate ID: ${certificate.id}`;
    page.drawText(certIdText, {
      x: width / 2 - fontReg.widthOfTextAtSize(certIdText, 9) / 2,
      y: 40, size: 9, font: fontReg, color: rgb(0.5, 0.5, 0.5),
    });

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
