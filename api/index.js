import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";

const AES_KEY = "RTO@N@1V@$U2024#";
const ALG = "aes-128-ecb";

function encrypt(text) {
  const cipher = crypto.createCipheriv(ALG, Buffer.from(AES_KEY), null);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
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
  const { vehicle_number } = req.query;

  if (!vehicle_number)
    return res.json({ error: "Please provide ?vehicle_number=HR51AY5287" });

  try {
    const encrypted = encrypt(vehicle_number);
    const fd = new FormData();
    fd.append("4svShi1T5ftaZPNNHhJzig===", encrypted);

    const { data } = await axios.post(
      "https://rcdetailsapi.vehicleinfo.app/api/vasu_rc_doc_details",
      fd,
      { headers: fd.getHeaders() }
    );

    const dec = decrypt(data);
    const mobile = dec?.data?.[0]?.mobile_no;

    if (!mobile) return res.json({ error: "Details not found" });

    return res.json({
      success: true,
      result: {
        vehicle_no: vehicle_number.toUpperCase(),
        mobile_no: mobile,
        credit: "Bajrangi API",
        developer: "Bajrangi API"
      }
    });

  } catch {
    return res.json({ error: "API not working" });
  }
}
