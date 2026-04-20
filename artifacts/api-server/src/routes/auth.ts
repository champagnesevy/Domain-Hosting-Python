import { Router } from "express";

const router = Router();

const STUDENT_REPORT_PIN = process.env.STUDENT_REPORT_PIN ?? "1234";

router.post("/verify-pin", (req, res) => {
  const { pin } = req.body as { pin?: string };
  if (!pin) {
    res.status(400).json({ valid: false, message: "PIN is required" });
    return;
  }
  if (pin.trim() === STUDENT_REPORT_PIN) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false, message: "Incorrect PIN" });
  }
});

export default router;
