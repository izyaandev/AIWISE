import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, Image as PdfImage, renderToBuffer, Font } from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';

// Note: React-PDF has standard fonts (Helvetica, Times-Roman) built-in, but we can also rely on the defaults.

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#0F172A', // dark slate
    position: 'relative',
    color: '#F8FAFC',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.1, // tech texture effect if they provide a texture
  },
  container: {
    flex: 1,
    padding: 40,
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid #38BDF8', // electric blue border
    margin: 20,
  },
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
  },
  aiwiseText: {
    fontSize: 32,
    color: '#38BDF8',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  wiseText: {
    color: '#F8FAFC',
  },
  schoolName: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  certTitle: {
    fontSize: 14,
    color: '#38BDF8',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 40,
    textTransform: 'uppercase',
  },
  studentName: {
    fontSize: 48,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  nameUnderline: {
    height: 1,
    backgroundColor: '#38BDF8',
    width: '80%',
    alignSelf: 'center',
    marginTop: 15,
    marginBottom: 40,
  },
  completionText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
  },
  courseTitle: {
    fontSize: 28,
    color: '#38BDF8',
    textAlign: 'center',
    fontWeight: 'bold',
    paddingHorizontal: 40,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
    borderTop: '1px solid #1E293B',
    paddingTop: 20,
  },
  signatureBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  signatureText: {
    fontSize: 24,
    color: '#F8FAFC',
    marginBottom: 10,
  },
  signatureLine: {
    height: 1,
    backgroundColor: '#38BDF8',
    width: 180,
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 9,
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  centerBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  watermark: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 9,
    color: '#334155',
    letterSpacing: 2,
    fontFamily: 'Courier',
  }
});

const CertificateDocument = ({ certificate, templateSrc, logoSrc }: any) => {
  const studentName = (certificate.user.name || certificate.user.email).toUpperCase();
  const dateStr = certificate.issuedAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* By adding fixed=true, React-PDF treats the image as a background without breaking flow */}
        {templateSrc && <PdfImage src={templateSrc} style={styles.background} fixed={true} />}

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.aiwiseText}>AI<Text style={styles.wiseText}>WISE</Text></Text>
            <Text style={styles.schoolName}>GEMS Our Own High School, Al Warqa'a</Text>
            {logoSrc ? <PdfImage src={logoSrc} style={styles.logo} /> : <View style={styles.logo} />}
          </View>

          {/* Body */}
          <Text style={styles.certTitle}>Certificate of Excellence</Text>
          
          <Text style={styles.studentName}>{studentName}</Text>
          <View style={styles.nameUnderline} />

          <Text style={styles.completionText}>HAS SUCCESSFULLY COMPLETED THE RIGOROUS REQUIREMENTS OF</Text>
          
          <Text style={styles.courseTitle}>{certificate.course.title}</Text>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureText}>S. Thomas</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.footerTitle}>Authorized By</Text>
              <Text style={styles.footerText}>Sanjeev Thomas, Principal</Text>
            </View>

            <View style={styles.centerBlock}>
              <Text style={styles.footerTitle}>Issue Date</Text>
              <Text style={styles.footerText}>{dateStr}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.watermark}>CERT_ID: {certificate.id}</Text>
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
