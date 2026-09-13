import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, Image as PdfImage, renderToBuffer, Font } from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';

// Note: React-PDF has standard fonts (Helvetica, Times-Roman) built-in, but we can also rely on the defaults.

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FAF7F2',
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 50,
    display: 'flex',
    flexDirection: 'column',
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#3B2A1A',
    paddingHorizontal: 20,
    marginTop: 20,
    marginHorizontal: -20, // stretch beyond padding slightly
  },
  logo: {
    width: 50,
    height: 50,
  },
  aiwiseText: {
    fontSize: 24,
    color: '#A88B69',
    fontWeight: 'bold',
  },
  wiseText: {
    color: '#FFFFFF',
  },
  schoolName: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  goldLine: {
    height: 2,
    backgroundColor: '#A88B69',
    marginVertical: 40,
    width: '100%',
  },
  certTitle: {
    fontSize: 12,
    color: '#3B2A1A',
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 40,
  },
  studentName: {
    fontSize: 36,
    color: '#3B2A1A',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Times-Bold',
  },
  nameUnderline: {
    height: 2,
    backgroundColor: '#A88B69',
    width: '60%',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  completionText: {
    fontSize: 12,
    color: '#3B2A1A',
    textAlign: 'center',
    marginBottom: 20,
  },
  courseTitle: {
    fontSize: 24,
    color: '#A88B69',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Times-Bold',
    paddingHorizontal: 50,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  signatureText: {
    fontSize: 22,
    fontFamily: 'Times-Italic',
    color: '#3B2A1A',
    marginBottom: 5,
  },
  signatureLine: {
    height: 1,
    backgroundColor: '#3B2A1A',
    width: 150,
    marginBottom: 5,
  },
  footerTitle: {
    fontSize: 10,
    color: '#A88B69',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  footerText: {
    fontSize: 10,
    color: '#3B2A1A',
  },
  centerBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  rightBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  watermark: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
  }
});

const CertificateDocument = ({ certificate, templateSrc, logoSrc }: any) => {
  const studentName = (certificate.user.name || certificate.user.email).toUpperCase();
  const dateStr = certificate.issuedAt.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const verifyUrl = `aiwise.school/verify/${certificate.verificationToken.substring(0, 8)}...`;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Background Image */}
        {templateSrc && <PdfImage src={templateSrc} style={styles.background} />}

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.aiwiseText}>AI<Text style={styles.wiseText}>WISE</Text></Text>
            <Text style={styles.schoolName}>GEMS Our Own High School, Al Warqa'a</Text>
            {logoSrc ? <PdfImage src={logoSrc} style={styles.logo} /> : <View style={styles.logo} />}
          </View>

          <View style={styles.goldLine} />

          {/* Body */}
          <Text style={styles.certTitle}>THIS CERTIFICATE IS PROUDLY AWARDED TO</Text>
          
          <Text style={styles.studentName}>{studentName}</Text>
          <View style={styles.nameUnderline} />

          <Text style={styles.completionText}>for successfully completing the curriculum and requirements of:</Text>
          
          <Text style={styles.courseTitle}>{certificate.course.title}</Text>

          {/* Footer absolute positioning inside container isn't great, let's use flex */}
          <View style={{ flexGrow: 1 }} />
          
          <View style={{ height: 1, backgroundColor: '#A88B69', width: '100%', marginBottom: 20 }} />

          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureText}>S. Thomas</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.footerTitle}>Authorized By:</Text>
              <Text style={styles.footerText}>Sanjeev Thomas, Principal</Text>
            </View>

            <View style={styles.centerBlock}>
              <Text style={styles.footerTitle}>Date of Issue</Text>
              <Text style={styles.footerText}>{dateStr}</Text>
            </View>

            <View style={styles.rightBlock}>
              <Text style={styles.footerTitle}>Verify this certificate at:</Text>
              <Text style={styles.footerText}>{verifyUrl}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.watermark}>Certificate ID: {certificate.id}</Text>
      </Page>
    </Document>
  );
};

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
    const templatePath = path.join(process.cwd(), 'public', 'certificate_template.png');
    const logoPath = path.join(process.cwd(), 'public', 'al_warqaa_logo.png');

    const templateSrc = fs.existsSync(templatePath) ? 'data:image/png;base64,' + fs.readFileSync(templatePath).toString('base64') : null;
    const logoSrc = fs.existsSync(logoPath) ? 'data:image/png;base64,' + fs.readFileSync(logoPath).toString('base64') : null;

    const pdfBuffer = await renderToBuffer(
      <CertificateDocument 
        certificate={certificate} 
        templateSrc={templateSrc} 
        logoSrc={logoSrc} 
      />
    );

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AIWISE_Certificate_${certificate.id.substring(0, 8)}.pdf"`,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to generate certificate', details: String(err) }, { status: 500 });
  }
}
