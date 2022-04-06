import QRCode from "qrcode"
export default async function GenarateQrCode (input:string) {
  try {
      const response = await QRCode.toDataURL(input);
      console.log(response)
      console.log("response yukarda")
      return response
  } catch (error) {
      console.log(error)
      return ""
  }

}