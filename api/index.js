import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";

const AES_KEY = "RTO@N@1V@$U2024#";
const ALG = "aes-128-ecb";

function encrypt(text) {
  try {
    const cipher = crypto.createCipheriv(ALG, Buffer.from(AES_KEY), null);
    cipher.setAutoPadding(true);
    let enc = cipher.update(text.trim(), "utf8", "base64");
    enc += cipher.final("base64");
    return enc;
  } catch (e) {
    return null;
  }
}

function decrypt(base64) {
  try {
    const decipher = crypto.createDecipheriv(ALG, Buffer.from(AES_KEY), null);
    decipher.setAutoPadding(true);
    let dec = decipher.update(base64, "base64", "utf8");
    dec += decipher.final("utf8");
    return JSON.parse(dec);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const number =
      req.query.vehicle_number ||
      req.query.num ||
      req.query.v ||
      req.query.no;

    if (!number) {
      return res.status(400).json({
        error: true,
        message:
          "Vehicle number missing — use ?vehicle_number=MH14DL1234",
        sample: req.url + "?vehicle_number=HR51AY5287",
      });
    }

    const encrypted = encrypt(number);
    if (!encrypted) return res.json({ error: "Encryption error" });

    const fd = new FormData();
    fd.append("4svShi1T5ftaZPNNHhJzig===", encrypted);

    const apiURL =
      "https://rcdetailsapi.vehicleinfo.app/api/vasu_rc_doc_details";

    const { data } = await axios.post(apiURL, fd, {
      headers: fd.getHeaders(),
      timeout: 20000,
    });

    const dec = decrypt(data);

    const mobile = dec?.data?.[0]?.mobile_no;

    if (!mobile) return res.status(404).json({ error: "Details not found" });

    return res.json({
      success: true,
      result: {
        vehicle_no: number.toUpperCase(),
        mobile_no: mobile,
        credit: "Bajrangi API",
        developer: "Bajrangi API",
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "API not working or Timeout",
    });
  }
}
