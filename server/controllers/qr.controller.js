const { generateQRCodeWithCard } = require("../services/qr.service");
const { uploadBase64Image } = require("../services/upload.service");
const Qrinfo = require("../models/qrinfo.models");

async function generateQR(req, res) {
  try {
    // 1️⃣ Get ID from query
    const id = req.query.id;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "ID is required" });
    }

    const timestamp = Date.now();

    // 2️⃣ Fetch data from DB
    const qrData = await Qrinfo.findOne({ customId: id });
    if (!qrData) {
      return res
        .status(404)
        .json({ success: false, message: "QR data not found" });
    }

    // 3️⃣ Data that will go inside QR
    const qr_send_data = `https://disloyal-poem.outray.app/data?id=${id}`;

    // 4️⃣ Data that will be printed on card
    const userInfo = {
      category: qrData.category,
      name: qrData.name,
      id: qrData.customId,
    };

    // 5️⃣ Generate QR + Card
    const { qrurl, cardImg } = await generateQRCodeWithCard(
      qr_send_data,
      userInfo,
    );

    // 6️⃣ Unique file names
    const qrFileName = `qr-${id}-${timestamp}`;
    const cardFileName = `card-${id}-${timestamp}`;

    // 7️⃣ Upload images
    const qrImageUrl = await uploadBase64Image(qrurl, "qr/onlyqr", qrFileName);

    const cardImageUrl = await uploadBase64Image(
      cardImg,
      "qr/card",
      cardFileName,
    );

    // 8️⃣ Save URLs in DB
    await Qrinfo.findOneAndUpdate(
      { customId: id },
      {
        onlyqrimg: qrImageUrl,
        imgurl: cardImageUrl,
      },
    );

    // 9️⃣ Return JSON instead of rendering EJS
    res.json({
      success: true,
      imgurls: {
        qrurl: qrImageUrl,
        cardImg: cardImageUrl,
      },
      customId: id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error generating QR" });
  }
}

module.exports = { generateQR };
