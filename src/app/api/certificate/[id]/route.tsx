import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, Image as PdfImage, renderToBuffer, Svg, Circle, Line, Path, Polygon } from '@react-pdf/renderer';
import fs from 'fs';
import path from 'path';

// Note: React-PDF has standard fonts (Helvetica, Times-Roman) built-in, but we can also rely on the defaults.

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#0B1120', // darker slate for premium feel
    position: 'relative',
    color: '#F8FAFC',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  container: {
    flex: 1,
    padding: 30,
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid #38BDF8',
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    position: 'absolute',
    top: 30,
    left: '50%',
    transform: 'translateX(-40)', // roughly center an 80px image
    width: 80,
    height: 80,
    zIndex: 10,
  },
  certTitle: {
    fontSize: 22,
    color: '#38BDF8',
    textAlign: 'center',
    letterSpacing: 4,
    marginTop: 60,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  presentedTo: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  studentName: {
    fontSize: 40,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  schoolName: {
    fontSize: 16,
    color: '#38BDF8',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginTop: 5,
    marginBottom: 10,
  },
  classDetails: {
    fontSize: 12,
    color: '#38BDF8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  completionText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 15,
  },
  courseTitle: {
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  programmeSubtitle: {
    fontSize: 14,
    color: '#38BDF8',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  demonstratingText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 40,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    width: '80%',
    alignSelf: 'center',
    marginBottom: 15,
  },
  thinkVerifyUse: {
    fontSize: 12,
    color: '#F8FAFC',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 30,
  },
  footerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 'auto',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 10,
    color: '#64748B',
  },
  bottomNote: {
    fontSize: 9,
    color: '#475569',
    textAlign: 'center',
    marginTop: 10,
  }
});

const TechDoodles = () => (
  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
    <Svg height="595" width="842">
      {/* Enhanced circuit board lines */}
      <Path d="M 0 50 L 100 50 L 120 70 L 200 70" stroke="#38BDF8" strokeWidth="0.5" fill="none" opacity={0.4} />
      <Path d="M 842 100 L 750 100 L 700 150 L 650 150" stroke="#38BDF8" strokeWidth="0.5" fill="none" opacity={0.4} />
      <Path d="M 0 500 L 150 500 L 180 470 L 300 470" stroke="#38BDF8" strokeWidth="0.5" fill="none" opacity={0.4} />
      <Path d="M 842 450 L 750 450 L 720 480 L 600 480" stroke="#38BDF8" strokeWidth="0.5" fill="none" opacity={0.4} />
      
      {/* Circuit Nodes */}
      <Circle cx="200" cy="70" r="2" fill="#38BDF8" opacity={0.6} />
      <Circle cx="650" cy="150" r="2" fill="#38BDF8" opacity={0.6} />
      <Circle cx="300" cy="470" r="2" fill="#38BDF8" opacity={0.6} />
      <Circle cx="600" cy="480" r="2" fill="#38BDF8" opacity={0.6} />

      {/* Grid pattern elements */}
      <Line x1="40" y1="0" x2="40" y2="595" stroke="#38BDF8" strokeWidth="0.2" opacity={0.2} />
      <Line x1="80" y1="0" x2="80" y2="595" stroke="#38BDF8" strokeWidth="0.2" opacity={0.2} />
      <Line x1="802" y1="0" x2="802" y2="595" stroke="#38BDF8" strokeWidth="0.2" opacity={0.2} />
      <Line x1="762" y1="0" x2="762" y2="595" stroke="#38BDF8" strokeWidth="0.2" opacity={0.2} />

      {/* Crosshairs */}
      <Path d="M 40 40 L 50 40 M 45 35 L 45 45" stroke="#38BDF8" strokeWidth="0.5" opacity={0.5} />
      <Path d="M 802 40 L 792 40 M 797 35 L 797 45" stroke="#38BDF8" strokeWidth="0.5" opacity={0.5} />
      <Path d="M 40 555 L 50 555 M 45 550 L 45 560" stroke="#38BDF8" strokeWidth="0.5" opacity={0.5} />
      <Path d="M 802 555 L 792 555 M 797 550 L 797 560" stroke="#38BDF8" strokeWidth="0.5" opacity={0.5} />
      
      {/* Hexagons scattered */}
      <Polygon points="150,200 155,197 160,200 160,206 155,209 150,206" stroke="#38BDF8" strokeWidth="0.5" fill="none" opacity={0.4} />
      <Polygon points="680,350 685,347 690,350 690,356 685,359 680,356" stroke="#38BDF8" strokeWidth="0.5" fill="none" opacity={0.4} />
    </Svg>
  </View>
);

const CertificateDocument = ({ certificate, templateSrc, logoSrc }: any) => {
  const studentName = (certificate.user.name || certificate.user.email || 'Student').toUpperCase();
  const classDetails = (certificate.user.className || certificate.user.section)
    ? `Grade ${certificate.user.className || ''} | Section ${certificate.user.section || ''}`
    : `Grade [ ] | Section [ ]`;
  const dateStr = certificate.issuedAt.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {templateSrc && <PdfImage src={templateSrc} style={styles.background} fixed={true} />}
        
        <TechDoodles />

        {logoSrc && <PdfImage src={logoSrc} style={styles.logo} />}

        <View style={styles.container}>
          <Text style={styles.certTitle}>CERTIFICATE OF COMPLETION</Text>
          <Text style={styles.presentedTo}>This certificate is proudly presented to</Text>
          
          <Text style={styles.studentName}>{studentName}</Text>
          <Text style={styles.schoolName}>OUR OWN HIGH SCHOOL, AL WARQA'A</Text>
          <Text style={styles.classDetails}>{classDetails}</Text>
          
          <Text style={styles.completionText}>for successfully completing the</Text>
          <Text style={styles.courseTitle}>AI WISE @ OOW</Text>
          <Text style={styles.programmeSubtitle}>AI Literacy & Responsible Use Programme</Text>
          
          <Text style={styles.demonstratingText}>
            and demonstrating an understanding of AI awareness, ethics and responsible AI use.
          </Text>

          <View style={styles.divider} />
          
          <Text style={styles.thinkVerifyUse}>THINK • VERIFY • USE RESPONSIBLY</Text>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Date: {dateStr}</Text>
            <Text style={styles.footerText}>Certificate ID: {certificate.id}</Text>
          </View>
          
          <Text style={styles.bottomNote}>Digitally Generated Certificate | No Signature Required</Text>
        </View>
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
    let logoPath = path.join(process.cwd(), 'public', 'new_logo.png');
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(process.cwd(), 'public', 'al_warqaa_logo.png');
    }

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
