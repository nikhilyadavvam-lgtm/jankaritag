const QRCode = require("qrcode");
const sharp = require("sharp");
const path = require("path");

// 🔹 Create SVG text
function createTextSVG(text, x, y, fontSize = 24) {
  const safeText = String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;");

  return Buffer.from(`
    <svg width="800" height="600">
      <style>
        .text {
          fill: #000;
          font-size: ${fontSize}px;
          font-family: Arial, sans-serif;
        }
      </style>
      <text x="${x}" y="${y}" class="text">${safeText}</text>
    </svg>
  `);
}

// 🔹 Generate ID Card Image
async function generateIdCard(base64QrUrl, userInfo) {
  const templatePath = path.join(__dirname, "../jtag_template.png");

  const qrBuffer = Buffer.from(
    base64QrUrl.split(",")[1],
    "base64"
  );

  const categorySVG = createTextSVG(userInfo.category, 160, 265, 24);
  const nameSVG = createTextSVG(userInfo.name, 160, 320, 24);
  const idSVG = createTextSVG(userInfo.id, 160, 375, 24);

  const finalImage = await sharp(templatePath)
    .composite([
      {
        input: qrBuffer,
        top: 145,
        left: 615,
      },
      { input: categorySVG },
      { input: nameSVG },
      { input: idSVG },
    ])
    .png()
    .toBuffer();

  return `data:image/png;base64,${finalImage.toString("base64")}`;
}

// 🔹 Generate QR + Card
async function generateQRCodeWithCard(qrText, userInfo) {
  const qrDataUrl = await QRCode.toDataURL(qrText, {
    width: 340,
    margin: 2,
  });

  const cardImage = await generateIdCard(qrDataUrl, userInfo);

  return {
    qrurl: qrDataUrl,
    cardImg: cardImage,
  };
}

module.exports = {
  generateQRCodeWithCard,
};
