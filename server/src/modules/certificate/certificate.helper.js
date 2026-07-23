const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const generateQRCodeBuffer = async (text) => {
  try {
    return await QRCode.toBuffer(text, {
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff',
      },
    });
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

const generateCertificatePDF = async (data) => {
  const {
    volunteerName,
    programName,
    organization,
    volunteerHours,
    completionDate,
    certificateNumber,
    authorizedSignatory,
    verificationUrl,
    description,
    skillsEarned,
  } = data;

  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
  const buffers = [];

  doc.on('data', (chunk) => buffers.push(chunk));

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const contentWidth = pageWidth - 200;
  const startX = 100;

  doc.rect(30, 30, pageWidth - 60, pageHeight - 60).lineWidth(4).stroke('#1a1a2e');
  doc.rect(36, 36, pageWidth - 72, pageHeight - 72).lineWidth(1).stroke('#d4af37');

  doc
    .fontSize(36)
    .font('Helvetica-Bold')
    .fillColor('#1a1a2e')
    .text('CERTIFICATE OF COMPLETION', startX, 70, { align: 'center', width: contentWidth });

  doc.moveDown(0.8);

  if (description) {
    doc
      .fontSize(12)
      .font('Helvetica-Oblique')
      .fillColor('#555555')
      .text(description, startX, null, { align: 'center', width: contentWidth });
    doc.moveDown(0.6);
  }

  doc
    .fontSize(14)
    .font('Helvetica')
    .fillColor('#333333')
    .text('This is to certify that', startX, null, { align: 'center', width: contentWidth });

  doc.moveDown(0.6);

  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .fillColor('#1a1a2e')
    .text(volunteerName || 'Volunteer', startX, null, { align: 'center', width: contentWidth });

  doc.moveDown(0.6);

  doc
    .fontSize(14)
    .font('Helvetica')
    .fillColor('#333333')
    .text('has successfully completed the program', startX, null, { align: 'center', width: contentWidth });

  doc.moveDown(0.4);

  doc
    .fontSize(22)
    .font('Helvetica-Bold')
    .fillColor('#1a1a2e')
    .text(programName || 'Community Program', startX, null, { align: 'center', width: contentWidth });

  doc.moveDown(0.8);

  doc
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#555555')
    .text(`Organization: ${organization || 'Disha for India'}`, startX, null, { align: 'center', width: contentWidth });

  doc.text(`Volunteer Hours: ${volunteerHours ?? 0}`, startX, null, { align: 'center', width: contentWidth });
  doc.text(
    `Completion Date: ${new Date(completionDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
    startX,
    null,
    { align: 'center', width: contentWidth }
  );
  doc.text(`Certificate Number: ${certificateNumber}`, startX, null, { align: 'center', width: contentWidth });

  if (skillsEarned && skillsEarned.length > 0) {
    doc.text(`Skills: ${skillsEarned.join(', ')}`, startX, null, { align: 'center', width: contentWidth });
  }

  try {
    const qrBuffer = await generateQRCodeBuffer(verificationUrl);
    doc.image(qrBuffer, doc.page.width - 200, 260, { width: 120 });
  } catch (_qrError) {
    doc.fontSize(9).fillColor('#999999').text('QR Code unavailable', doc.page.width - 200, 280, { width: 120, align: 'center' });
  }

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#777777')
    .text(`Verify at: ${verificationUrl}`, 60, pageHeight - 90, { width: pageWidth - 280 });

  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .fillColor('#1a1a2e')
    .text('Authorized Signatory', 60, pageHeight - 130);

  doc
    .moveTo(60, pageHeight - 110)
    .lineTo(260, pageHeight - 110)
    .stroke('#1a1a2e');

  doc.font('Helvetica').fontSize(11).text(authorizedSignatory || 'Disha for India Team', 60, pageHeight - 90);

  doc
    .fontSize(9)
    .font('Helvetica')
    .fillColor('#888888')
    .text('Disha for India', startX, pageHeight - 55, { align: 'center', width: contentWidth });

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);
  });
};

const uploadBufferToCloudinary = async (buffer, folder, resourceType = 'auto') => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      const mime = resourceType === 'raw' ? 'application/pdf' : 'image/png';
      return `data:${mime};base64,${buffer.toString('base64')}`;
    }

    return await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result.secure_url);
        }
      ).end(buffer);
    });
  } catch (err) {
    console.warn('[uploadBufferToCloudinary] Falling back to Data URL:', err?.message);
    const mime = resourceType === 'raw' ? 'application/pdf' : 'image/png';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }
};

module.exports = {
  generateCertificatePDF,
  generateQRCodeBuffer,
  uploadBufferToCloudinary,
  cloudinary,
};
