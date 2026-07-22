export const sendOtpSms = async (phone, otp) => {
  console.log(`\n========== SMS OTP ==========`);
  console.log(`To: ${phone}`);
  console.log(`OTP: ${otp}`);
  console.log(`This OTP is valid for 10 minutes`);
  console.log(`==============================\n`);
};
