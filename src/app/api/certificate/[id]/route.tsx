import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, Image as PdfImage, renderToBuffer, Svg, Circle, Line, Path, Polygon } from '@react-pdf/renderer';
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
    width: 120,
    height: 120,
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

const TechDoodles = () => (
  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
    <Svg height="595" width="842">
      {/* Scattered dots */}
      <Circle cx="100" cy="100" r="2" fill="#38BDF8" opacity={0.5} />
      <Circle cx="120" cy="90" r="1.5" fill="#38BDF8" opacity={0.3} />
      <Circle cx="80" cy="110" r="1" fill="#38BDF8" opacity={0.6} />
      
      <Circle cx="700" cy="150" r="3" fill="#38BDF8" opacity={0.4} />
      <Circle cx="750" cy="450" r="2" fill="#38BDF8" opacity={0.5} />
      <Circle cx="150" cy="500" r="2" fill="#38BDF8" opacity={0.3} />
      
      {/* Abstract tech grid lines */}
      <Line x1="0" y1="80" x2="250" y2="80" stroke="#38BDF8" strokeWidth="0.5" opacity={0.3} />
      <Line x1="80" y1="0" x2="80" y2="200" stroke="#38BDF8" strokeWidth="0.5" opacity={0.3} />
      
      <Line x1="550" y1="520" x2="842" y2="520" stroke="#38BDF8" strokeWidth="0.5" opacity={0.3} />
      <Line x1="720" y1="350" x2="720" y2="595" stroke="#38BDF8" strokeWidth="0.5" opacity={0.3} />
      
      {/* Plus signs for targeting/tech aesthetic */}
      <Path d="M 500 120 L 510 120 M 505 115 L 505 125" stroke="#38BDF8" strokeWidth="1" opacity={0.6} />
      <Path d="M 150 350 L 160 350 M 155 345 L 155 355" stroke="#38BDF8" strokeWidth="1" opacity={0.6} />
      <Path d="M 650 250 L 656 250 M 653 247 L 653 253" stroke="#38BDF8" strokeWidth="1" opacity={0.5} />

      {/* Hexagons */}
      <Polygon points="730,80 740,75 750,80 750,90 740,95 730,90" stroke="#38BDF8" strokeWidth="0.5" fill="none" opacity={0.5} />
      <Polygon points="80,400 90,395 100,400 100,410 90,415 80,410" stroke="#38BDF8" strokeWidth="0.5" fill="none" opacity={0.5} />
    </Svg>
  </View>
);

const CertificateDocument = ({ certificate, templateSrc, logoSrc }: any) => {
  const studentName = (certificate.user.name || certificate.user.email).toUpperCase();
  const dateStr = certificate.issuedAt.toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* By adding fixed=true, React-PDF treats the image as a background without breaking flow */}
        {templateSrc && <PdfImage src={templateSrc} style={styles.background} fixed={true} />}

        <TechDoodles />

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
              <Text style={styles.signatureText}>Dr. A. Murthy</Text>
              <View style={styles.signatureLine} />
              <Text style={styles.footerTitle}>Authorized By</Text>
              <Text style={styles.footerText}>Dr. Anjuly Murthy, Principal</Text>
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
